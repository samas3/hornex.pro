
const $ = (i) => document.getElementById(i);
const $$ = (i) => document.getElementsByClassName(i);
const $_ = (i) => document.querySelector(i);
class HornexHack{
  constructor(){
    this.version = '1.6';
    this.config = {};
    this.default = {
      damageDisplay: true, // 是否启用伤害显示修改
      DDenableNumber: true, // 是否显示伤害数值而不是百分比（若可用）
      healthDisplay: true, // 是否启用血量显示
      disableChatCheck: true, // 是否禁用聊天内容检查
      autoRespawn: true // 是否启用自动重生
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
  }
  addChat(text, color='#ff00ff'){
    this.chatFunc(text, color);
  }
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
  moveElement(arr) {
    return arr.slice(-1).concat(arr.slice(0,-1))
  }
  loadStatus(){
      var div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.bottom = '40px';
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
      this.status.innerHTML = this.name;
      div.appendChild(this.status);
      setInterval(() => {
        colors = this.moveElement(colors);
        this.status.style.background = `linear-gradient(to right, ${colors.join(',')},${colors[0]})`
        this.status.style.backgroundClip = 'text';
      }, 100);
  }
  setStatus(content){
    this.status.innerHTML = content;
  }
  onload(){
    this.load();
    this.addChat(`${this.name} enabled!`);
    this.addChat('Type /help in chat box to get help');
    this.registerDie();
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
      this.addChat(`${item}: ${this.config[item]} (defaults to ${this.default[item]})`, '#ffffff');
    }
  }
  save(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      localStorage.setItem(`hh${item}`, this.config[item]);
    }
  }
  load(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      this.config[item] = localStorage.getItem(`hh${item}`);
      if(!localStorage.getItem(`hh${item}`)){
        this.config[item] = this.default[item];
      }
    }
  }
  getHelp(){
    this.addChat('List of commands:');
    this.addChat('/toggle <module> : toggles the specific module', '#ffffff');
    this.addChat('/list : lists all the modules and configs', '#ffffff');
    this.addChat('/help : show this help', '#ffffff');
    this.addChat('/server : get current server', '#ffffff');
    this.addChat('/wave : get current zone wave', '#ffffff');
  }
  getServer(){
    this.addChat(`Current server: ${server.substring(0, 2).toUpperCase()}${server[server.length - 1]}`);
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
        if(status.includes('Wave ')){
          this.addChat(`${name} Wave: ${status}`);
        }else{
          this.addChat(`${name} Wave: ${Math.round((100 + parseFloat(prog)) * 100) / 100}%`);
        }
        break;
      default:
        this.addChat('Not in Ultra/Super/Hyper zone')
    }
  }
  command2Arg(func, args){
    args = args.split(' ');
    if(args.length != 2){
      this.addChat('Args num not correct', '#ff7f50');
    }else{
      this[func](args[1]);
    }
  }
  registerDie(){
    this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var div = $_('body > div.score-overlay');
    var that = this;
    var observer = new this.MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == 'attributes') {
              var style = mutation.target.style;
              console.log(style);
              if(style.display != 'none' && that.isEnabled('autoRespawn')){
                that.respawn();
              }
            }
        });
    });
    observer.observe(div, {
        attributes: true,
        attributeFilter: ['style']
    });
  }
  respawn(){
    $_('body > div.score-overlay > div.score-area > div.btn.continue-btn').onclick();
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
      f = f - 0xed;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const BK = [
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "horne",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "getBigUint64",
    "Video\x20AD\x20success!",
    "pickedEl",
    "1167390UrVkfV",
    "pedoxMain",
    "workerAntFire",
    "onkeydown",
    "New\x20mob:\x20Dice.",
    "55078DZMiSD",
    "#ffe667",
    "oAngle",
    ".absorb-clear-btn",
    "Dark\x20Ladybug",
    "qCkBW5pcR8kD",
    ".chat",
    "writeText",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "gcldSq",
    "runSpeed",
    "Account\x20import/export\x20UI\x20redesigned.",
    "killsNeeded",
    ".leave-btn",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "data-icon",
    "hsl(110,100%,60%)",
    "show_scoreboard",
    "petalYobaEgg",
    "3rd\x20February\x202024",
    "#9fab2d",
    "New\x20petal:\x20Wig.",
    "orbitDance",
    "\x22></div>\x0a\x09</div>",
    ".player-list",
    ".builds-btn",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "hideTimer",
    "backgroundImage",
    "j[zf",
    "elongation",
    "RuinedLiberty",
    ".lb",
    "#709d45",
    "createImageData",
    "10QIdaPR",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "More\x20wave\x20changes:",
    "childIndex",
    "Honey\x20factory.",
    "isStatue",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "WRbjb8oX",
    "then",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "Added\x20banner\x20ads.",
    ".absorb-petals",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "#775d3e",
    "&quot;",
    "armor",
    "hasSpiderLeg",
    "Soldier\x20Ant",
    "gem",
    "m28",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "Nitro\x20Boost",
    "XCN6",
    "successCount",
    "Nigersaurus",
    "Sandstorm_2",
    "code",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "leaders",
    "Breaths\x20fire.",
    "usernameTaken",
    "/profile",
    "2357",
    ".scale-cb",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "Pet\x20Size\x20Increase",
    "petalLightning",
    "cantPerformAction",
    "drawChats",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "object",
    "petalSoil",
    ".tooltips",
    "/hqdefault.jpg)",
    "layin",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "reload",
    "tooltipDown",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "100%",
    "#7d5b1f",
    "url",
    "Sandstorm_6",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "web_",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "content",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "Regenerates\x20health\x20when\x20consumed.",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "#76ad45",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "#554213",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "#888",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "#a52a2a",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "Spider_4",
    "Hornet_4",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "Added\x20Global\x20Leaderboard.",
    "#82b11e",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "25th\x20June\x202023",
    "/s\x20if\x20H<50%",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "#555",
    "spiderCave",
    "petalSwastika",
    "#e05748",
    "nickname",
    "month",
    "size",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "col",
    "hsla(0,0%,100%,0.4)",
    ".build-save-btn",
    "renderBelowEverything",
    "spider",
    "Banana",
    "addGroupNumbers",
    "renderOverEverything",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "deltaY",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "putImageData",
    "KICKED!",
    "#5b4d3c",
    "*Super:\x20180",
    "clientX",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "title",
    ".super-buy",
    "Soldier\x20Ant_3",
    "shieldHpLosePerSec",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "Balancing:",
    "IAL\x20c",
    "*Cotton\x20health:\x209\x20→\x2010",
    "Removed\x20EU\x20#3.",
    "Fire\x20Duration",
    "<div\x20stroke=\x22",
    "*Rock\x20health:\x2045\x20→\x2050",
    "inventory",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "loggedIn",
    "sadT",
    "fonts",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "hasGem",
    "*Cement\x20health:\x2080\x20→\x20100",
    "display",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "24th\x20August\x202023",
    "\x20was\x20",
    "iGamble",
    "active",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "petalDmca",
    "lightningDmgF",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "other",
    "readyState",
    "#9e7d24",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "drops",
    "countTiers",
    "petalPincer",
    "KeyC",
    "getContext",
    "Air",
    "error",
    "lineWidth",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "27th\x20July\x202023",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "keyCode",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "affectMobHeal",
    "├─\x20",
    "0\x200",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "lobbyClosing",
    "Added\x20Shiny\x20mobs:",
    "<div\x20class=\x22petal-container\x22></div>",
    "quadraticCurveTo",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "waveStarting",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "*Rose\x20heal:\x2013\x20→\x2011",
    ".bar",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "projSpeed",
    "Heal\x20Affect\x20Duration",
    "New\x20score\x20formula.",
    "7th\x20August\x202023",
    ".main",
    "13th\x20July\x202023",
    "AS\x20#2",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "cDHZ",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "#c76cd1",
    "attachPetal",
    "petalRice",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "#323032",
    "updateT",
    "addToInventory",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "petalTurtle",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "deg)\x20scale(",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    ".absorb",
    "shlong",
    "Soldier\x20Ant_5",
    "updateTime",
    "ANKUAsHKW5LZmq",
    "*Rock\x20health:\x2060\x20→\x20120",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "%nick%",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "right_align_petals",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "lightningBouncesTiers",
    "Soldier\x20Ant_1",
    "dir",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "iMood",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "miter",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "kbps",
    "year",
    "iPercent",
    "KeyL",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "keys",
    "KeyR",
    "*Ultra:\x20125+",
    "KeyW",
    "startEl",
    ".gamble-petals-btn",
    "style",
    "#f7904b",
    "*Rock\x20health:\x20120\x20→\x20150",
    "Spider_6",
    "hsla(0,0%,100%,0.25)",
    "*Rock\x20health:\x2050\x20→\x2060",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "number",
    "querySelectorAll",
    "12th\x20November\x202023",
    "Crab\x20redesign.",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "http://localhost:8001/discord",
    "sprite",
    "#724c2a",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "makeMissile",
    "murdered",
    "body",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "parts",
    "WP4dWPa7qCklWPtcLq",
    "\x20+\x20",
    "%;left:",
    "target",
    "BrnPE",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "setTargetEl",
    "New\x20mob:\x20Furry.",
    "rgba(0,0,0,0.4)",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "yellow",
    "<div\x20class=\x22chat-text\x22></div>",
    "*Turtle\x20health\x20500\x20→\x20600",
    "isLightning",
    ".grid",
    "Iris",
    "Increased\x20Wave\x20mob\x20count.",
    ".dialog-content",
    "ui_scale",
    "globalCompositeOperation",
    "iChat",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "arrested\x20for\x20plagerism",
    "iReqAccountData",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "Web\x20Radius",
    "clientHeight",
    "Head",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "22nd\x20June\x202023",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "Failed\x20to\x20find\x20region.",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "lastResizeTime",
    "wss://us1.hornex.pro",
    "saved_builds",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "6fCH",
    "isStatic",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "show_bg_grid",
    "KeyX",
    "u\x20are",
    "webSize",
    "New\x20petal:\x20Sponge",
    "angleSpeed",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "#ab7544",
    "lightningBounces",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "petalerDrop",
    "abs",
    "Mob\x20",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "#fbdf26",
    "despawnTime",
    "EU\x20#1",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "Missile\x20Damage",
    "makeLadybug",
    ".tier-",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "offsetWidth",
    "isLightsaber",
    "22nd\x20July\x202023",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "\x20in\x20view\x20/\x20",
    "petalWeb",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "petalSuspill",
    "seed",
    "Fixed\x20another\x20craft\x20exploit.",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "*Epic:\x2075\x20→\x2065",
    "*Gas\x20health:\x20140\x20→\x20250",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "setValue",
    "12th\x20July\x202023",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "#4d5e56",
    "hsla(0,0%,100%,0.1)",
    "*Yoba\x20Egg\x20buff.",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    ".shop-btn",
    "#c69a2c",
    "hpRegenPerSecF",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    ".discord-btn",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "switched",
    "Invalid\x20username.",
    "bezierCurveTo",
    ".petal",
    "toLowerCase",
    "match",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    ".shop-info",
    "rgb(255,\x20230,\x2093)",
    "babyAntFire",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "server",
    "Fixed\x20Rice.",
    "#ffd800",
    "Changes\x20to\x20anti-lag\x20system:",
    "makeAntenna",
    "Extra\x20Speed",
    "(?:^|;\x5cs*)",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "\x20stroke=\x22",
    "outlineCount",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    ".show-scoreboard-cb",
    "#eeeeee",
    "Summons\x20the\x20power\x20of\x20wind.",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "stepPerSecMotion",
    "WOziW7b9bq",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    ".ultra-buy",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "avacado",
    "ame",
    "now",
    "ad\x20refresh",
    "#b5a24b",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "#3f1803",
    "Username\x20too\x20short!",
    "dev",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "ing\x20o",
    "doShow",
    "background",
    "drawShell",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "Common",
    "passiveBoost",
    "CCofC2RcTG",
    "mobSizeChange",
    "*Rock\x20health:\x20150\x20→\x20200",
    "uwu",
    "#8ac255",
    "2nd\x20October\x202023",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    ".lottery-rarities",
    "petalSkull",
    "#ebda8d",
    "Mushroom",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "settings",
    "Extra\x20Pickup\x20Range",
    "25th\x20August\x202023",
    "\x0a\x0a\x09\x09\x09",
    "pink",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "*Light\x20damage:\x2012\x20→\x2010",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "duration",
    "Beetle_6",
    "#D2D1CD",
    "Spider\x20Egg",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "consumeProjDamage",
    "ArrowDown",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "\x20$1",
    "none",
    "Kicked!\x20(reason:\x20",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "#c8a826",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "spawn_zone",
    "%;\x22\x20stroke=\x22",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "map",
    "#328379",
    "*Hyper:\x20175+",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "hide-scoreboard",
    "val",
    "Cement",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "(81*",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "reqFailed",
    "23rd\x20June\x202023",
    "misReflectDmgFactor",
    "iBreedTimer",
    "216hwguav",
    "\x20You\x20",
    "hasAbsorbers",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "iSwapPetal",
    "joinedGame",
    "Digit",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "*Cotton\x20health:\x207\x20→\x208",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "updateProg",
    "air",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "*Hyper:\x202%\x20→\x201%",
    "absorbDamage",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "Unknown\x20message\x20id:\x20",
    "Buffed\x20Lightsaber:",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "ladybug",
    "crafted",
    "dontExpand",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "isSupporter",
    "28th\x20December\x202023",
    ".builds\x20.dialog-content",
    "#efc99b",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "projAffectHealDur",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "progress",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "retardDuration",
    "#cfc295",
    "chain",
    "#962921",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "\x20and\x20",
    "Sandstorm",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "#854608",
    "encode",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "oPlayerY",
    "innerWidth",
    "#bbbbbb",
    "WARNING!",
    "day",
    "keyup",
    "bqpdUNe",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    ".chat-content",
    "open",
    "New\x20settings:\x20Low\x20quality.",
    "\x20XP",
    "petalMagnet",
    "arc",
    ".shake-cb",
    ".play-btn",
    "#b58500",
    "prototype",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "https://www.youtube.com/@FussySucker",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "poisonT",
    "honeyDmgF",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "petalRock",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "(reloading...)",
    "Added\x20video\x20ad.",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    ".expand-btn",
    "Ghost_3",
    "#dddddd",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "rgb(",
    "red",
    "M28",
    "Beetle\x20Egg",
    "iScore",
    "petalSnail",
    "505736AUGNoI",
    "shift",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "Server\x20side\x20performance\x20improvements.",
    "#a33b15",
    "flipDir",
    "reflect",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "?dev",
    "strokeStyle",
    "16th\x20September\x202023",
    "24th\x20July\x202023",
    "#111",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "Added\x20Leave\x20Game\x20button.",
    "yellowLadybug",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "Passively\x20regenerates\x20your\x20health.",
    ".settings-btn",
    "13th\x20February\x202024",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "cactus",
    "focus",
    "petalSunflower",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "Spider_1",
    "7th\x20October\x202023",
    "test",
    "toLow",
    "No\x20username\x20provided.",
    "neutral",
    "style=\x22background-position:\x20",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "Peas",
    "localId",
    "Neowm",
    "#cfcfcf",
    "Yoba_6",
    "*Pincer\x20damage:\x205\x20→\x206",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "Rock_3",
    "atan2",
    ".collected-petals",
    "rgb(126,\x20239,\x20109)",
    "hoq5",
    "#97782b",
    "show",
    "11th\x20July\x202023",
    "*Reduced\x20mob\x20count.",
    "isHudPetal",
    "*Arrow\x20damage:\x204\x20→\x205",
    "#c1ab00",
    "targetPlayer",
    "petalRose",
    "waveNumber",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "Added\x20Waveroom:",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "WP10rSoRnG",
    "Orbit\x20Dance",
    "#bebe2a",
    "imageSmoothingEnabled",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "ount\x20",
    "des",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "readAsText",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "petalIris",
    ".absorb-rarity-btns",
    "#c1a37d",
    "tile_",
    "toFixed",
    "Pollen",
    "https://ipapi.co/json/",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "Failed\x20to\x20get\x20userCount!",
    "tier",
    "Shrinker",
    "position",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "s...)",
    "ArrowRight",
    "https://stats.hornex.pro/api/userCount",
    "strok",
    "hsla(0,0%,100%,0.3)",
    "Yoba_5",
    ".privacy-btn",
    "*Opening\x20Lottery",
    "Leaf",
    "#38c75f",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "center",
    "*Bone\x20armor:\x208\x20→\x209",
    ".absorb\x20.dialog-content",
    "has\x20ended.",
    "level",
    "kicked",
    "Heal",
    "userAgent",
    "*Fire\x20damage:\x209\x20→\x2015",
    "Tiers",
    "Web",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "rgba(0,\x200,\x200,\x200.2)",
    "New\x20mob:\x20Tumbleweed.",
    "tail",
    "#363685",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    ".total-accounts",
    "3rd\x20July\x202023",
    "location",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    ".level",
    "drawImage",
    "respawnTimeTiers",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "4th\x20September\x202023",
    "LavaWater",
    "splice",
    ".build-petals",
    "filter",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "asdfadsf",
    "New\x20mob:\x20Turtle",
    "anti_spam",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "3WRI",
    "Invalid\x20account!",
    "Lvl\x20",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "#fff0b8",
    "discord\x20err:",
    "outdatedVersion",
    ".waveroom-info",
    "length",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "https://www.youtube.com/@KePiKgamer",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "New\x20mob:\x20M28.",
    "#8d9acc",
    "#ffd941",
    "13th\x20September\x202023",
    ".ad-blocker",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "4th\x20April\x202024",
    "canvas",
    "\x20domain=.hornex.pro",
    "Game",
    "iLeaveGame",
    "Rock_1",
    "rgb(237\x2061\x20234)",
    "right",
    "entRot",
    "Ladybug",
    "split",
    "5th\x20January\x202024",
    "5th\x20July\x202023",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "Missile",
    "19th\x20January\x202024",
    "WP/dQbddHH0",
    "Pincer",
    "agroRangeDec",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "*Powder\x20health:\x2010\x20→\x2015",
    "altKey",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    ".max-score",
    "Invalid\x20mob\x20name:\x20",
    "lighter",
    "connectionIdle",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "rgb(255,\x2043,\x20117)",
    "Spawns",
    "Preroll\x20state:\x20",
    "Passively\x20regenerates\x20shield.",
    "Level\x20",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "d.\x20Pr",
    "Reduced\x20mobile\x20UI\x20scale.",
    "New\x20mob:\x20Mushroom.",
    ".collected",
    "getElementById",
    "hasSwastika",
    "<div>",
    ".petal.empty",
    "nAngle",
    "New\x20mob:\x20Snail.",
    ".lottery-btn",
    "#a2eb62",
    "breedPower",
    ".credits-btn",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "class=\x22chat-cap\x22",
    "Mob\x20Size\x20Change",
    "https://discord.gg/zZsUUg8rbu",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "yoba",
    "petals!",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "<div><span\x20stroke=\x22",
    "cuYF",
    "uiY",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    ".dc-group",
    "#f2b971",
    "></div>",
    "cookie",
    "hsl(110,100%,10%)",
    "#cecfa3",
    "onload",
    "W6rnWPrGWPfdbxmAWOHa",
    "button",
    ".time-alive",
    "cloneNode",
    "#cdbb48",
    "jellyfish",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "*Rice\x20damage:\x205\x20→\x204",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "deadT",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    ".checkbox",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "toDataURL",
    "points",
    "Ghost_4",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "worldH",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "continent_code",
    "removeT",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "5th\x20August\x202023",
    "#A8A7A4",
    "identifier",
    "#b0c0ff",
    "Congratulations!",
    "accountId",
    "pickupRange",
    ".no-btn",
    "oncontextmenu",
    "#eee",
    "pedox",
    "KCsdZ",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "KeyG",
    ".stat-value",
    "Expander",
    "fovFactor",
    "dmca\x20it\x20m28!",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "defineProperty",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "#4040fc",
    "drawIcon",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "https://www.youtube.com/@IAmLavaWater",
    "fireTime",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "Username\x20too\x20big!",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "Enter",
    "e\x20bee",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "Q2mA",
    "isDevelopmentMode",
    "Sponge",
    "#d3d14f",
    "show_clown",
    "antennae",
    "*Unsual:\x2025\x20→\x2010",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "onmouseup",
    "isPoison",
    "Dragon_6",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "1st\x20August\x202023",
    "iWithdrawPetal",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "copyright\x20striked",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "centipedeBodyDesert",
    "20th\x20June\x202023",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "#333333",
    "hornex.pro",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "hsla(0,0%,100%,0.15)",
    "dontPushTeam",
    "*Ultra:\x201-5",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "Starfish",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "iCraft",
    "31st\x20July\x202023",
    "mouse2",
    "petalAntEgg",
    "\x20(Lvl\x20",
    "mood",
    "W43cOSoOW4lcKG",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "reset",
    "ondragover",
    "1841224gIAuLW",
    "cmk+c0aoqSoLWQrQW6Tx",
    "bolder\x2017px\x20",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "type",
    "petal_",
    "isPassiveAggressive",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "petalBasic",
    "Added\x20Shop.",
    "petalSpiderEgg",
    "Cactus",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "#400",
    "evenodd",
    "wss://",
    "#feffc9",
    "KeyF",
    ".key-input",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "Pill",
    ".player-list-btn",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "breedTimerAlpha",
    ".show-bg-grid-cb",
    "\x22></span></div>\x0a\x09</div>",
    "23rd\x20January\x202024",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "rgb(81\x20121\x20251)",
    "timePlayed",
    "l\x20you",
    "useTimeTiers",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    ".grid-cb",
    "update",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "Increased\x20shiny\x20mob\x20size.",
    "spawnOnDie",
    ".level-progress",
    "Ant\x20Hole",
    ".max-wave",
    "blur",
    ".textbox",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "VLa2",
    "#347918",
    "📜\x20",
    "moveTo",
    "dontUiRotate",
    "sizeIncrease",
    "hide-zone-mobs",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "transformOrigin",
    "dur",
    "#ceea33",
    "Increases\x20flower\x27s\x20health\x20power.",
    "scale",
    "#cccccc",
    "#543d37",
    "tumbleweed",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "stayIdle",
    "<option\x20value=\x22",
    "7th\x20July\x202023",
    "Goofy\x20little\x20wanderer.",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "petalTaco",
    "mobId",
    "1px",
    "\x20downloaded!",
    "spotPath_",
    "Fire",
    "petalShell",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "#8a6b1f",
    "petalLight",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "shootLightning",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "addEventListener",
    "6th\x20August\x202023",
    "#cf7030",
    "*Peas\x20health:\x2020\x20→\x2025",
    ".builds",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    ".anti-spam-cb",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "centipedeBody",
    ".player-list\x20.dialog-content",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "application/json",
    "marginBottom",
    "Epic",
    "Desert\x20Centipede",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "#aaaaaa",
    "Boomerang.",
    "Heavy",
    "scrollHeight",
    "#f55",
    "8th\x20August\x202023",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "scale2",
    "isPlayer",
    "maxTimeAlive",
    ".absorb-petals-btn",
    "gambleList",
    "rgba(0,0,0,0.1)",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "nice\x20stolen\x20florr\x20assets",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "ghost",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "/dlMob",
    "Hornet_1",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "Fixed\x20Gem\x20glitch.",
    "Re-added\x20Waves.",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "Honey",
    "Copied!",
    "Pacman",
    "spawn",
    ".download-btn",
    "playerList",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "centipedeHeadDesert",
    "connect",
    "#bc0000",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    ".settings",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "strokeRect",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "#d6b936",
    "KeyV",
    "babyAnt",
    "User\x20not\x20found.",
    "classList",
    "passive",
    "Rare",
    "petalFire",
    "#cfbb50",
    "Invalid\x20petal\x20name:\x20",
    "waveEnding",
    "isSwastika",
    "isDead",
    "armorF",
    "85nqUVEy",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "#2da14d",
    "moveFactor",
    "10th\x20August\x202023",
    "*Banana\x20health:\x20170\x20→\x20400",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "zvNu",
    "isBae",
    "targetEl",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "createObjectURL",
    ".zone-name",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "New\x20mob:\x20Pedox",
    "Added\x20Discord\x20login.",
    "fossil",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "7th\x20February\x202024",
    "16th\x20June\x202023",
    "Sandstorm_5",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "Unusual",
    "#fcdd86",
    "Rock_2",
    "#a82a00",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "#d3c66d",
    "*Super:\x205-15",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "keyInvalid",
    "#222",
    "petalStarfish",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "clientY",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "Getting\x20",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "nerd",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "poisonDamage",
    "Dragon\x20Egg",
    "motionKind",
    "ShiftRight",
    "append",
    "shop",
    "Hyper",
    "*Legendary:\x20125\x20→\x20100",
    "New\x20mob:\x20Beehive.",
    "New\x20mob:\x20Spider\x20Cave.",
    ".hide-chat-cb",
    "oceed",
    "#454545",
    "2090768fiNzSa",
    "Cotton",
    "restore",
    "spin",
    "iReqUserProfile",
    "#000000",
    "rnex.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    ".find-user-btn",
    "activeElement",
    "thirdEye",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "scorpion",
    "offsetHeight",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "#b05a3c",
    "*Bone\x20armor:\x205\x20→\x206",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "s\x20can",
    "#634002",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "weight",
    "1st\x20July\x202023",
    "antHoleFire",
    "9iYdxUh",
    "i\x20make\x20cool\x20videos",
    "KeyD",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "descColor",
    "Statue",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    ".swap-btn",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "close",
    "fillText",
    "Chromosome",
    ".keyboard-cb",
    "twirl",
    "Halo",
    "getFloat32",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "sandstorm",
    "Tumbleweed",
    "Basic",
    "\x22></div>",
    "xgMol",
    "transition",
    "Added\x201\x20more\x20EU\x20lobby.",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "breedRange",
    ".sad-btn",
    "Dragon_2",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "Fire\x20Ant\x20Hole",
    "mousedown",
    ".progress",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "14th\x20July\x202023",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "3m^(",
    "buffer",
    "honeyDmg",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "shieldRegenPerSecF",
    "*Snail\x20health:\x2040\x20→\x2045",
    "22nd\x20January\x202024",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "wasDrawn",
    "beaten\x20to\x20death",
    "eyeY",
    "warne",
    "turtle",
    "consumeProjDamageF",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "petalNitro",
    "push",
    "17th\x20June\x202023",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "bee",
    "toggle",
    "string",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "Makes\x20you\x20poisonous.",
    "started!",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "#39b54a",
    "hit.p",
    "addCount",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "slice",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "Stickbug",
    "Bone",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    ".ui-scale\x20select",
    "*Peas\x20damage:\x208\x20→\x2010",
    "10th\x20July\x202023",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "19th\x20July\x202023",
    "adplayer-not-found",
    "Sprite",
    "Scorpion\x20redesign.",
    "icBdNmoEta",
    "Nerfs:",
    ".mob-gallery",
    "devicePixelRatio",
    "clipboard",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "US\x20#1",
    "rotate",
    "petHealthFactor",
    "isAggressive",
    "ceil",
    "\x20pxls)\x20/\x20",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "marginTop",
    "queenAnt",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "mobKilled",
    "translate(-50%,",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "Luxurious\x20mansion\x20of\x20ants.",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "exp",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "release",
    "petalWing",
    "WPfQmmoXFW",
    "mobile",
    ".joystick-knob",
    "nt.\x20H",
    "21st\x20July\x202023",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "consumeProjHealthF",
    "Buffs:",
    "%/s",
    "data",
    "onclick",
    "\x20by",
    "Health\x20Depletion",
    "ready",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "[2tB",
    "Poison",
    "Poop\x20colored\x20Ladybug.",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "lastElementChild",
    "dSk+d0afnmo5WODJW6zQxW",
    ".shop-overlay",
    "#fbb257",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "absorb",
    ".censor-cb",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "fireDamage",
    "pathSize",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "next",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "hsl(60,60%,60%)",
    "23rd\x20July\x202023",
    "Gem",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "onclose",
    "bush",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "rando",
    "#3db3cb",
    "rotate(",
    "Ultra",
    "wss://hornex-",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "Avacado",
    "rgb(31,\x20219,\x20222)",
    ".right-align-petals-cb",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "19th\x20June\x202023",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "Fixed\x20players\x20pushing\x20eachother.",
    "#5ef64f",
    "join",
    "consumeProjHealth",
    "rgb(222,\x2031,\x2031)",
    "Yoba_2",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "makeSponge",
    "petSizeIncrease",
    "FSoixsnA",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "setUserCount",
    "petalArrow",
    "INPUT",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "progressEl",
    "Antennae",
    "baseSize",
    "Elongation",
    "#fc5c5c",
    "gridColumn",
    ".helper-cb",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "27th\x20June\x202023",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "lient",
    "onchange",
    "#7d893e",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "#7d5098",
    "719574lHbJUW",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "n\x20war",
    "dandelion",
    "p41E",
    "Rose",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "Poisonous\x20gas.",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "drawArmAndGem",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "\x20online)",
    ".petal-count",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "petalDrop",
    "wig",
    ".zone-mobs",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "Coffee",
    "acker",
    "pro",
    "changelog",
    "\x20won\x20and\x20got\x20extra",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    ".rewards",
    "spikePath",
    "numeric",
    "translate(-50%,\x20",
    "wss://eu1.hornex.pro",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "#882200",
    "random",
    "json",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "Dragon_3",
    "purple",
    "glbData",
    "Lightsaber",
    ".discord-user",
    "parentNode",
    "Ghost_7",
    "userProfile",
    ".xp",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "Yoba_3",
    "<div\x20class=\x22spinner\x22></div>",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "Server-side\x20optimizations.",
    "*Snail\x20health:\x2045\x20→\x2050",
    ".export-btn",
    "static",
    "%!Ew",
    "Petal\x20Slots",
    "getUint32",
    "top",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "rgb(222,111,44)",
    "Soil",
    ".joystick",
    "Breed\x20Strength",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "Dragon_4",
    ".lottery-winner",
    "sk.",
    "clearRect",
    ".dismiss-btn",
    "hasHearts",
    "canRemove",
    "draw",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "as_ffa2",
    "fixed_name_size",
    "byteLength",
    "stickbug",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "scrollTop",
    "curePoison",
    "Petal\x20Weight",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "*Bone\x20armor:\x204\x20→\x205",
    "rgba(0,0,0,0.08)",
    "nProg",
    "772972vTKDnX",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "Poison\x20Reduction",
    "setUint8",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "catch",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "powderPath",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "text",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "zmkhtdVdSq",
    "Hornet_2",
    "oSize",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "Fixed\x20another\x20crafting\x20exploit.",
    "unknown",
    "Provide\x20a\x20name\x20dummy.",
    "isPetal",
    ".mob-gallery\x20.dialog-content",
    "starfish",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "as_ffa1",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "trim",
    "2nd\x20August\x202023",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "orbitRange",
    "Missile\x20Poison",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "endsWith",
    "onopen",
    "└─\x20",
    "doLerpEye",
    ".login-btn",
    "WR7cQCkf",
    "advanced\x20to\x20number\x20",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "Jellyfish",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "Ghost",
    ";\x20-o-background-position:",
    "Bounces",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "Swastika",
    "portalPoints",
    "petalStick",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "titleColor",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "keyAlreadyUsed",
    "ur\x20pe",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "petalFaster",
    "Skull",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "sort",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "web",
    "running...",
    "petDamageFactor",
    "(auto\x20reloading\x20in\x20",
    "Spider\x20Legs",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "Wave\x20",
    "click",
    "Poop\x20Damage",
    "Gives\x20you\x20a\x20shield.",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "Petals",
    "flowerPoison",
    ".id-group",
    "statue",
    "respawnTime",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "setUint32",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "bone",
    "<div\x20",
    "Error\x20refreshing\x20ad.",
    "left",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "have\x20",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "sameTypeColResolveOnly",
    ".player-count",
    "OQM)",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "portal",
    "localStorage\x20denied.",
    "WP3dRYddTJC",
    "furry",
    ".common",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "Temporary\x20Extra\x20Speed",
    "toLocaleDateString",
    "nLrqsbisiv0SrmoD",
    "Antidote",
    "Nerfed\x20Ant\x20Holes:",
    "createPattern",
    "1998256OxsvrH",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "User\x20not\x20found!",
    "shell",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "hypot",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "ontouchend",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "6th\x20July\x202023",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    ".damage-cb",
    "isFakeChat",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "</div><div\x20class=\x22log-line\x22></div>",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    ".close-btn",
    "ICIAL",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "curve",
    "spawnOnHurt",
    ".low-quality-cb",
    "Slowness\x20Duration",
    "Rock_5",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "<span\x20style=\x22color:",
    "petalExpander",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "strokeText",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "\x22></span></div>",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "Craft\x20rate\x20change:",
    "\x27s\x20profile...",
    "Importing\x20data\x20file:\x20",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "slayed",
    "DMCA-ed",
    "petalBubble",
    ".reload-btn",
    "translate",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "Decreases",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "Taco",
    "swapped",
    "absorbPetalEl",
    "projDamage",
    "setPos",
    "petRoamFactor",
    "blur(10px)",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "bqpdSW",
    "boostStrength",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "petalLightsaber",
    "username",
    "Zert",
    "hasEars",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "petalDandelion",
    "<div\x20class=\x22petal-icon\x22\x20",
    "redHealth",
    "blue",
    "#f22",
    "Poop\x20Health",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "barEl",
    "keyClaimed",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "Added\x202\x20US\x20lobbies.",
    "replace",
    ".gamble-prediction",
    "children",
    "shiftKey",
    "bruh",
    "Faster",
    "Sandstorm_1",
    ".petal-rows",
    "4th\x20August\x202023",
    "New\x20rarity:\x20Hyper.",
    "Honey\x20Range",
    "Lightning",
    "Very\x20sussy\x20data!",
    "New\x20mob:\x20Fossil.",
    ".watch-ad",
    "craft-disable",
    "New\x20mob:\x20Sponge",
    "dice",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "?v=",
    "marginLeft",
    "#555555",
    "Light",
    ".minimap-cross",
    "setUint16",
    "26th\x20July\x202023",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "15th\x20July\x202023",
    "#393cb3",
    "eu_ffa2",
    "setTargetByEvent",
    "floor",
    ".username-input",
    "Passive\x20Shield",
    "#000",
    "rgba(0,\x200,\x200,\x200.15)",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "iSwapPetalRow",
    "14dafFDX",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".petals-picked",
    "petalPoo",
    "substr",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "NHkBqi",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "fixAngle",
    "lineJoin",
    "beehive",
    "Added\x20Waves.",
    "fillStyle",
    "#d43a47",
    "12OVuKwi",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "updatePos",
    "<div\x20class=\x22dialog\x20tier-",
    "healthIncreaseF",
    "Sandstorm_3",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "Spider\x20Yoba",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "disabled",
    ".changelog-btn",
    "petalPea",
    "9th\x20August\x202023",
    "hostn",
    ".stats\x20.dialog-header\x20span",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "fromCharCode",
    "height",
    "Sussy\x20Discord\x20uwu",
    "Shell",
    "ages.",
    "#222222",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "B4@J",
    "0@x9",
    ".lottery-timer",
    "isPet",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "Wave\x20changes:",
    "desktop",
    "/dlSprite",
    "setAttribute",
    "#a17c4c",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "Reduced\x20Wave\x20duration.",
    "eu_ffa1",
    "ontouchstart",
    "<div\x20class=\x22btn\x20tier-",
    "hasHalo",
    "finally",
    ".fixed-name-cb",
    "=([^;]*)",
    "Heavier\x20than\x20your\x20mom.",
    "It\x20burns.",
    "width",
    "opacity",
    "bubble",
    "*They\x20give\x2010x\x20score.",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "moveSpeed",
    "span",
    ".discord-avatar",
    "abeQW7FdIW",
    "petalShrinker",
    "rgb(77,\x2082,\x20227)",
    ".global-user-count",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "start",
    "W5bKgSkSW78",
    "spinSpeed",
    "hasAntenna",
    "Flower\x20#",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "isRectHitbox",
    "#368316",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "*Halo\x20now\x20stacks.",
    "sponge",
    "It\x20likes\x20to\x20dance.",
    "wave",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    ".lb-btn",
    "%\x20success\x20rate",
    "*Banana\x20damage:\x201\x20→\x202",
    "rkJNdF",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "***",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "Even\x20more\x20wave\x20changes:",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "iCheckKey",
    "cos",
    "fontFamily",
    "Beetle_3",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "repeat",
    "from",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "Yourself",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "\x5c$1",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "pow",
    "*Arrow\x20damage:\x203\x20→\x204",
    "Flower\x20Health",
    "oPlayerX",
    "𐐿𐐘𐐫𐑀𐐃",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "poopPath",
    "projHealth",
    "Added\x20level\x20up\x20reward\x20table.",
    "3rd\x20August\x202023",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "15th\x20August\x202023",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "https://www.instagram.com/zertalious",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "enable_kb_movement",
    "Waveroom",
    ".stats",
    "show_damage",
    "#4eae26",
    ".active",
    "side",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "bsorb",
    "#1ea761",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "*Fire\x20health:\x2070\x20→\x2080",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "tierStr",
    "petalSand",
    "tCkxW5FcNmkQ",
    "hornex",
    "hideUserCount",
    "unnamed",
    "rgb(43,\x20255,\x20163)",
    "projAngle",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "#38c125",
    "fixed",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "queenAntFire",
    "bolder\x2025px\x20",
    "onmouseleave",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "#69371d",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "Press\x20G\x20to\x20toggle\x20grid.",
    ".absorb-btn\x20.tooltip\x20span",
    "deadPreDraw",
    "mushroomPath",
    ".flower-stats",
    "#333",
    "WP4hW755jCokWRdcKchdT3ui",
    "wss://eu2.hornex.pro",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "Added\x20maze\x20in\x20Waveroom:",
    ".lottery\x20.dialog-content",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "show_helper",
    "Guardian",
    "#416d1e",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "Dahlia",
    "uiX",
    "*Gas\x20health:\x20250\x20→\x20200",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "#34f6ff",
    "dispose",
    "^F[@",
    "flowerPoisonF",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "fixedSize",
    "Added\x201\x20AS\x20lobby.",
    "honeyTile",
    ".inventory-btn",
    "4oL8",
    ".tabs",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "3YHM",
    ".reload-timer",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "petHealF",
    "files",
    "cacheRendered",
    "containerDialog",
    "value",
    "_blank",
    "1Jge",
    "#e0c85c",
    "toUpperCase",
    "our\x20o",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    ".container",
    "petalsLeft",
    "tals.",
    ".craft-btn",
    "avatar",
    "ned.\x22",
    "WR7dPdZdQXS",
    "eu_ffa",
    "27th\x20February\x202024",
    "us_ffa1",
    "prepend",
    "3L$0",
    "<div\x20style=\x22color:\x20",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    ".changelog\x20.dialog-content",
    "<div\x20class=\x22chat-name\x22></div>",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "#b52d00",
    "regenAfterHp",
    "#8ac355",
    "Rock",
    ".circle",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "sign",
    ".connecting",
    "\x20no-icon\x22\x20",
    "[F]\x20Show\x20Hitbox:\x20",
    "6th\x20September\x202023",
    "small\x20full",
    "Added\x20Lottery.",
    "Wave\x20Ending...",
    "setCount",
    "15th\x20June\x202023",
    "destroyed",
    "dragon",
    "#32a852",
    "26th\x20June\x202023",
    "{background-color:",
    "Third\x20Eye",
    "Ancester\x20of\x20flowers.",
    "off",
    "beginPath",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "Checking\x20username\x20availability...",
    "\x22></span>",
    "scale(",
    ".\x22></span></div>",
    "beetle",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "innerHTML",
    "ears",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "Saved\x20Build\x20#",
    "petalDrop_",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "Sandbox",
    "\x20at\x20least!",
    ".featured",
    "Dice",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "Nigerian\x20Ladybug.",
    "New\x20mob:\x20Dragon\x20Nest.",
    ".pro",
    "Yoba",
    "nick",
    "usernameClaimed",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "Hornet\x20Egg",
    "Increased\x20Ultra\x20key\x20price.",
    "soldierAntFire",
    "[data-icon]",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "--angle:",
    "healthF",
    "A\x20default\x20petal.",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "Damage\x20Reflection",
    "dontResolveCol",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "#ff7380",
    ".inventory-petals",
    "*Health:\x20100\x20→\x20120",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "honeyRange",
    "Bubble",
    "contains",
    "Beetle_2",
    "onMove",
    "webSizeTiers",
    "It\x20has\x20sussy\x20movement.",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "Rice",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "1st\x20February\x202024",
    "krBw",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "hsl(110,100%,50%)",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "#353331",
    "hpRegen",
    "21st\x20January\x202024",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "rgba(0,0,0,",
    "NSlTg",
    "#735b49",
    ".screen",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "Red\x20ball.",
    ".stats-btn",
    "uiAngle",
    "password",
    "been\x20",
    "appendChild",
    "#bb771e",
    "petalPacman",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "clientWidth",
    "pacman",
    "mouse0",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "\x20play",
    "26th\x20September\x202023",
    "accou",
    "8URl",
    "subscribe\x20for\x20999\x20super\x20petals",
    "Stick",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "#444444",
    "Craft",
    "Furry",
    "onresize",
    "wn\x20ri",
    "Mob\x20Rotation",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "uiName",
    "15807WcQReK",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "User",
    "textBaseline",
    ".clear-build-btn",
    "warn",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "#38ecd9",
    "#4343a4",
    "assassinated",
    "show_grid",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "fake",
    "search",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "253906KWTZJW",
    "(total\x20",
    "adplayer",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "petalBone",
    "Beetle",
    "Buffed\x20Gem.",
    ".insta-btn",
    "orb\x20a",
    "W6HBdwO0",
    "local",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "credits",
    "getUint16",
    "Username\x20claimed!",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "dragonNest",
    "showItemLabel",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "#6f5514",
    "canRender",
    "*Increased\x20drop\x20rates.",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "copy",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "Grapes",
    "Powder",
    "prog",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "\x22\x20style=\x22color:",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "\x20Ultra",
    "Spider\x20Cave",
    "petalMissile",
    "#8f5db0",
    "mouse",
    "picked",
    "lightning",
    "petalSword",
    "25th\x20July\x202023",
    "#7af54c",
    ".nickname",
    "Stinger",
    "Game\x20released\x20to\x20public!",
    "*Arrow\x20damage:\x201\x20→\x203",
    "text/plain;charset=utf-8;",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "stats",
    "New\x20mob:\x20Sunflower.",
    "round",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "Flower\x20Damage",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "snail",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "weedSeed",
    ".clown",
    "onEnd",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "cde9W5NdTq",
    "KeyU",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "Beetle_5",
    "6th\x20November\x202023",
    "consumeTime",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "charAt",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "countEl",
    "toString",
    "particle_heart_",
    "#503402",
    "Increases\x20petal\x20spin\x20speed.",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "#be342a",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Wig",
    "rgba(0,0,0,0.2)",
    "petalRockEgg",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "petalYinYang",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "Extra\x20Spin\x20Speed",
    "\x20HP",
    "color",
    "sendBadMsg",
    "healthIncrease",
    ".copy-btn",
    "Missile\x20Health",
    "Ears",
    "decode",
    "hpAlpha",
    "Connecting\x20to\x20",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "...",
    "\x22></div>\x20<div\x20style=\x22color:",
    "hide-icons",
    "Your\x20Profile",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "*Rare:\x2050\x20→\x2035",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    ".minimap",
    "Ghost_2",
    "isShiny",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "20th\x20January\x202024",
    "Queen\x20Ant",
    "*Cotton\x20health:\x208\x20→\x209",
    "mobPetaler",
    "Nerfed\x20Spider\x20Yoba.",
    "Much\x20heavier\x20than\x20your\x20mom.",
    ".claim-btn",
    "fill",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "translate(calc(",
    "hpRegen75PerSecF",
    ".grid\x20.title",
    ".tv-prev",
    "onStart",
    "an\x20UN",
    "ffa\x20sandbox",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "health",
    "transform",
    "privacy.txt",
    "#999",
    "deg)",
    "#b28b29",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    ".switch-btn",
    "1325608Sarutk",
    "*Reduced\x20HP\x20depletion.",
    "\x0a\x09</div>",
    "craftResult",
    "wss://us2.hornex.pro",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "]\x22></div>",
    "angleOffset",
    "New\x20mob:\x20Nigersaurus.",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "<div\x20class=\x22petal-count\x22></div>",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "getBoundingClientRect",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "Ant\x20Fire",
    "hide-chat",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "\x20clie",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "btn",
    "drawTurtleShell",
    "origin",
    "Removed\x20Centipedes\x20from\x20waves.",
    "Honey\x20Damage",
    "worldW",
    ".scores",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "wss://as1.hornex.pro",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "#c9b46e",
    ".menu",
    "hornex-pro_300x600",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "Beetle_4",
    "reloadT",
    "hasSpawnImmunity",
    "#754a8f",
    "drawWingAndHalo",
    "checked",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "\x20radians",
    "typeStr",
    "Continue",
    "#d0bb55",
    "affectHealDur",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "main",
    "fire",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "rainbow-text",
    "#75dd34",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "Retardation\x20Duration",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "deg",
    "#ff7892",
    "accountData",
    "\x20&\x20",
    "Lightning\x20damage:\x2012\x20→\x208",
    "23rd\x20August\x202023",
    "getAttribute",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "score",
    "Snail",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "getTransform",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "remove",
    "1st\x20April\x202024",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "bottom",
    "\x0aServer:\x20",
    "Soldier\x20Ant_2",
    "WOpcHSkuCtriW7/dJG",
    "21st\x20June\x202023",
    "extraSpeedTemp",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "hide",
    "Dragon_1",
    "Petal\x20",
    "Crab",
    "href",
    "Spider",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "show_population",
    "Ant\x20Egg",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "iAngle",
    "tagName",
    "*Damage:\x204\x20→\x206",
    "#7dad0c",
    "show_debug_info",
    "Password\x20downloaded!",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "https://www.youtube.com/@NeowmHornex",
    "extraRange",
    "#cb37bf",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "uiHealth",
    "Magnet",
    "Minor\x20physics\x20change.",
    "rgb(237\x20236\x2061)",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "shadowBlur",
    "<div\x20class=\x22chat-item\x22></div>",
    "className",
    "userCount",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "charCodeAt",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "petalHoney",
    ".hud",
    ".inventory\x20.inventory-petals",
    "petalBanana",
    "small",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "KGw#",
    "#ff4f4f",
    "pet",
    "Kills",
    "isSleeping",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "spawnT",
    "animationDirection",
    "max",
    "finalMsg",
    "flors",
    "uiCountGap",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "erCas",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "documentElement",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "iDepositPetal",
    "\x20all\x20",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "#d54324",
    "#735d5f",
    "\x20accounts",
    "Wave",
    "nSkOW4GRtW",
    ".lottery-users",
    "Sandstorm_4",
    "6th\x20October\x202023",
    "#4e3f40",
    "Centipede",
    "pickupRangeTiers",
    "occupySlot",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "#695118",
    "*Taco\x20healing:\x208\x20→\x209",
    "workerAnt",
    "ArrowUp",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "Removed\x20disclaimer\x20from\x20menu.",
    "#d9511f",
    "image/png",
    "index",
    "Ugly\x20&\x20stinky.",
    "changedTouches",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "\x20Wave\x20",
    "backgroundColor",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "Scorpion",
    "enable_shake",
    ".tooltip",
    "log",
    "12th\x20August\x202023",
    "reduce",
    "26th\x20August\x202023",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "stickbugBody",
    "\x27s\x20Profile",
    "#ffffff",
    "damage",
    "Some\x20Data",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "\x22\x20stroke=\x22",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "inclu",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "e=\x22Yo",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    ".yes-btn",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "isBoomerang",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "20th\x20July\x202023",
    "#ffd363",
    "[censored]",
    "result",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "indexOf",
    "29th\x20January\x202024",
    "antHole",
    "#f009e5",
    "lineTo",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "Spider_2",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "#ffe200",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "guardian",
    "#21c4b9",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "petalChromosome",
    "percent",
    ".terms-btn",
    "\x20!important;}",
    "startsWith",
    "rewards",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "http",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "z8kgrX3dSq",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "gblcVXldOG",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    ".server-area",
    "download",
    "#fff",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "New\x20mob:\x20Statue.",
    "Connected!",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "*Light\x20damage:\x2013\x20→\x2012",
    "d8k3BqDKF8o0WPu",
    "petalEgg",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "sortGroupItems",
    "count",
    "#709e45",
    "petalPollen",
    "%zY4",
    "*Rice\x20damage:\x204\x20→\x205",
    "spiderLeg",
    "canSkipRen",
    "362800GTUUrs",
    "projPoisonDamage",
    "rect",
    "closePath",
    "wss://as2.hornex.pro",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "hurtT",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    ".tv-next",
    "9th\x20July\x202023",
    "#8f5f34",
    "10px",
    "ondrop",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "<style>\x0a\x09\x09",
    "Loading\x20video\x20ad...",
    "iPing",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "slowDuration",
    "waveShowTimer",
    "getUint8",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "px)",
    "),0)",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "nShield",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "ignore\x20if\x20u\x20already\x20subbed",
    "11th\x20August\x202023",
    "Dragon",
    "#ff94c9",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "no-icon",
    "Yoba_4",
    "Health",
    "#a07f53",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "bolder\x20",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "send",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "#493911",
    ":scope\x20>\x20.petal",
    "/dlPetal",
    "Hornet_5",
    "startPreRoll",
    "centipedeBodyPoison",
    "\x22></div>\x0a\x09\x09\x09",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "<div\x20class=\x22chat-text\x22>",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "Soaks\x20damage\x20over\x20time.",
    "uniqueIndex",
    "fillRect",
    "Fixed\x20number\x20rounding\x20issue.",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "KeyM",
    "&#Uz",
    "n\x20an\x20",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "makeFire",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "petalCotton",
    "hsl(60,60%,30%)",
    "rgba(0,0,0,0.35)",
    "Heart",
    "nHealth",
    "petalCement",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "insert\x20something\x20here...",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "forEach",
    "save",
    "function",
    "successful",
    "Ghost_6",
    "hide_chat",
    "textAlign",
    "#bb1a34",
    "resize",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "WRzmW4bPaa",
    "#406150",
    "admin_pass",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "Worker\x20Ant",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "%</option>",
    "Orbit\x20Shlongation",
    ".box",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "Redesigned\x20some\x20mobs.",
    ".changelog",
    "curePoisonF",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "getRandomValues",
    "14th\x20August\x202023",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "#ffe763",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "Cotton\x20bush.",
    "i\x20need\x20999\x20billion\x20subs",
    "\x20at\x20y",
    "28th\x20August\x202023",
    "></di",
    "cEca",
    "redHealthTimer",
    "petalCactus",
    "killed",
    "Pet\x20Heal",
    "sq8Ig3e",
    "Increases",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "Ants\x20redesign.",
    "*Ultra:\x20120",
    ".prediction",
    "cmd",
    ".minimap-dot",
    "onmousemove",
    "unset",
    "e8oQW7VdPKa",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "els",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "player_id",
    "rgb(134,\x2031,\x20222)",
    "#853636",
    "petalAvacado",
    "nSize",
    ".mobs-btn",
    "includes",
    "rgb(219\x20130\x2041)",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "US\x20#2",
    "loginFailed",
    "TC0B",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "\x20FPS\x20/\x20",
    "16th\x20July\x202023",
    "shinyCol",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "Hornet_6",
    "hsl(60,60%,",
    "Former\x20student\x20of\x20Yoda.",
    "Extra\x20Range",
    "createElement",
    "rgba(0,0,0,0.3)",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "GsP9",
    "fire\x20ant",
    "PedoX",
    "#fcfe04",
    "changeLobby",
    "17455ZAdUWh",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "reverse",
    "\x22></span>\x20",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "doRemove",
    ".continue-btn",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "Mob\x20Agro\x20Range",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "userChat",
    "ellipse",
    "Rock_4",
    "210ZoZRjI",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "rgba(0,0,0,0.2",
    ".lottery",
    "bar",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "petalDice",
    "min",
    "name",
    "Soak\x20Duration",
    "poisonDamageF",
    "Nitro",
    "3027160ykzHDK",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "accountNotFound",
    "onmousedown",
    "scorp",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "KePiKgamer",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "low_quality",
    "*Hyper:\x20240",
    "Damage",
    "rock",
    "assualted",
    "\x20-\x20",
    "shadowColor",
    "d\x20abs",
    "13th\x20August\x202023",
    "Take\x20Down\x20Time",
    ";-moz-background-position:\x20",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "isInventoryPetal",
    "#b0473b",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "measureText",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "OFFIC",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "mobDespawned",
    "projType",
    "18th\x20July\x202023",
    "projHealthF",
    ".\x20Hac",
    ".collected-rarities",
    "flower",
    "Beetle_1",
    "iAbsorb",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "25th\x20January\x202024",
    "total",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "Turtle",
    "randomUUID",
    "mobGallery",
    "#654a19",
    "Wing",
    "ctx",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "Orbit\x20Twirl",
    "#a760b1",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    ".hitbox-cb",
    "OPEN",
    ".shop",
    "crab",
    ".submit-btn",
    "pZWkWOJdLW",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "your\x20",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "#ab5705",
    "lineCap",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "s.\x20Yo",
    "GBip",
    "ShiftLeft",
    ".video",
    "add",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "unsuccessful",
    "px\x20",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "3220DFvaar",
    "onkeyup",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "Hornet_3",
    "sunflower",
    "x.pro",
    ";position:absolute;top:",
    "isIcon",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "sin",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "Downloaded!",
    "WQxdVSkKW5VcJq",
    "state",
    "ion",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "#ff63eb",
    "choked",
    "Ruined",
    "en-US",
    "isArray",
    "WPJcKmoVc8o/",
    "isCentiBody",
    "Hnphe",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "makeSpiderLegs",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "Need\x20to\x20be\x20Lvl\x20",
    "numAccounts",
    ".scoreboard-title",
    "%\x20-\x200.8em*",
    "span\x202",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "sizeIncreaseF",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    ".absorb-btn",
    "maxLength",
    "hornex-pro_970x250",
    ".debug-info",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    ".show-population-cb",
    "#af6656",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "ll\x20yo",
    "isConnected",
    "sqrt",
    "Extra\x20Vision",
    "Sand",
    "Created\x20changelog.",
    "nig",
    "isConsumable",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "Duration",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "shield",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "execCommand",
    "#29f2e5",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "WRZdV8kNW5FcHq",
    "WPPnavtdUq",
    "mob_",
    "petalAntidote",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "heart",
    ".angry-btn",
    "#764b90",
    "#dc704b",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "[G]\x20Show\x20Grid:\x20",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "3HiTVzK",
    "deleted",
    "stopWhileMoving",
    "*Super:\x20150+",
    "2-digit",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "sword",
    "Ghost_5",
    "24th\x20June\x202023",
    "iReqGlb",
    "cantChat",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "New\x20setting:\x20UI\x20Scale.",
    "roundRect",
    "WRGBrCo9W6y",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "Shield",
    "isRetard",
    "moveCounter",
    "Can\x27t\x20perform\x20that\x20action.",
    "hpRegen75PerSec",
    "Mythic",
    "Soldier\x20Ant_4",
    "#5ab6ab",
    "isSpecialWave",
    ".hyper-buy",
    "player",
    "24th\x20January\x202024",
    "Desert",
    "petalDragonEgg",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "Fonts\x20loaded!",
    "DMCA",
    "getHurtColor",
    "#8ecc51",
    "Poo",
    "canShowDrops",
    ".find-user-input",
    "preventDefault",
    "*2%\x20craft\x20success\x20rate.",
    "soldierAnt",
    ".absorb\x20.dialog-header\x20span",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "rgb(166\x2056\x20237)",
    "stroke",
    "kWicW5FdMW",
    "style=\x22color:",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "sortGroups",
    "Extremely\x20slow\x20sussy\x20mob.",
    "Fire\x20Damage",
    "Has\x20fungal\x20infection\x20gg",
    "3336680ZmjFAG",
    "Sword",
    "damageF",
    "onwheel",
    "Baby\x20Ant",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "desc",
    "nigersaurus",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "W7dcP8k2W7ZcLxtcHv0",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "ability",
    ".killer",
    "*Fire\x20health:\x2080\x20→\x20120",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "n8oKoxnarXHzeIzdmW",
    "reason:\x20",
    "metaData",
    "globalAlpha",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "Comes\x20to\x20avenge\x20mobs.",
    "*Reduced\x20Shield\x20regen\x20time.",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "iClaimUsername",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "queen",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "builds",
    "bolder\x2012px\x20",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "uiScale",
    "STOP!",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "crafted\x20nothing\x20from",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "petalPowder",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "WRS8bSkQW4RcSLDU",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "#a2dd26",
    "arraybuffer",
    "https://www.youtube.com/@gowcaw97",
    "MOVE\x20AWAY!!",
    "Bush",
    "WP5YoSoxvq",
    "keydown",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "#db4437",
    "Fixed\x20duplicate\x20drops.",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "https",
    "regenF",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "ArrowLeft",
    "*Removed\x20Ultra\x20wave.",
    "#eb4755",
    "c)H[",
    "Loaded\x20Build\x20#",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "loading",
    "#33a853",
    "labelSuffix",
    "iReqGambleList",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "Fire\x20Ant",
    ".ads",
    "alpha",
    "\x20Pym\x20Particle.",
    "breedTimer",
    "Shield\x20Reuse\x20Cooldown",
    "hide-all",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    ".spawn-zones",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "Increased\x20map\x20size\x20by\x2030%.",
    "WQpcUmojoSo6",
    ".discord-area",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "*Bone\x20armor:\x207\x20→\x208",
    "projPoisonDamageF",
    ".total-kills",
    "rgb(92,\x20116,\x20176)",
    "ENTERING!!",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "Spider_3",
    "keyCheckFailed",
    "29th\x20June\x202023",
    "goofy\x20ahh\x20insect\x20robbery",
    "select",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "petal",
    "makeBallAntenna",
    "nameEl",
    "Passive\x20Heal",
    "show_hitbox",
    "hideAfterInactivity",
    "rgba(0,0,0,0.15)",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "Wave\x20Starting...",
    ".inventory-rarities",
    "8th\x20July\x202023",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "OFF",
    "WAVE",
    "LEAVE\x20ZONE!!",
    "render",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "darkLadybug",
    "#d3ad46",
    "url(https://i.ytimg.com/vi/",
    "oiynC",
    "locat",
    "Super",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "Kills\x20Needed",
    "petalStinger",
    "lightblue",
    "u\x20hav",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "#4f412e",
    "useTime",
    "Dragon\x20Nest",
    "released",
    "mobsEl",
    "no\x20sub,\x20no\x20gg",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "/weborama.js",
    "Increases\x20petal\x20pickup\x20range.",
    "#79211b",
    "terms.txt",
    "petalLeaf",
    "Reflected\x20Missile\x20Damage",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "petHeal",
    "drawSnailShell",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "UNOFF",
    "invalid\x20uuid",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "font",
    "Dandelion",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "consumeProj",
    "centipedeHead",
    "Petaler",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "complete",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "#b53229",
    "#e94034",
    "KeyS",
    ".score-overlay",
    "us_ffa2",
    "Legendary",
    "63174qfHfLb",
    "#8b533f",
    "Dragon_5",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    ".death-info",
    "petSizeChangeFactor",
    "zert.pro",
    "Bee",
    "padStart",
    "isPortal",
    "#924614",
    "isProj",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "fontSize",
    "Absorb",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "mushroom",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "101636gyvtEF",
    "Arrow",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "values",
    ";\x22\x20stroke=\x22",
    "are\x20p",
    ".clown-cb",
    "#6265eb",
    "spiderYoba",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "textEl",
    "*Bone\x20armor:\x209\x20→\x2010",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "innerHeight",
    "1rrAouN",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "wrecked",
    "petalSponge",
    "r\x20acc",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "Leave",
    "5th\x20September\x202023",
    "green",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "arial",
    "#a58368",
    "Spider_5",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "shieldReload",
    "projD",
    "halo",
    "Rock\x20Egg",
    ")\x20rotate(",
    "4th\x20July\x202023",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "&response_type=code&scope=identify&state=",
    "nt\x20an",
    "Fleepoint",
    "lieOnGroundTime",
    "makeHole",
    "lottery",
    ".username-area",
    "#bb3bc2",
    ".chat-input",
    "28th\x20June\x202023",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    ".rewards\x20.dialog-content",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "extraSpeed",
    ".craft-rate",
    "angryT",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "aip_complete",
    "Disconnected.",
    "petalStickbug",
    "extraRangeTiers",
    "WQ7dTmk3W6FcIG",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "pop",
    "W5OTW6uDWPScW5eZ",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    ".credits",
    "KeyA",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "invalid",
    "legD",
    "stringify",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "WRyiwZv5x3eIdtzgdgC",
    "Yoba_1",
    "*Super:\x201%\x20→\x201.5%",
    "\x20from\x20",
    "#b9baba",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "Pill\x20affects\x20Arrow\x20now.",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "executed",
    "#d3bd46",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "Statue\x20of\x20RuinedLiberty.",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "Removed\x20Waves.",
    "Yellow\x20Ladybug",
    "Region:\x20",
    "18th\x20September\x202023",
    "lightningDmg",
    "affectMobHealDur",
    ".inventory",
    "Evil\x20Centipede",
    "eyeX",
    "isTrusted",
    "Beehive",
    "#a44343",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "Fossil",
    "2nd\x20July\x202023",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "querySelector",
    "toLocaleString",
    "petalMushroom",
    "W77cISkNWONdQa",
    "posAngle",
    "tail_outline",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "#5ec13a",
    "*Reduced\x20drops\x20by\x2050%.",
    "countAngleOffset",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "teal\x20",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    ".stats\x20.dialog-content",
    "expand",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "shieldRegenPerSec",
    "hasEye",
    "\x22></div>\x0a\x09\x09",
    "qmklWO4",
    "Fussy\x20Sucker",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "#fdda40",
    ".petals.small",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "petalGas",
    ".loader",
    "oProg",
    "W6RcRmo0WR/cQSo1W4PifG",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "#15cee5",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "iJoin",
    ";-webkit-background-position:\x20",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "and\x20a",
    "Soldier\x20Ant_6",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "timeJoined",
    "clip",
    "displayData",
    "26th\x20January\x202024",
    "://ho",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "Username\x20is\x20already\x20taken.",
    "%\x20!important",
    "powderTime",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "<div\x20class=\x22slot\x22></div>",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "soakTime",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "Yoba\x20Egg",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "Some\x20anti\x20lag\x20measures:",
    "show-petal",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "#ebeb34",
    "cmk/auqmq8o8WOngW79c",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "hornet",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "Stick\x20does\x20not\x20expand\x20now.",
    "oHealth",
    "removeChild",
    "kers\x20",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "msgpack",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "Hornet",
    "#7777ff",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "\x22\x20stroke=\x22(",
    "Sunflower",
    "fireDamageF",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "Spawn\x20zone\x20changes:",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "iWatchAd",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "petalWave",
    "2772301LQYLdH",
    ".import-btn",
    "Added\x20another\x20AS\x20lobby.",
    "textarea",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "hpRegenPerSec",
    "path",
    "drawDragon",
    "petalSalt",
    "Lobby\x20Closing...",
    "discord_data",
    "turtleF",
    "rectAscend",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "Account\x20imported!",
    "Breed\x20Range",
    "Salt",
    "15584076IAHWRs",
    "30th\x20June\x202023",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "url(",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "g\x20on\x20",
    "isClown",
    "\x20rad/s",
    "petalCoffee",
    "can\x20s",
    "*Recuded\x20mob\x20count.",
    "insertBefore",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "angry",
    "vFKOVD",
    "#dbab2e",
    "petCount",
    "div",
    "user",
    "Space",
    "135249DkEsVO",
    "hsla(0,0%,100%,0.5)",
    ".logout-btn",
    "Yin\x20Yang",
    "enable_min_scaling",
    "isBooster",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "#634418",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "#ff3333",
    "hostname",
    "\x20stea",
    "\x20Blue",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "#ada25b",
    "#e6a44d",
    "#ccad00",
    "absolute",
    "*Hyper:\x2015-25",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "bg-rainbow",
    "#ce76db",
    "sad",
    ".debug-cb",
    "statuePlayer",
    ".rewards-btn",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "2nd\x20March\x202024",
    "encod",
    "Claiming\x20secret\x20skin...",
    "onmessage",
    "Rock_6",
    "#288842",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "undefined",
    "wing",
    "WRRdT8kPWO7cMG",
    "video-ad-skipped",
    ".claimer",
    "touchmove",
    "EU\x20#2",
    "oninput",
    "#f54ce7",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "Client-side\x20performance\x20improvements.",
    "<div\x20class=\x22petal\x20tier-",
    "#2e933c",
    "rad)",
    "\x20ctxs\x20(",
    "bone_outline",
    "petalHeavy",
    "binaryType",
    "W7/cOmkwW4lcU3dcHKS",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "Body",
    "https://auth.hornex.pro/discord",
    "Gas",
    "#fc9840",
    "4\x20yummy\x20poisonous\x20balls.",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "dataTransfer",
    "find",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "#5849f5",
    ".lottery\x20.inventory-petals",
    "opera",
    ".timer",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "#ce79a2",
    "vendor",
    "Ghost_1",
    "AS\x20#1",
    ".petals",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "visible",
    "angle",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "#fe98a2",
    "requestAnimationFrame",
    "isTanky",
    "centipedeHeadPoison",
    ".my-player",
    "Flower\x20Poison",
    "labelPrefix",
    "projSize",
    ".build-load-btn",
    "Increases\x20your\x20vision.",
    "projDamageF",
    "parse",
    "Armor",
    "Range",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "host",
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
        parseInt(ue(0x9c7)) / 0x1 +
        -parseInt(ue(0x546)) / 0x2 +
        (parseInt(ue(0xa7e)) / 0x3) * (parseInt(ue(0x823)) / 0x4) +
        (-parseInt(ue(0x3de)) / 0x5) * (parseInt(ue(0xb5e)) / 0x6) +
        -parseInt(ue(0x1ff)) / 0x7 +
        -parseInt(ue(0x9e1)) / 0x8 +
        (parseInt(ue(0x1a4)) / 0x9) * (parseInt(ue(0x922)) / 0xa);
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x31abf),
  (() => {
    const uf = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(uf(0xcf0)), ...cV(uf(0x9a2)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(uf(0x766)),
      cR = cV(uf(0x426)),
      cS = cV(uf(0xca2)),
      cT = cV(uf(0x821)),
      cU = cV(uf(0x817));
    function cV(qQ) {
      const ug = uf,
        qR = qQ[ug(0x2a0)]("\x20"),
        qS = {};
      for (let qT = 0x0; qT < qR[ug(0x28c)]; qT++) {
        qS[qR[qT]] = qT;
      }
      return qS;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[uf(0x220)] = 0x0), (cX[uf(0xc72)] = 0x1), (cX[uf(0xc52)] = 0x2);
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
      return 0x14 * Math[uh(0x61d)](qQ * 1.05 ** (qQ - 0x1));
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
        qR++, (qS += Math[ui(0x9dc)](0x1e, qS));
      }
      return qR;
    }
    function d6(qQ) {
      const uj = uf;
      return Math[uj(0x695)](0xf3, Math[uj(0x9dc)](qQ, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(qQ) {
      const qR = Array(qQ);
      while (qQ--) qR[qQ] = qQ;
      return qR;
    }
    var d9 = cV(uf(0xa30)),
      da = Object[uf(0xdd1)](d9),
      db = da[uf(0x28c)] - 0x1,
      dc = db;
    function dd(qQ) {
      const uk = uf,
        qR = [];
      for (let qS = 0x1; qS <= dc; qS++) {
        qR[uk(0x462)](qQ(qS));
      }
      return qR;
    }
    const de = {};
    (de[uf(0x41e)] = 0x0),
      (de[uf(0x31b)] = 0x1),
      (de[uf(0x72a)] = 0x2),
      (de[uf(0xa76)] = 0x3),
      (de[uf(0x920)] = 0x4),
      (de[uf(0xb91)] = 0x5),
      (de[uf(0xcfd)] = 0x6),
      (de[uf(0x1b0)] = 0x7),
      (de[uf(0x4fe)] = 0x8);
    var df = de;
    function dg(qQ, qR) {
      const ul = uf;
      return Math[ul(0x695)](0x3, qQ) * qR;
    }
    const dh = {};
    (dh[uf(0x344)] = cS[uf(0x348)]),
      (dh[uf(0xab8)] = uf(0x96c)),
      (dh[uf(0xd48)] = 0xa),
      (dh[uf(0x24f)] = 0x0),
      (dh[uf(0x745)] = 0x1),
      (dh[uf(0xab4)] = 0x1),
      (dh[uf(0x593)] = 0x3e8),
      (dh[uf(0xb3a)] = 0x0),
      (dh[uf(0x320)] = ![]),
      (dh[uf(0x9df)] = 0x1),
      (dh[uf(0xb6a)] = ![]),
      (dh[uf(0xaf1)] = 0x0),
      (dh[uf(0x76e)] = 0x0),
      (dh[uf(0xdf9)] = ![]),
      (dh[uf(0x109)] = 0x0),
      (dh[uf(0xd7a)] = 0x0),
      (dh[uf(0xa53)] = 0x0),
      (dh[uf(0x638)] = 0x0),
      (dh[uf(0x305)] = 0x0),
      (dh[uf(0x88a)] = 0x0),
      (dh[uf(0x91b)] = 0x1),
      (dh[uf(0x8ae)] = 0xc),
      (dh[uf(0xbe3)] = 0x0),
      (dh[uf(0x8c2)] = ![]),
      (dh[uf(0xabe)] = void 0x0),
      (dh[uf(0x1b4)] = ![]),
      (dh[uf(0x2fb)] = 0x0),
      (dh[uf(0xc5e)] = ![]),
      (dh[uf(0x5ec)] = 0x0),
      (dh[uf(0x2c6)] = 0x0),
      (dh[uf(0x205)] = ![]),
      (dh[uf(0x103)] = 0x0),
      (dh[uf(0x206)] = 0x0),
      (dh[uf(0x672)] = 0x0),
      (dh[uf(0x1bc)] = ![]),
      (dh[uf(0xb99)] = 0x0),
      (dh[uf(0x8eb)] = ![]),
      (dh[uf(0x3db)] = ![]),
      (dh[uf(0xc37)] = 0x0),
      (dh[uf(0x170)] = 0x0),
      (dh[uf(0xba5)] = 0x0),
      (dh[uf(0x62e)] = ![]),
      (dh[uf(0xc55)] = 0x1),
      (dh[uf(0x6db)] = 0x0),
      (dh[uf(0x2d2)] = 0x0),
      (dh[uf(0x6e1)] = 0x0),
      (dh[uf(0x590)] = 0x0),
      (dh[uf(0x53e)] = 0x0),
      (dh[uf(0x985)] = 0x0),
      (dh[uf(0xb47)] = 0x0),
      (dh[uf(0x6ed)] = 0x0),
      (dh[uf(0x136)] = 0x0),
      (dh[uf(0x455)] = 0x0),
      (dh[uf(0xbeb)] = 0x0),
      (dh[uf(0x812)] = 0x0),
      (dh[uf(0x82b)] = 0x0),
      (dh[uf(0xbcc)] = 0x0),
      (dh[uf(0xd8d)] = ![]),
      (dh[uf(0x934)] = 0x0),
      (dh[uf(0x8df)] = 0x0),
      (dh[uf(0x3dd)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[uf(0x9dd)] = uf(0x440)),
      (dj[uf(0xab8)] = uf(0x746)),
      (dj[uf(0x344)] = cS[uf(0x348)]),
      (dj[uf(0xd48)] = 0x9),
      (dj[uf(0x745)] = 0xa),
      (dj[uf(0xab4)] = 0xa),
      (dj[uf(0x593)] = 0x9c4);
    const dk = {};
    (dk[uf(0x9dd)] = uf(0x2a4)),
      (dk[uf(0xab8)] = uf(0x20e)),
      (dk[uf(0x344)] = cS[uf(0x7bc)]),
      (dk[uf(0xd48)] = 0xd / 1.1),
      (dk[uf(0x745)] = 0x2),
      (dk[uf(0xab4)] = 0x37),
      (dk[uf(0x593)] = 0x9c4),
      (dk[uf(0xb3a)] = 0x1f4),
      (dk[uf(0xb6a)] = !![]),
      (dk[uf(0xd9f)] = 0x28),
      (dk[uf(0x76e)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[uf(0x9dd)] = uf(0x4f4)),
      (dl[uf(0xab8)] = uf(0xd26)),
      (dl[uf(0x344)] = cS[uf(0x237)]),
      (dl[uf(0xd48)] = 0x8),
      (dl[uf(0x745)] = 0x5),
      (dl[uf(0xab4)] = 0x5),
      (dl[uf(0x593)] = 0xdac),
      (dl[uf(0xb3a)] = 0x3e8),
      (dl[uf(0xaf1)] = 0xb),
      (dl[uf(0x1bc)] = !![]);
    const dm = {};
    (dm[uf(0x9dd)] = uf(0xdfb)),
      (dm[uf(0xab8)] = uf(0xce1)),
      (dm[uf(0x344)] = cS[uf(0x246)]),
      (dm[uf(0xd48)] = 0x6),
      (dm[uf(0x745)] = 0x5),
      (dm[uf(0xab4)] = 0x5),
      (dm[uf(0x593)] = 0xfa0),
      (dm[uf(0x320)] = !![]),
      (dm[uf(0x9df)] = 0x32);
    const dn = {};
    (dn[uf(0x9dd)] = uf(0x70c)),
      (dn[uf(0xab8)] = uf(0x660)),
      (dn[uf(0x344)] = cS[uf(0x1ef)]),
      (dn[uf(0xd48)] = 0xb),
      (dn[uf(0x745)] = 0xc8),
      (dn[uf(0xab4)] = 0x1e),
      (dn[uf(0x593)] = 0x1388);
    const dp = {};
    (dp[uf(0x9dd)] = uf(0x7c5)),
      (dp[uf(0xab8)] = uf(0x708)),
      (dp[uf(0x344)] = cS[uf(0xb35)]),
      (dp[uf(0xd48)] = 0x8),
      (dp[uf(0x745)] = 0x2),
      (dp[uf(0xab4)] = 0xa0),
      (dp[uf(0x593)] = 0x2710),
      (dp[uf(0x8ae)] = 0xb),
      (dp[uf(0xbe3)] = Math["PI"]),
      (dp[uf(0xd81)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[uf(0x9dd)] = uf(0x71e)),
      (dq[uf(0xab8)] = uf(0xbb9)),
      (dq[uf(0xabe)] = df[uf(0x41e)]),
      (dq[uf(0x88a)] = 0x1e),
      (dq[uf(0xbac)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[uf(0x9dd)] = uf(0x4e1)),
      (dr[uf(0xab8)] = uf(0xcb5)),
      (dr[uf(0xabe)] = df[uf(0x31b)]);
    const ds = {};
    (ds[uf(0x9dd)] = uf(0x609)),
      (ds[uf(0xab8)] = uf(0x8fb)),
      (ds[uf(0x344)] = cS[uf(0xd0f)]),
      (ds[uf(0xd48)] = 0xb),
      (ds[uf(0x593)] = 0x9c4),
      (ds[uf(0x745)] = 0x14),
      (ds[uf(0xab4)] = 0x8),
      (ds[uf(0xdf9)] = !![]),
      (ds[uf(0x109)] = 0x2),
      (ds[uf(0xdc1)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[uf(0xd7a)] = 0x14);
    const du = {};
    (du[uf(0x9dd)] = uf(0x52a)),
      (du[uf(0xab8)] = uf(0x4df)),
      (du[uf(0x344)] = cS[uf(0xd15)]),
      (du[uf(0xd48)] = 0xb),
      (du[uf(0x745)] = 0x14),
      (du[uf(0xab4)] = 0x14),
      (du[uf(0x593)] = 0x5dc),
      (du[uf(0x638)] = 0x64),
      (du[uf(0x373)] = 0x1);
    const dv = {};
    (dv[uf(0x9dd)] = uf(0x614)),
      (dv[uf(0xab8)] = uf(0x527)),
      (dv[uf(0x344)] = cS[uf(0x38e)]),
      (dv[uf(0xd48)] = 0x7),
      (dv[uf(0x745)] = 0x5),
      (dv[uf(0xab4)] = 0xa),
      (dv[uf(0x593)] = 0x258),
      (dv[uf(0x91b)] = 0x1),
      (dv[uf(0x8c2)] = !![]),
      (dv[uf(0xd81)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[uf(0x9dd)] = uf(0x415)),
      (dw[uf(0xab8)] = uf(0x5cc)),
      (dw[uf(0x344)] = cS[uf(0x965)]),
      (dw[uf(0xd48)] = 0xb),
      (dw[uf(0x745)] = 0xf),
      (dw[uf(0xab4)] = 0x1),
      (dw[uf(0x593)] = 0x3e8),
      (dw[uf(0x1b4)] = !![]);
    const dx = {};
    (dx[uf(0x9dd)] = uf(0x88e)),
      (dx[uf(0xab8)] = uf(0xb41)),
      (dx[uf(0x344)] = cS[uf(0x1df)]),
      (dx[uf(0xd48)] = 0xb),
      (dx[uf(0x745)] = 0xf),
      (dx[uf(0xab4)] = 0x5),
      (dx[uf(0x593)] = 0x5dc),
      (dx[uf(0x2fb)] = 0x32),
      (dx[uf(0x8c1)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[uf(0x9dd)] = uf(0x223)),
      (dy[uf(0xab8)] = uf(0xb3f)),
      (dy[uf(0x344)] = cS[uf(0x63f)]),
      (dy[uf(0xd48)] = 0x7),
      (dy[uf(0x745)] = 0x19),
      (dy[uf(0xab4)] = 0x19),
      (dy[uf(0x91b)] = 0x4),
      (dy[uf(0x593)] = 0x3e8),
      (dy[uf(0xb3a)] = 0x1f4),
      (dy[uf(0x8ae)] = 0x9),
      (dy[uf(0x76e)] = Math["PI"] / 0x8),
      (dy[uf(0xb6a)] = !![]),
      (dy[uf(0xd9f)] = 0x28);
    const dz = {};
    (dz[uf(0x9dd)] = uf(0x754)),
      (dz[uf(0xab8)] = uf(0x87e)),
      (dz[uf(0x344)] = cS[uf(0x5dd)]),
      (dz[uf(0xd48)] = 0x10),
      (dz[uf(0x745)] = 0x0),
      (dz[uf(0x81b)] = 0x1),
      (dz[uf(0xab4)] = 0x0),
      (dz[uf(0x593)] = 0x157c),
      (dz[uf(0xb3a)] = 0x1f4),
      (dz[uf(0x278)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[uf(0x361)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[uf(0x5ec)] = 0x3c),
      (dz[uf(0xc5e)] = !![]),
      (dz[uf(0x1bc)] = !![]);
    const dA = {};
    (dA[uf(0x9dd)] = uf(0xc5c)),
      (dA[uf(0xab8)] = uf(0xadc)),
      (dA[uf(0x344)] = cS[uf(0x7ee)]),
      (dA[uf(0x593)] = 0x7d0),
      (dA[uf(0x205)] = !![]),
      (dA[uf(0x745)] = 0xa),
      (dA[uf(0xab4)] = 0xa),
      (dA[uf(0xd48)] = 0xd);
    const dB = {};
    (dB[uf(0x9dd)] = uf(0x269)),
      (dB[uf(0xab8)] = uf(0x46c)),
      (dB[uf(0x344)] = cS[uf(0x123)]),
      (dB[uf(0x593)] = 0xdac),
      (dB[uf(0xb3a)] = 0x1f4),
      (dB[uf(0x745)] = 0x5),
      (dB[uf(0xab4)] = 0x5),
      (dB[uf(0xd48)] = 0xa),
      (dB[uf(0x103)] = 0x46),
      (dB[uf(0x758)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: uf(0x7f7),
        desc: uf(0x3cd),
        ability: df[uf(0x72a)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((qQ) => 0x32 + qQ * 0x46),
      },
      {
        name: uf(0x968),
        desc: uf(0x433),
        ability: df[uf(0xa76)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: uf(0xc42),
        desc: uf(0xa2f),
        type: cS[uf(0xc3a)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][uf(0x196)](
          (qQ) => qQ * 0.8
        ),
      },
      {
        name: uf(0x7b4),
        desc: uf(0xc98),
        type: cS[uf(0x246)],
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
        name: uf(0x3a5),
        desc: uf(0x80d),
        type: cS[uf(0xc90)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
      },
      {
        name: uf(0x603),
        desc: uf(0x7e6),
        type: cS[uf(0x57e)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][uf(0x196)](
          (qQ) => qQ - 0.2
        ),
      },
      {
        name: uf(0x24b),
        desc: uf(0x32e),
        type: cS[uf(0x91d)],
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
        name: uf(0xa12),
        desc: uf(0x3a4),
        type: cS[uf(0x49a)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: uf(0x574),
        desc: uf(0x4fc),
        type: cS[uf(0xd44)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: uf(0x34b),
        desc: uf(0x379),
        type: cS[uf(0x994)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: uf(0x25b),
        desc: uf(0x212),
        type: cS[uf(0xb44)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: uf(0xa64),
        desc: uf(0x445),
        type: cS[uf(0x6b9)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: uf(0x7b5),
        desc: uf(0xc20),
        type: cS[uf(0xae0)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
      },
      {
        name: uf(0x6da),
        desc: uf(0x8a0),
        type: cS[uf(0x237)],
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
        name: uf(0x1fc),
        desc: uf(0x899),
        type: cS[uf(0x918)],
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
        spawn: uf(0x79e),
        spawnTiers: [
          uf(0xa07),
          uf(0x756),
          uf(0x68c),
          uf(0x68c),
          uf(0x84b),
          uf(0x7da),
          uf(0x7da),
          uf(0x185),
        ],
      },
      {
        name: uf(0x880),
        desc: uf(0xcf3),
        type: cS[uf(0x339)],
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
        spawn: uf(0xcfc),
        spawnTiers: [
          uf(0xdc2),
          uf(0xdc2),
          uf(0x873),
          uf(0xd5e),
          uf(0xa94),
          uf(0xdb8),
          uf(0xdb8),
          uf(0xc01),
        ],
      },
      {
        name: uf(0x73d),
        desc: uf(0xac2),
        type: cS[uf(0x918)],
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
        spawn: uf(0xc23),
        spawnTiers: [
          uf(0x3bb),
          uf(0x3bb),
          uf(0x552),
          uf(0xa34),
          uf(0xd34),
          uf(0x950),
          uf(0x950),
          uf(0x9bb),
        ],
      },
      {
        name: uf(0xc12),
        desc: uf(0x1b5),
        type: cS[uf(0xcd9)],
        size: 0x12,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        fixAngle: !![],
        dontExpand: !![],
        useTime: 0x12110,
        useTimeTiers: [
          0x1ce8, 0x2580, 0x2e18, 0x4524, 0x9538, 0x14244, 0x1004, 0x2968,
        ],
        spawn: uf(0x738),
        spawnTiers: [
          uf(0x738),
          uf(0xbbb),
          uf(0x4d6),
          uf(0x51b),
          uf(0x943),
          uf(0x258),
          uf(0x258),
          uf(0x227),
        ],
      },
      {
        name: uf(0x780),
        desc: uf(0x155),
        type: cS[uf(0x576)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: uf(0x1ce),
        spawnTiers: [
          uf(0x604),
          uf(0xd04),
          uf(0xd04),
          uf(0x639),
          uf(0x8bd),
          uf(0x3f2),
          uf(0x3f2),
          uf(0xd20),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: uf(0x514),
        desc: uf(0x571),
        type: cS[uf(0x5ee)],
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
        name: uf(0xaa1),
        desc: uf(0x1c3),
        type: cS[uf(0x628)],
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
        name: uf(0x334),
        desc: uf(0x846),
        type: cS[uf(0x3fe)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: uf(0xb4f),
        desc: uf(0xad3),
        type: cS[uf(0x5f3)],
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
        name: uf(0x647),
        desc: uf(0x58d),
        type: cS[uf(0x38a)],
        size: 0xd,
        healthF: 0x19,
        damageF: 0x5,
        dontExpand: !![],
        respawnTime: 0xdac,
        useTime: 0x3e8,
        shield: 0x8,
        shieldTiers: [0x17, 0x44, 0xcb, 0x260, 0x708, 0x1518, 0x3f48, 0xbb80],
      },
      {
        name: uf(0x75b),
        desc: uf(0x838),
        type: cS[uf(0xdac)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: uf(0x2a7),
        desc: uf(0x75c),
        type: cS[uf(0xd82)],
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
        name: uf(0x588),
        desc: uf(0x977),
        ability: df[uf(0x920)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: uf(0x318),
        desc: uf(0x958),
        type: cS[uf(0xb83)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: uf(0xa9e),
        desc: uf(0x243),
        type: cS[uf(0xd79)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: uf(0x43b),
        desc: uf(0x77a),
        ability: df[uf(0xb91)],
        petHealF: 0x28,
      },
      {
        name: uf(0x4c0),
        desc: uf(0x139),
        ability: df[uf(0xcfd)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: uf(0xb72),
        type: cS[uf(0x4dd)],
        desc: uf(0xad8),
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
        name: uf(0x408),
        desc: uf(0x801),
        type: cS[uf(0xa9b)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: uf(0x93f),
        spawnTiers: [
          uf(0x879),
          uf(0x448),
          uf(0x448),
          uf(0x511),
          uf(0x52f),
          uf(0xb60),
          uf(0xb60),
          uf(0x321),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: uf(0x501),
        desc: uf(0x84a),
        type: cS[uf(0xc4d)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          uf(0x196)
        ]((qQ) => qQ / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: uf(0x474),
        desc: uf(0xbf1),
        type: cS[uf(0x79d)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: uf(0x389),
        desc: uf(0x661),
        type: cS[uf(0x3d7)],
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
        name: uf(0xc96),
        desc: uf(0x4f6),
        type: cS[uf(0xbf6)],
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
        name: uf(0x86a),
        desc: uf(0x468),
        type: cS[uf(0x1fe)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: uf(0x8ba),
        desc: uf(0xb26),
        type: cS[uf(0xc30)],
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
        name: uf(0x5e3),
        desc: uf(0x23b),
        type: cS[uf(0x384)],
        size: 0xf,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x9c4,
        useTime: 0x3e8,
        regenF: 0x9,
        dontExpand: !![],
        uiAngle: -Math["PI"] / 0x4,
        consumeProj: !![],
        consumeProjSpeed: 0x28,
        consumeProjType: cS[uf(0x628)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: uf(0xd4f),
        desc: uf(0x90c),
        type: cS[uf(0x89e)],
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
        name: uf(0x3c3),
        desc: uf(0x7ad),
        type: cS[uf(0x773)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: uf(0x56e),
        spawnTiers: [
          uf(0xca5),
          uf(0x805),
          uf(0x805),
          uf(0x1f6),
          uf(0x2ee),
          uf(0xa85),
          uf(0x972),
          uf(0x517),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: uf(0xd85), desc: uf(0x2a3), ability: df[uf(0x1b0)] },
      {
        name: uf(0x3c1),
        desc: uf(0x3bc),
        type: cS[uf(0x89b)],
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
        name: uf(0x9e0),
        desc: uf(0xdad),
        type: cS[uf(0x461)],
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
        name: uf(0x5ad),
        desc: uf(0x28f),
        type: cS[uf(0xa74)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: uf(0x356),
        desc: uf(0xadb),
        type: cS[uf(0x125)],
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
        name: uf(0xa0e),
        desc: uf(0xa41),
        type: cS[uf(0xdb2)],
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
        name: uf(0x187),
        desc: uf(0x405),
        type: cS[uf(0x34a)],
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
        spawn: uf(0x87d),
        spawnTiers: [
          uf(0x21b),
          uf(0x8f8),
          uf(0x8f8),
          uf(0xb14),
          uf(0xd33),
          uf(0xb8c),
          uf(0xb8c),
          uf(0xdda),
        ],
      },
      {
        name: uf(0x19c),
        desc: uf(0x610),
        type: cS[uf(0x96a)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: uf(0x438),
        desc: uf(0x1f4),
        type: cS[uf(0x900)],
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
        name: uf(0xc27),
        desc: uf(0x2b7),
        type: cS[uf(0x219)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 0x1,
      },
      {
        name: uf(0x473),
        desc: uf(0xd3b),
        type: cS[uf(0xbab)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((qQ) => 0xa + qQ * 0x28),
      },
      {
        name: uf(0x179),
        desc: uf(0x469),
        type: cS[uf(0xbdc)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: uf(0x57f),
        desc: uf(0xa2a),
        type: cS[uf(0x177)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((qQ) => 0x2 + Math[uf(0x7cc)](1.7 ** qQ)),
      },
      {
        name: uf(0xab3),
        desc: uf(0x2e5),
        type: cS[uf(0x7c1)],
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
        name: uf(0x4cb),
        desc: uf(0x3ff),
        type: cS[uf(0x9ab)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((qQ) => 0.02 + qQ * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: uf(0xb92),
        desc: uf(0x497),
        type: cS[uf(0x7ec)],
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
        spawn: uf(0x70c),
        spawnTiers: [
          uf(0x70c),
          uf(0x29b),
          uf(0x3f6),
          uf(0x22a),
          uf(0x9d4),
          uf(0x5cb),
          uf(0x5cb),
          uf(0xc7d),
        ],
      },
      { name: uf(0x7ea), desc: uf(0x656), ability: df[uf(0x4fe)] },
      {
        name: uf(0x733),
        desc: uf(0x44f),
        type: cS[uf(0x9db)],
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
        qS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][um(0x196)](
          (qT) => qT * qR
        );
      return {
        name: qQ ? um(0x304) : um(0x250),
        desc:
          (qQ ? um(0x998) : um(0x5e1)) +
          um(0x774) +
          (qQ ? um(0xc67) : "") +
          um(0xb03),
        type: cS[qQ ? um(0x5ce) : um(0x66b)],
        size: 0x10,
        healthF: qQ ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: qS[0x0],
        mobSizeChangeTiers: qS[um(0x471)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[uf(0x28c)],
      dH = da[uf(0x28c)],
      dI = eP();
    for (let qQ = 0x0, qR = dC[uf(0x28c)]; qQ < qR; qQ++) {
      const qS = dC[qQ];
      (qS[uf(0x558)] = !![]), (qS["id"] = qQ);
      if (!qS[uf(0x789)]) qS[uf(0x789)] = qS[uf(0x9dd)];
      dK(qS), (qS[uf(0xced)] = 0x0), (qS[uf(0x959)] = qQ);
      let qT = qS;
      for (let qU = 0x1; qU < dH; qU++) {
        const qV = dO(qS);
        (qV[uf(0x24f)] = qS[uf(0x24f)] + qU),
          (qV[uf(0x9dd)] = qS[uf(0x9dd)] + "_" + qV[uf(0x24f)]),
          (qV[uf(0xced)] = qU),
          (qT[uf(0x4bb)] = qV),
          (qT = qV),
          dJ(qS, qV),
          dK(qV),
          (qV["id"] = dC[uf(0x28c)]),
          (dC[qV["id"]] = qV);
      }
    }
    function dJ(qW, qX) {
      const un = uf,
        qY = qX[un(0x24f)] - qW[un(0x24f)] - 0x1;
      for (let qZ in qW) {
        const r0 = qW[qZ + un(0x268)];
        Array[un(0xa46)](r0) && (qX[qZ] = r0[qY]);
      }
    }
    function dK(qW) {
      const uo = uf;
      dF[qW[uo(0x9dd)]] = qW;
      for (let qX in di) {
        qW[qX] === void 0x0 && (qW[qX] = di[qX]);
      }
      qW[uo(0xabe)] === df[uo(0x31b)] &&
        (qW[uo(0x305)] = cW[qW[uo(0x24f)] + 0x1] / 0x64),
        (qW[uo(0x81b)] =
          qW[uo(0x745)] > 0x0
            ? dg(qW[uo(0x24f)], qW[uo(0x745)])
            : qW[uo(0x81b)]),
        (qW[uo(0x8df)] =
          qW[uo(0xab4)] > 0x0
            ? dg(qW[uo(0x24f)], qW[uo(0xab4)])
            : qW[uo(0x8df)]),
        (qW[uo(0xc37)] = dg(qW[uo(0x24f)], qW[uo(0x136)])),
        (qW[uo(0xbeb)] = dg(qW[uo(0x24f)], qW[uo(0x455)])),
        (qW[uo(0xa92)] = dg(qW[uo(0x24f)], qW[uo(0x812)])),
        (qW[uo(0xb47)] = dg(qW[uo(0x24f)], qW[uo(0x6ed)])),
        (qW[uo(0xcfa)] = dg(qW[uo(0x24f)], qW[uo(0x3dd)])),
        (qW[uo(0x452)] = dg(qW[uo(0x24f)], qW[uo(0x1ec)])),
        (qW[uo(0x590)] = dg(qW[uo(0x24f)], qW[uo(0x6e1)])),
        (qW[uo(0x53e)] = dg(qW[uo(0x24f)], qW[uo(0x985)])),
        qW[uo(0xb52)] &&
          ((qW[uo(0x4d4)] = dg(qW[uo(0x24f)], qW[uo(0x4a1)])),
          (qW[uo(0x189)] = dg(qW[uo(0x24f)], qW[uo(0x45f)]))),
        qW[uo(0xaf1)] > 0x0
          ? (qW[uo(0x763)] = dg(qW[uo(0x24f)], qW[uo(0xaf1)]))
          : (qW[uo(0x763)] = 0x0),
        (qW[uo(0x407)] = qW[uo(0x320)]
          ? dg(qW[uo(0x24f)], qW[uo(0x9df)])
          : 0x0),
        (qW[uo(0xbcb)] = qW[uo(0xdf9)]
          ? dg(qW[uo(0x24f)], qW[uo(0xd7a)])
          : 0x0),
        (qW[uo(0x7f4)] = dg(qW[uo(0x24f)], qW[uo(0x638)])),
        dI[qW[uo(0x24f)]][uo(0x462)](qW);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(uf(0x9a6));
    function dO(qW) {
      const up = uf;
      return JSON[up(0xcb7)](JSON[up(0xbb8)](qW));
    }
    const dP = {};
    (dP[uf(0x9dd)] = uf(0x602)),
      (dP[uf(0xab8)] = uf(0x280)),
      (dP[uf(0x344)] = uf(0x727)),
      (dP[uf(0x24f)] = 0x0),
      (dP[uf(0x745)] = 0x64),
      (dP[uf(0xab4)] = 0x1e),
      (dP[uf(0x4e2)] = 0x32),
      (dP[uf(0x409)] = dN[uf(0x521)]),
      (dP[uf(0x48a)] = ![]),
      (dP[uf(0x346)] = !![]),
      (dP[uf(0x320)] = ![]),
      (dP[uf(0x9df)] = 0x0),
      (dP[uf(0x407)] = 0x0),
      (dP[uf(0xfd)] = ![]),
      (dP[uf(0x330)] = ![]),
      (dP[uf(0x3e1)] = 0x1),
      (dP[uf(0xa01)] = cS[uf(0x348)]),
      (dP[uf(0xa03)] = 0x0),
      (dP[uf(0xcb6)] = 0x0),
      (dP[uf(0xcb3)] = 0.5),
      (dP[uf(0xb90)] = 0x0),
      (dP[uf(0xd9f)] = 0x1e),
      (dP[uf(0xb0f)] = 0x0),
      (dP[uf(0x390)] = ![]),
      (dP[uf(0xd7a)] = 0x0),
      (dP[uf(0x109)] = 0x0),
      (dP[uf(0xcd1)] = 11.5),
      (dP[uf(0x667)] = 0x4),
      (dP[uf(0xa80)] = !![]),
      (dP[uf(0x6db)] = 0x0),
      (dP[uf(0x2d2)] = 0x0),
      (dP[uf(0x5e8)] = 0x1),
      (dP[uf(0x6bf)] = 0x0),
      (dP[uf(0x70a)] = 0x0),
      (dP[uf(0x150)] = 0x0),
      (dP[uf(0x1c4)] = 0x0),
      (dP[uf(0xb64)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[uf(0x9dd)] = uf(0x369)),
      (dR[uf(0xab8)] = uf(0x494)),
      (dR[uf(0x344)] = uf(0x8f4)),
      (dR[uf(0x745)] = 0x2ee),
      (dR[uf(0xab4)] = 0xa),
      (dR[uf(0x4e2)] = 0x32),
      (dR[uf(0xfd)] = !![]),
      (dR[uf(0x330)] = !![]),
      (dR[uf(0x3e1)] = 0.05),
      (dR[uf(0xcd1)] = 0x5),
      (dR[uf(0xcae)] = !![]),
      (dR[uf(0x5c8)] = [[uf(0xcfc), 0x3]]),
      (dR[uf(0x367)] = [
        [uf(0x809), 0x1],
        [uf(0xcfc), 0x2],
        [uf(0x97d), 0x2],
        [uf(0xab6), 0x1],
      ]),
      (dR[uf(0xd80)] = [[uf(0x52a), "f"]]);
    const dS = {};
    (dS[uf(0x9dd)] = uf(0x809)),
      (dS[uf(0xab8)] = uf(0x383)),
      (dS[uf(0x344)] = uf(0x48f)),
      (dS[uf(0x745)] = 0x1f4),
      (dS[uf(0xab4)] = 0xa),
      (dS[uf(0x4e2)] = 0x28),
      (dS[uf(0xcae)] = !![]),
      (dS[uf(0x48a)] = !![]),
      (dS[uf(0xd80)] = [
        [uf(0xa12), "E"],
        [uf(0x304), "G"],
        [uf(0x880), "A"],
      ]);
    const dT = {};
    (dT[uf(0x9dd)] = uf(0xcfc)),
      (dT[uf(0xab8)] = uf(0x870)),
      (dT[uf(0x344)] = uf(0xaa6)),
      (dT[uf(0x745)] = 0x64),
      (dT[uf(0xab4)] = 0xa),
      (dT[uf(0x4e2)] = 0x1c),
      (dT[uf(0x48a)] = !![]),
      (dT[uf(0xd80)] = [[uf(0xa12), "I"]]);
    const dU = {};
    (dU[uf(0x9dd)] = uf(0x97d)),
      (dU[uf(0xab8)] = uf(0xd72)),
      (dU[uf(0x344)] = uf(0x8c6)),
      (dU[uf(0x745)] = 62.5),
      (dU[uf(0xab4)] = 0xa),
      (dU[uf(0x4e2)] = 0x1c),
      (dU[uf(0xd80)] = [[uf(0x25b), "H"]]);
    const dV = {};
    (dV[uf(0x9dd)] = uf(0xab6)),
      (dV[uf(0xab8)] = uf(0x52d)),
      (dV[uf(0x344)] = uf(0x3d2)),
      (dV[uf(0x745)] = 0x19),
      (dV[uf(0xab4)] = 0xa),
      (dV[uf(0x4e2)] = 0x19),
      (dV[uf(0x48a)] = ![]),
      (dV[uf(0x346)] = ![]),
      (dV[uf(0xd80)] = [
        [uf(0x614), "F"],
        [uf(0x25b), "F"],
        [uf(0x250), "G"],
        [uf(0x75b), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uq = uf,
        qW = dO(dW);
      for (let qX = 0x0; qX < qW[uq(0x28c)]; qX++) {
        const qY = qW[qX];
        (qY[uq(0x344)] += uq(0x389)),
          qY[uq(0x9dd)] === uq(0x369) &&
            (qY[uq(0xd80)] = [
              [uq(0x88e), "D"],
              [uq(0x514), "E"],
            ]),
          (qY[uq(0x9dd)] = dY(qY[uq(0x9dd)])),
          (qY[uq(0xab8)] = dY(qY[uq(0xab8)])),
          (qY[uq(0xab4)] *= 0x2),
          qY[uq(0x5c8)] &&
            qY[uq(0x5c8)][uq(0x96e)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            }),
          qY[uq(0x367)] &&
            qY[uq(0x367)][uq(0x96e)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            });
      }
      return qW;
    }
    function dY(qW) {
      const ur = uf;
      return qW[ur(0x5fe)](/Ant/g, ur(0xb00))[ur(0x5fe)](/ant/g, ur(0x9c3));
    }
    const dZ = {};
    (dZ[uf(0x9dd)] = uf(0xb66)),
      (dZ[uf(0xab8)] = uf(0xa55)),
      (dZ[uf(0x344)] = uf(0x465)),
      (dZ[uf(0x745)] = 37.5),
      (dZ[uf(0xab4)] = 0x32),
      (dZ[uf(0x4e2)] = 0x28),
      (dZ[uf(0xd80)] = [
        [uf(0x7c5), "F"],
        [uf(0x24b), "I"],
      ]),
      (dZ[uf(0x6db)] = 0x4),
      (dZ[uf(0x2d2)] = 0x4);
    const e0 = {};
    (e0[uf(0x9dd)] = uf(0x34b)),
      (e0[uf(0xab8)] = uf(0x500)),
      (e0[uf(0x344)] = uf(0x217)),
      (e0[uf(0x745)] = 0x5e),
      (e0[uf(0xab4)] = 0x5),
      (e0[uf(0x3e1)] = 0.05),
      (e0[uf(0x4e2)] = 0x3c),
      (e0[uf(0xfd)] = !![]),
      (e0[uf(0xd80)] = [[uf(0x34b), "h"]]);
    const e1 = {};
    (e1[uf(0x9dd)] = uf(0x70c)),
      (e1[uf(0xab8)] = uf(0x7c9)),
      (e1[uf(0x344)] = uf(0x9ed)),
      (e1[uf(0x745)] = 0x4b),
      (e1[uf(0xab4)] = 0xa),
      (e1[uf(0x3e1)] = 0.05),
      (e1[uf(0xfd)] = !![]),
      (e1[uf(0x489)] = 1.25),
      (e1[uf(0xd80)] = [
        [uf(0x70c), "h"],
        [uf(0x3a5), "J"],
        [uf(0xb92), "K"],
      ]);
    const e2 = {};
    (e2[uf(0x9dd)] = uf(0xc23)),
      (e2[uf(0xab8)] = uf(0x962)),
      (e2[uf(0x344)] = uf(0xc1a)),
      (e2[uf(0x745)] = 62.5),
      (e2[uf(0xab4)] = 0x32),
      (e2[uf(0x48a)] = !![]),
      (e2[uf(0x4e2)] = 0x28),
      (e2[uf(0xd80)] = [
        [uf(0x2a4), "f"],
        [uf(0x4e1), "I"],
        [uf(0x73d), "K"],
      ]),
      (e2[uf(0xa01)] = cS[uf(0x7bc)]),
      (e2[uf(0xcb6)] = 0xa),
      (e2[uf(0xa03)] = 0x5),
      (e2[uf(0xd9f)] = 0x26),
      (e2[uf(0xcb3)] = 0.375 / 1.1),
      (e2[uf(0xb90)] = 0.75),
      (e2[uf(0x409)] = dN[uf(0xc1a)]);
    const e3 = {};
    (e3[uf(0x9dd)] = uf(0x29f)),
      (e3[uf(0xab8)] = uf(0x76c)),
      (e3[uf(0x344)] = uf(0x1ba)),
      (e3[uf(0x745)] = 87.5),
      (e3[uf(0xab4)] = 0xa),
      (e3[uf(0xd80)] = [
        [uf(0x614), "f"],
        [uf(0x4f4), "f"],
      ]),
      (e3[uf(0x6db)] = 0x5),
      (e3[uf(0x2d2)] = 0x5);
    const e4 = {};
    (e4[uf(0x9dd)] = uf(0x79e)),
      (e4[uf(0xab8)] = uf(0x8ce)),
      (e4[uf(0x344)] = uf(0x727)),
      (e4[uf(0x745)] = 0x64),
      (e4[uf(0xab4)] = 0x1e),
      (e4[uf(0x48a)] = !![]),
      (e4[uf(0xd80)] = [[uf(0x1fc), "F"]]),
      (e4[uf(0x6db)] = 0x5),
      (e4[uf(0x2d2)] = 0x5);
    const e5 = {};
    (e5[uf(0x9dd)] = uf(0x87d)),
      (e5[uf(0xab8)] = uf(0xde2)),
      (e5[uf(0x344)] = uf(0xd4e)),
      (e5[uf(0x745)] = 62.5),
      (e5[uf(0xab4)] = 0xf),
      (e5[uf(0x320)] = !![]),
      (e5[uf(0x9df)] = 0xf),
      (e5[uf(0x4e2)] = 0x23),
      (e5[uf(0x48a)] = !![]),
      (e5[uf(0xd80)] = [
        [uf(0x603), "F"],
        [uf(0x269), "F"],
        [uf(0x71e), "L"],
        [uf(0x588), "G"],
      ]);
    const e6 = {};
    (e6[uf(0x9dd)] = uf(0x8d4)),
      (e6[uf(0xab8)] = uf(0x9e3)),
      (e6[uf(0x344)] = uf(0x420)),
      (e6[uf(0x745)] = 0x64),
      (e6[uf(0xab4)] = 0xf),
      (e6[uf(0x320)] = !![]),
      (e6[uf(0x9df)] = 0xa),
      (e6[uf(0x4e2)] = 0x2f),
      (e6[uf(0x48a)] = !![]),
      (e6[uf(0xd80)] = [
        [uf(0xdfb), "F"],
        [uf(0x2a7), "F"],
      ]),
      (e6[uf(0xa01)] = cS[uf(0xb35)]),
      (e6[uf(0xcb6)] = 0x3),
      (e6[uf(0xa03)] = 0x5),
      (e6[uf(0xb0f)] = 0x7),
      (e6[uf(0xd9f)] = 0x2b),
      (e6[uf(0xcb3)] = 0.21),
      (e6[uf(0xb90)] = -0.31),
      (e6[uf(0x409)] = dN[uf(0x9e6)]);
    const e7 = {};
    (e7[uf(0x9dd)] = uf(0x738)),
      (e7[uf(0xab8)] = uf(0x11c)),
      (e7[uf(0x344)] = uf(0x2cd)),
      (e7[uf(0x745)] = 0x15e),
      (e7[uf(0xab4)] = 0x28),
      (e7[uf(0x4e2)] = 0x2d),
      (e7[uf(0x48a)] = !![]),
      (e7[uf(0xcae)] = !![]),
      (e7[uf(0xd80)] = [
        [uf(0x968), "F"],
        [uf(0x7f7), "G"],
        [uf(0x574), "H"],
        [uf(0xc12), "J"],
      ]);
    const e8 = {};
    (e8[uf(0x9dd)] = uf(0x56c)),
      (e8[uf(0xab8)] = uf(0x1e5)),
      (e8[uf(0x344)] = uf(0x2e0)),
      (e8[uf(0x745)] = 0x7d),
      (e8[uf(0xab4)] = 0x19),
      (e8[uf(0x48a)] = !![]),
      (e8[uf(0x390)] = !![]),
      (e8[uf(0xd7a)] = 0x5),
      (e8[uf(0x109)] = 0x2),
      (e8[uf(0xdc1)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[uf(0x667)] = 0x4),
      (e8[uf(0xcd1)] = 0x6),
      (e8[uf(0xd80)] = [[uf(0x609), "F"]]);
    const e9 = {};
    (e9[uf(0x9dd)] = uf(0x754)),
      (e9[uf(0xab8)] = uf(0x4ca)),
      (e9[uf(0x344)] = uf(0x664)),
      (e9[uf(0x745)] = 0.5),
      (e9[uf(0xab4)] = 0x5),
      (e9[uf(0x48a)] = ![]),
      (e9[uf(0x346)] = ![]),
      (e9[uf(0x667)] = 0x1),
      (e9[uf(0xd80)] = [[uf(0x754), "F"]]);
    const ea = {};
    (ea[uf(0x9dd)] = uf(0x8c0)),
      (ea[uf(0xab8)] = uf(0xd12)),
      (ea[uf(0x344)] = uf(0xb53)),
      (ea[uf(0x745)] = 0x19),
      (ea[uf(0xab4)] = 0xa),
      (ea[uf(0x4e2)] = 0x28),
      (ea[uf(0x1ca)] = cS[uf(0x39a)]),
      (ea[uf(0xd80)] = [
        [uf(0x25b), "J"],
        [uf(0x223), "J"],
      ]);
    const eb = {};
    (eb[uf(0x9dd)] = uf(0xbce)),
      (eb[uf(0xab8)] = uf(0x96d)),
      (eb[uf(0x344)] = uf(0xcaf)),
      (eb[uf(0x745)] = 0x19),
      (eb[uf(0xab4)] = 0xa),
      (eb[uf(0x4e2)] = 0x28),
      (eb[uf(0x1ca)] = cS[uf(0x952)]),
      (eb[uf(0x48a)] = !![]),
      (eb[uf(0xd80)] = [
        [uf(0xdfb), "J"],
        [uf(0x7b4), "J"],
      ]);
    const ec = {};
    (ec[uf(0x9dd)] = uf(0x3a1)),
      (ec[uf(0xab8)] = uf(0x215)),
      (ec[uf(0x344)] = uf(0x3c8)),
      (ec[uf(0x745)] = 0x19),
      (ec[uf(0xab4)] = 0xa),
      (ec[uf(0x4e2)] = 0x28),
      (ec[uf(0x1ca)] = cS[uf(0x328)]),
      (ec[uf(0x346)] = ![]),
      (ec[uf(0xd80)] = [
        [uf(0xa64), "J"],
        [uf(0xc42), "H"],
        [uf(0x7b5), "J"],
      ]),
      (ec[uf(0x667)] = 0x17),
      (ec[uf(0xcd1)] = 0x17 * 0.75);
    const ed = {};
    (ed[uf(0x9dd)] = uf(0xccb)),
      (ed[uf(0xab8)] = uf(0x735)),
      (ed[uf(0x344)] = uf(0xb2d)),
      (ed[uf(0x745)] = 87.5),
      (ed[uf(0xab4)] = 0xa),
      (ed[uf(0xd80)] = [
        [uf(0x6da), "F"],
        [uf(0xc5c), "I"],
      ]),
      (ed[uf(0x6db)] = 0x5),
      (ed[uf(0x2d2)] = 0x5);
    const ee = {};
    (ee[uf(0x9dd)] = uf(0xbc8)),
      (ee[uf(0xab8)] = uf(0x4ac)),
      (ee[uf(0x344)] = uf(0x210)),
      (ee[uf(0x745)] = 87.5),
      (ee[uf(0xab4)] = 0xa),
      (ee[uf(0xd80)] = [
        [uf(0x4f4), "A"],
        [uf(0x6da), "A"],
      ]),
      (ee[uf(0x6db)] = 0x5),
      (ee[uf(0x2d2)] = 0x5);
    const ef = {};
    (ef[uf(0x9dd)] = uf(0xae9)),
      (ef[uf(0xab8)] = uf(0x98d)),
      (ef[uf(0x344)] = uf(0x4c3)),
      (ef[uf(0x745)] = 0x32),
      (ef[uf(0xab4)] = 0xa),
      (ef[uf(0x3e1)] = 0.05),
      (ef[uf(0x4e2)] = 0x3c),
      (ef[uf(0xfd)] = !![]),
      (ef[uf(0xd80)] = [
        [uf(0x415), "E"],
        [uf(0x501), "F"],
        [uf(0xd4f), "F"],
      ]);
    const eg = {};
    (eg[uf(0x9dd)] = uf(0x1ce)),
      (eg[uf(0xab8)] = uf(0x283)),
      (eg[uf(0x344)] = uf(0x43e)),
      (eg[uf(0x745)] = 0x7d),
      (eg[uf(0xab4)] = 0x28),
      (eg[uf(0x4e2)] = 0x32),
      (eg[uf(0x48a)] = ![]),
      (eg[uf(0x346)] = ![]),
      (eg[uf(0x409)] = dN[uf(0x43e)]),
      (eg[uf(0x667)] = 0xe),
      (eg[uf(0xcd1)] = 0xb),
      (eg[uf(0x5e8)] = 2.2),
      (eg[uf(0xd80)] = [
        [uf(0x780), "J"],
        [uf(0xa64), "H"],
      ]);
    const eh = {};
    (eh[uf(0x9dd)] = uf(0xb54)),
      (eh[uf(0xab8)] = uf(0xd55)),
      (eh[uf(0x344)] = uf(0x80b)),
      (eh[uf(0x745)] = 0x7d),
      (eh[uf(0xab4)] = 0x28),
      (eh[uf(0x4e2)] = null),
      (eh[uf(0x48a)] = !![]),
      (eh[uf(0x37f)] = !![]),
      (eh[uf(0xd80)] = [
        [uf(0x440), "D"],
        [uf(0xaa1), "E"],
        [uf(0x5e3), "E"],
      ]),
      (eh[uf(0x4e2)] = 0x32),
      (eh[uf(0xd48)] = 0x32),
      (eh[uf(0x6e3)] = !![]),
      (eh[uf(0x6bf)] = -Math["PI"] / 0x2),
      (eh[uf(0xa01)] = cS[uf(0x628)]),
      (eh[uf(0xcb6)] = 0x3),
      (eh[uf(0xa03)] = 0x3),
      (eh[uf(0xd9f)] = 0x21),
      (eh[uf(0xcb3)] = 0.32),
      (eh[uf(0xb90)] = 0.4),
      (eh[uf(0x409)] = dN[uf(0xc1a)]);
    const ei = {};
    (ei[uf(0x9dd)] = uf(0x334)),
      (ei[uf(0xab8)] = uf(0x53c)),
      (ei[uf(0x344)] = uf(0x55a)),
      (ei[uf(0x745)] = 0x96),
      (ei[uf(0xab4)] = 0x14),
      (ei[uf(0x48a)] = !![]),
      (ei[uf(0x70a)] = 0.5),
      (ei[uf(0xd80)] = [
        [uf(0x334), "D"],
        [uf(0xc42), "J"],
        [uf(0xa64), "J"],
      ]);
    const ej = {};
    (ej[uf(0x9dd)] = uf(0xb4f)),
      (ej[uf(0xab8)] = uf(0x7b1)),
      (ej[uf(0x344)] = uf(0x4f2)),
      (ej[uf(0x745)] = 0x19),
      (ej[uf(0xab4)] = 0xf),
      (ej[uf(0x3e1)] = 0.05),
      (ej[uf(0x4e2)] = 0x37),
      (ej[uf(0xfd)] = !![]),
      (ej[uf(0xd80)] = [[uf(0xb4f), "h"]]),
      (ej[uf(0xa01)] = cS[uf(0x5f3)]),
      (ej[uf(0x150)] = 0x9),
      (ej[uf(0xd9f)] = 0x28),
      (ej[uf(0xcb6)] = 0xf),
      (ej[uf(0xa03)] = 2.5),
      (ej[uf(0xd9f)] = 0x21),
      (ej[uf(0xcb3)] = 0.32),
      (ej[uf(0xb90)] = 1.8),
      (ej[uf(0x1c4)] = 0x14);
    const ek = {};
    (ek[uf(0x9dd)] = uf(0x647)),
      (ek[uf(0xab8)] = uf(0x759)),
      (ek[uf(0x344)] = uf(0x5b3)),
      (ek[uf(0x745)] = 0xe1),
      (ek[uf(0xab4)] = 0xa),
      (ek[uf(0x4e2)] = 0x32),
      (ek[uf(0xd80)] = [
        [uf(0x647), "H"],
        [uf(0x88e), "L"],
      ]),
      (ek[uf(0x37f)] = !![]),
      (ek[uf(0x157)] = !![]),
      (ek[uf(0xcd1)] = 0x23);
    const em = {};
    (em[uf(0x9dd)] = uf(0x87b)),
      (em[uf(0xab8)] = uf(0x678)),
      (em[uf(0x344)] = uf(0xa1c)),
      (em[uf(0x745)] = 0x96),
      (em[uf(0xab4)] = 0x19),
      (em[uf(0x4e2)] = 0x2f),
      (em[uf(0x48a)] = !![]),
      (em[uf(0xd80)] = [[uf(0xa64), "J"]]),
      (em[uf(0xa01)] = null),
      (em[uf(0x409)] = dN[uf(0x9e6)]);
    const en = {};
    (en[uf(0x9dd)] = uf(0x63b)),
      (en[uf(0xab8)] = uf(0x9bd)),
      (en[uf(0x344)] = uf(0xb79)),
      (en[uf(0x745)] = 0x64),
      (en[uf(0xab4)] = 0x1e),
      (en[uf(0x4e2)] = 0x1e),
      (en[uf(0x48a)] = !![]),
      (en[uf(0xdab)] = uf(0x514)),
      (en[uf(0xd80)] = [
        [uf(0x514), "F"],
        [uf(0x588), "E"],
        [uf(0xb72), "D"],
        [uf(0x7ea), "E"],
      ]);
    const eo = {};
    (eo[uf(0x9dd)] = uf(0x318)),
      (eo[uf(0xab8)] = uf(0xc36)),
      (eo[uf(0x344)] = uf(0x67a)),
      (eo[uf(0x745)] = 0x64),
      (eo[uf(0xab4)] = 0xa),
      (eo[uf(0x4e2)] = 0x3c),
      (eo[uf(0xfd)] = !![]),
      (eo[uf(0x3e1)] = 0.05),
      (eo[uf(0xd80)] = [[uf(0x318), "D"]]);
    const ep = {};
    (ep[uf(0x9dd)] = uf(0x1fb)),
      (ep[uf(0xab8)] = uf(0x495)),
      (ep[uf(0x344)] = uf(0xcfe)),
      (ep[uf(0x745)] = 0x64),
      (ep[uf(0xab4)] = 0x23),
      (ep[uf(0x48a)] = !![]),
      (ep[uf(0xd80)] = [
        [uf(0xa9e), "E"],
        [uf(0x356), "D"],
      ]);
    const eq = {};
    (eq[uf(0x9dd)] = uf(0x6d7)),
      (eq[uf(0xab8)] = uf(0xac8)),
      (eq[uf(0x344)] = uf(0x8fd)),
      (eq[uf(0x745)] = 0xc8),
      (eq[uf(0xab4)] = 0x23),
      (eq[uf(0x4e2)] = 0x23),
      (eq[uf(0x48a)] = !![]),
      (eq[uf(0x2d2)] = 0x5),
      (eq[uf(0xd80)] = [
        [uf(0x43b), "F"],
        [uf(0x4c0), "D"],
        [uf(0x5ad), "E"],
      ]);
    const er = {};
    (er[uf(0x9dd)] = uf(0x93f)),
      (er[uf(0xab8)] = uf(0xd08)),
      (er[uf(0x344)] = uf(0x71a)),
      (er[uf(0x745)] = 0xc8),
      (er[uf(0xab4)] = 0x14),
      (er[uf(0x4e2)] = 0x28),
      (er[uf(0x48a)] = !![]),
      (er[uf(0xd80)] = [
        [uf(0x408), "E"],
        [uf(0x474), "D"],
        [uf(0x389), "F"],
        [uf(0xc96), "F"],
      ]),
      (er[uf(0x859)] = !![]),
      (er[uf(0x30e)] = 0xbb8),
      (er[uf(0xc28)] = 0.3);
    const es = {};
    (es[uf(0x9dd)] = uf(0x86a)),
      (es[uf(0xab8)] = uf(0xaaf)),
      (es[uf(0x344)] = uf(0x7d1)),
      (es[uf(0x745)] = 0x78),
      (es[uf(0xab4)] = 0x1e),
      (es[uf(0x157)] = !![]),
      (es[uf(0xcd1)] = 0xf),
      (es[uf(0x667)] = 0x5),
      (es[uf(0xd80)] = [
        [uf(0x86a), "F"],
        [uf(0x8ba), "E"],
        [uf(0x9e0), "D"],
      ]),
      (es[uf(0x2d2)] = 0x3);
    const et = {};
    (et[uf(0x9dd)] = uf(0x3c3)),
      (et[uf(0xab8)] = uf(0xa18)),
      (et[uf(0x344)] = uf(0x777)),
      (et[uf(0x745)] = 0x78),
      (et[uf(0xab4)] = 0x23),
      (et[uf(0x4e2)] = 0x32),
      (et[uf(0x48a)] = !![]),
      (et[uf(0x372)] = !![]),
      (et[uf(0xd80)] = [
        [uf(0x3c3), "E"],
        [uf(0xd4f), "F"],
      ]),
      (et[uf(0x5c8)] = [[uf(0x56e), 0x1]]),
      (et[uf(0x367)] = [[uf(0x56e), 0x2]]),
      (et[uf(0x74a)] = !![]);
    const eu = {};
    (eu[uf(0x9dd)] = uf(0x56e)),
      (eu[uf(0xab8)] = uf(0x57d)),
      (eu[uf(0x344)] = uf(0x3b7)),
      (eu[uf(0x745)] = 0x96),
      (eu[uf(0xab4)] = 0.1),
      (eu[uf(0x4e2)] = 0x28),
      (eu[uf(0x667)] = 0xe),
      (eu[uf(0xcd1)] = 11.6),
      (eu[uf(0x48a)] = !![]),
      (eu[uf(0x372)] = !![]),
      (eu[uf(0x59f)] = !![]),
      (eu[uf(0x409)] = dN[uf(0x43e)]),
      (eu[uf(0x586)] = 0xa),
      (eu[uf(0xd80)] = [[uf(0xd85), "G"]]),
      (eu[uf(0xb64)] = 0.5);
    const ev = {};
    (ev[uf(0x9dd)] = uf(0xbd1)),
      (ev[uf(0xab8)] = uf(0xcee)),
      (ev[uf(0x344)] = uf(0x630)),
      (ev[uf(0x745)] = 0x1f4),
      (ev[uf(0xab4)] = 0x28),
      (ev[uf(0x3e1)] = 0.05),
      (ev[uf(0x4e2)] = 0x32),
      (ev[uf(0xfd)] = !![]),
      (ev[uf(0xcd1)] = 0x5),
      (ev[uf(0x330)] = !![]),
      (ev[uf(0xcae)] = !![]),
      (ev[uf(0xd80)] = [
        [uf(0x3c1), "F"],
        [uf(0x73d), "C"],
      ]),
      (ev[uf(0x5c8)] = [
        [uf(0xb66), 0x2],
        [uf(0xc23), 0x1],
      ]),
      (ev[uf(0x367)] = [
        [uf(0xb66), 0x4],
        [uf(0xc23), 0x2],
      ]);
    const ew = {};
    (ew[uf(0x9dd)] = uf(0xa0e)),
      (ew[uf(0xab8)] = uf(0x163)),
      (ew[uf(0x344)] = uf(0x45e)),
      (ew[uf(0x745)] = 0x50),
      (ew[uf(0xab4)] = 0x28),
      (ew[uf(0x667)] = 0x2),
      (ew[uf(0xcd1)] = 0x6),
      (ew[uf(0x37f)] = !![]),
      (ew[uf(0xd80)] = [[uf(0xa0e), "F"]]);
    const ex = {};
    (ex[uf(0x9dd)] = uf(0x7bb)),
      (ex[uf(0xab8)] = uf(0xc46)),
      (ex[uf(0x344)] = uf(0xd43)),
      (ex[uf(0x745)] = 0x1f4),
      (ex[uf(0xab4)] = 0x28),
      (ex[uf(0x3e1)] = 0.05),
      (ex[uf(0x4e2)] = 0x46),
      (ex[uf(0xcd1)] = 0x5),
      (ex[uf(0xfd)] = !![]),
      (ex[uf(0x330)] = !![]),
      (ex[uf(0xcae)] = !![]),
      (ex[uf(0xd80)] = [
        [uf(0x187), "A"],
        [uf(0x269), "E"],
      ]),
      (ex[uf(0x5c8)] = [[uf(0x87d), 0x2]]),
      (ex[uf(0x367)] = [
        [uf(0x87d), 0x3],
        [uf(0x63b), 0x2],
      ]);
    const ey = {};
    (ey[uf(0x9dd)] = uf(0x432)),
      (ey[uf(0xab8)] = uf(0xbc5)),
      (ey[uf(0x344)] = uf(0x592)),
      (ey[uf(0x4e2)] = 0x28),
      (ey[uf(0x745)] = 0x64),
      (ey[uf(0xab4)] = 0xa),
      (ey[uf(0x3e1)] = 0.05),
      (ey[uf(0xfd)] = !![]),
      (ey[uf(0x6db)] = 0x1),
      (ey[uf(0x2d2)] = 0x1),
      (ey[uf(0xd80)] = [
        [uf(0x4c0), "G"],
        [uf(0xc42), "F"],
        [uf(0x19c), "F"],
      ]);
    const ez = {};
    (ez[uf(0x9dd)] = uf(0x43f)),
      (ez[uf(0xab8)] = uf(0x382)),
      (ez[uf(0x344)] = uf(0x37d)),
      (ez[uf(0x745)] = 0x3c),
      (ez[uf(0xab4)] = 0x28),
      (ez[uf(0x4e2)] = 0x32),
      (ez[uf(0x48a)] = ![]),
      (ez[uf(0x346)] = ![]),
      (ez[uf(0x409)] = dN[uf(0x43e)]),
      (ez[uf(0x667)] = 0xe),
      (ez[uf(0xcd1)] = 0xb),
      (ez[uf(0x5e8)] = 2.2),
      (ez[uf(0xd80)] = [
        [uf(0x356), "E"],
        [uf(0xa64), "J"],
      ]);
    const eA = {};
    (eA[uf(0x9dd)] = uf(0xb3b)),
      (eA[uf(0xab8)] = uf(0x454)),
      (eA[uf(0x344)] = uf(0x7ab)),
      (eA[uf(0x745)] = 0x258),
      (eA[uf(0xab4)] = 0x32),
      (eA[uf(0x3e1)] = 0.05),
      (eA[uf(0x4e2)] = 0x3c),
      (eA[uf(0xcd1)] = 0x7),
      (eA[uf(0xcae)] = !![]),
      (eA[uf(0xfd)] = !![]),
      (eA[uf(0x330)] = !![]),
      (eA[uf(0xd80)] = [
        [uf(0x408), "A"],
        [uf(0x780), "G"],
      ]),
      (eA[uf(0x5c8)] = [[uf(0x93f), 0x1]]),
      (eA[uf(0x367)] = [[uf(0x93f), 0x1]]);
    const eB = {};
    (eB[uf(0x9dd)] = uf(0x784)),
      (eB[uf(0xab8)] = uf(0x646)),
      (eB[uf(0x344)] = uf(0x5a6)),
      (eB[uf(0x745)] = 0xc8),
      (eB[uf(0xab4)] = 0x1e),
      (eB[uf(0x4e2)] = 0x2d),
      (eB[uf(0x48a)] = !![]),
      (eB[uf(0xd80)] = [
        [uf(0x968), "G"],
        [uf(0x7f7), "H"],
        [uf(0x9e0), "E"],
      ]);
    const eC = {};
    (eC[uf(0x9dd)] = uf(0xd03)),
      (eC[uf(0xab8)] = uf(0x98c)),
      (eC[uf(0x344)] = uf(0xab9)),
      (eC[uf(0x745)] = 0x3c),
      (eC[uf(0xab4)] = 0x64),
      (eC[uf(0x4e2)] = 0x28),
      (eC[uf(0xa8f)] = !![]),
      (eC[uf(0xa80)] = ![]),
      (eC[uf(0x48a)] = !![]),
      (eC[uf(0xd80)] = [
        [uf(0x474), "F"],
        [uf(0x25b), "D"],
        [uf(0x438), "G"],
      ]);
    const eD = {};
    (eD[uf(0x9dd)] = uf(0xc27)),
      (eD[uf(0xab8)] = uf(0x71f)),
      (eD[uf(0x344)] = uf(0xa35)),
      (eD[uf(0x4e2)] = 0x28),
      (eD[uf(0x745)] = 0x5a),
      (eD[uf(0xab4)] = 0x5),
      (eD[uf(0x3e1)] = 0.05),
      (eD[uf(0xfd)] = !![]),
      (eD[uf(0xd80)] = [[uf(0xc27), "h"]]);
    const eE = {};
    (eE[uf(0x9dd)] = uf(0x473)),
      (eE[uf(0xab8)] = uf(0x67b)),
      (eE[uf(0x344)] = uf(0x53b)),
      (eE[uf(0x745)] = 0x32),
      (eE[uf(0xab4)] = 0x14),
      (eE[uf(0x4e2)] = 0x28),
      (eE[uf(0x37f)] = !![]),
      (eE[uf(0xd80)] = [[uf(0x473), "F"]]);
    const eF = {};
    (eF[uf(0x9dd)] = uf(0x179)),
      (eF[uf(0xab8)] = uf(0xab1)),
      (eF[uf(0x344)] = uf(0xb6f)),
      (eF[uf(0x745)] = 0x32),
      (eF[uf(0xab4)] = 0x14),
      (eF[uf(0x3e1)] = 0.05),
      (eF[uf(0xfd)] = !![]),
      (eF[uf(0xd80)] = [[uf(0x179), "J"]]);
    const eG = {};
    (eG[uf(0x9dd)] = uf(0xbd7)),
      (eG[uf(0xab8)] = uf(0x625)),
      (eG[uf(0x344)] = uf(0x3ee)),
      (eG[uf(0x745)] = 0x64),
      (eG[uf(0xab4)] = 0x1e),
      (eG[uf(0x3e1)] = 0.05),
      (eG[uf(0x4e2)] = 0x32),
      (eG[uf(0xfd)] = !![]),
      (eG[uf(0xd80)] = [
        [uf(0x474), "D"],
        [uf(0x57f), "E"],
      ]);
    const eH = {};
    (eH[uf(0x9dd)] = uf(0x9c4)),
      (eH[uf(0xab8)] = uf(0x8b1)),
      (eH[uf(0x344)] = uf(0x2ff)),
      (eH[uf(0x745)] = 0x96),
      (eH[uf(0xab4)] = 0x14),
      (eH[uf(0x4e2)] = 0x28),
      (eH[uf(0xd80)] = [
        [uf(0xab3), "D"],
        [uf(0x8ba), "F"],
      ]),
      (eH[uf(0x367)] = [[uf(0xab6), 0x1, 0.3]]);
    const eI = {};
    (eI[uf(0x9dd)] = uf(0x4cb)),
      (eI[uf(0xab8)] = uf(0x666)),
      (eI[uf(0x344)] = uf(0x15e)),
      (eI[uf(0x745)] = 0x32),
      (eI[uf(0xab4)] = 0x5),
      (eI[uf(0x3e1)] = 0.05),
      (eI[uf(0xfd)] = !![]),
      (eI[uf(0xd80)] = [
        [uf(0x4cb), "h"],
        [uf(0x25b), "J"],
      ]);
    const eJ = {};
    (eJ[uf(0x9dd)] = uf(0x733)),
      (eJ[uf(0xab8)] = uf(0x4b3)),
      (eJ[uf(0x344)] = uf(0x60f)),
      (eJ[uf(0x745)] = 0x64),
      (eJ[uf(0xab4)] = 0x5),
      (eJ[uf(0x3e1)] = 0.05),
      (eJ[uf(0xfd)] = !![]),
      (eJ[uf(0xd80)] = [[uf(0x733), "h"]]);
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
      eL = eK[uf(0x28c)],
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
      (eN[qW] = [qX]), (qX[uf(0x344)] = cS[qX[uf(0x344)]]), eR(qX);
      qX[uf(0xd80)] &&
        qX[uf(0xd80)][uf(0x96e)]((qZ) => {
          const us = uf;
          qZ[0x1] = qZ[0x1][us(0x6f5)]()[us(0x897)](0x0) - 0x41;
        });
      (qX["id"] = qW), (qX[uf(0x959)] = qW);
      if (!qX[uf(0x789)]) qX[uf(0x789)] = qX[uf(0x9dd)];
      for (let qZ = 0x1; qZ <= db; qZ++) {
        const r0 = JSON[uf(0xcb7)](JSON[uf(0xbb8)](qX));
        (r0[uf(0x9dd)] = qX[uf(0x9dd)] + "_" + qZ),
          (r0[uf(0x24f)] = qZ),
          (eN[qW][qZ] = r0),
          dJ(qX, r0),
          eR(r0),
          (r0["id"] = eK[uf(0x28c)]),
          eK[uf(0x462)](r0);
      }
    }
    for (let r1 = 0x0; r1 < eK[uf(0x28c)]; r1++) {
      const r2 = eK[r1];
      r2[uf(0x5c8)] && eQ(r2, r2[uf(0x5c8)]),
        r2[uf(0x367)] && eQ(r2, r2[uf(0x367)]);
    }
    function eQ(r3, r4) {
      const ut = uf;
      r4[ut(0x96e)]((r5) => {
        const uu = ut,
          r6 = r5[0x0] + (r3[uu(0x24f)] > 0x0 ? "_" + r3[uu(0x24f)] : "");
        r5[0x0] = eM[r6];
      });
    }
    function eR(r3) {
      const uv = uf;
      (r3[uv(0x81b)] = dg(r3[uv(0x24f)], r3[uv(0x745)]) * dL[r3[uv(0x24f)]]),
        (r3[uv(0x8df)] = dg(r3[uv(0x24f)], r3[uv(0xab4)])),
        r3[uv(0x6e3)]
          ? (r3[uv(0xd48)] = r3[uv(0x4e2)])
          : (r3[uv(0xd48)] = r3[uv(0x4e2)] * dM[r3[uv(0x24f)]]),
        (r3[uv(0x407)] = dg(r3[uv(0x24f)], r3[uv(0x9df)])),
        (r3[uv(0x5e6)] = dg(r3[uv(0x24f)], r3[uv(0xcb6)])),
        (r3[uv(0x6a2)] = dg(r3[uv(0x24f)], r3[uv(0xa03)]) * dL[r3[uv(0x24f)]]),
        (r3[uv(0x923)] = dg(r3[uv(0x24f)], r3[uv(0xb0f)])),
        r3[uv(0xc28)] && (r3[uv(0x4b7)] = dg(r3[uv(0x24f)], r3[uv(0xc28)])),
        (r3[uv(0xbcb)] = dg(r3[uv(0x24f)], r3[uv(0xd7a)])),
        (eM[r3[uv(0x9dd)]] = r3),
        eO[r3[uv(0x24f)]][uv(0x462)](r3);
    }
    function eS(r3) {
      return (r3 / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(r3) {
      const uw = uf;
      return (
        (r3 %= eT), r3 < 0x0 && (r3 += eT), Math[uw(0x7cc)]((r3 / eT) * 0xff)
      );
    }
    function eV(r3) {
      const ux = uf;
      if (!r3 || r3[ux(0x28c)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        ux(0x21d)
      ](r3);
    }
    function eW(r3, r4) {
      return dF[r3 + (r4 > 0x0 ? "_" + r4 : "")];
    }
    var eX = da[uf(0x196)]((r3) => r3[uf(0x13e)]() + uf(0x8a4)),
      eY = da[uf(0x196)]((r3) => uf(0xa0b) + r3 + uf(0x58f)),
      eZ = {};
    eX[uf(0x96e)]((r3) => {
      eZ[r3] = 0x0;
    });
    var f0 = {};
    eY[uf(0x96e)]((r3) => {
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
        timeJoined: Date[uy(0x160)]() * f1,
      };
    }
    var f3 = uf(0xbd4)[uf(0x2a0)]("\x20");
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
    for (let r3 = 0x0; r3 < f5[uf(0x28c)]; r3++) {
      const r4 = f5[r3],
        r5 = r4[r4[uf(0x28c)] - 0x1],
        r6 = dO(r5);
      for (let r7 = 0x0; r7 < r6[uf(0x28c)]; r7++) {
        const r8 = r6[r7];
        if (r8[0x0] < 0x1e) {
          let r9 = r8[0x0];
          (r9 *= 1.5),
            r9 < 1.5 && (r9 *= 0xa),
            (r9 = parseFloat(r9[uf(0x24a)](0x3))),
            (r8[0x0] = r9);
        }
        r8[0x1] = d9[uf(0x4c8)];
      }
      r6[uf(0x462)]([0.01, d9[uf(0xb32)]]), r4[uf(0x462)](r6);
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
      instagram: uf(0x550),
      discord: uf(0x69a),
      paw: uf(0x4c1),
      gear: uf(0x6aa),
      scroll: uf(0x6a7),
      bag: uf(0x8e3),
      food: uf(0xa5c),
      graph: uf(0xd13),
      resize: uf(0x2e7),
      users: uf(0x75f),
      trophy: uf(0xaff),
      shop: uf(0x877),
      dice: uf(0x152),
      poopPath: new Path2D(uf(0xb95)),
    };
    function fa(ra) {
      const uz = uf;
      return ra[uz(0x5fe)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(ra) {
      const uA = uf;
      
      if(hack.isEnabled('disableChatCheck')) return ra;
      return (
        (ra = fa(ra)),
        (ra = ra[uA(0x5fe)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uA(0x5fe)](/(.)\1{2,}/gi, "$1")
          [uA(0x5fe)](/\u200B|\u200C|\u200D/g, "")
          [uA(0x55e)]()),
        !ra && (ra = uA(0x8ef)),
        ra
      );
    }
    var fc = 0x103;
    function fd(ra) {
      const uB = uf,
        rb = ra[uB(0x2a0)]("\x0a")[uB(0x27e)](
          (rc) => rc[uB(0x55e)]()[uB(0x28c)] > 0x0
        );
      return { title: rb[uB(0x200)](), content: rb };
    }
    const fe = {};
    (fe[uf(0xd5c)] = uf(0x296)),
      (fe[uf(0xd24)] = [
        uf(0x986),
        uf(0x2eb),
        uf(0x69f),
        uf(0xbe7),
        uf(0xd78),
        uf(0x202),
        uf(0xcd2),
        uf(0x190),
      ]);
    const ff = {};
    (ff[uf(0xd5c)] = uf(0x86f)), (ff[uf(0xd24)] = [uf(0x699)]);
    const fg = {};
    (fg[uf(0xd5c)] = uf(0xc79)),
      (fg[uf(0xd24)] = [uf(0x2b3), uf(0x8a6), uf(0x1ed), uf(0xdc8)]);
    const fh = {};
    (fh[uf(0xd5c)] = uf(0x700)),
      (fh[uf(0xd24)] = [
        uf(0xcc6),
        uf(0x16c),
        uf(0xdea),
        uf(0x9ce),
        uf(0xc49),
        uf(0x8a7),
        uf(0x347),
        uf(0x643),
        uf(0x5da),
      ]);
    const fi = {};
    (fi[uf(0xd5c)] = uf(0x214)),
      (fi[uf(0xd24)] = [uf(0x86d), uf(0xca8), uf(0x3b3), uf(0x888)]);
    const fj = {};
    (fj[uf(0xd5c)] = uf(0x3f0)), (fj[uf(0xd24)] = [uf(0x46b)]);
    const fk = {};
    (fk[uf(0xd5c)] = uf(0xcda)), (fk[uf(0xd24)] = [uf(0x9e2), uf(0xbc4)]);
    const fl = {};
    (fl[uf(0xd5c)] = uf(0x75d)),
      (fl[uf(0xd24)] = [
        uf(0xcdc),
        uf(0x9b0),
        uf(0x1e8),
        uf(0x270),
        uf(0x181),
        uf(0x85d),
        uf(0xc16),
        uf(0xf3),
      ]);
    const fm = {};
    (fm[uf(0xd5c)] = uf(0x8f3)),
      (fm[uf(0xd24)] = [
        uf(0xacb),
        uf(0xc25),
        uf(0xa8a),
        uf(0xc6e),
        uf(0x1e7),
        uf(0x62d),
        uf(0xd3a),
        uf(0x3a9),
      ]);
    const fn = {};
    (fn[uf(0xd5c)] = uf(0xc06)), (fn[uf(0xd24)] = [uf(0x28d)]);
    const fo = {};
    (fo[uf(0xd5c)] = uf(0xa0a)),
      (fo[uf(0xd24)] = [
        uf(0x12c),
        uf(0x1e9),
        uf(0x88c),
        uf(0xd39),
        uf(0xb09),
        uf(0x9ff),
        uf(0xfb),
      ]);
    const fp = {};
    (fp[uf(0xd5c)] = uf(0xa99)), (fp[uf(0xd24)] = [uf(0x32a)]);
    const fq = {};
    (fq[uf(0xd5c)] = uf(0x35c)),
      (fq[uf(0xd24)] = [uf(0xbd3), uf(0x335), uf(0xef), uf(0xb27)]);
    const fr = {};
    (fr[uf(0xd5c)] = uf(0x457)), (fr[uf(0xd24)] = [uf(0x66f), uf(0x8f9)]);
    const fs = {};
    (fs[uf(0xd5c)] = uf(0x764)),
      (fs[uf(0xd24)] = [uf(0x38c), uf(0x208), uf(0x4bd), uf(0x25a)]);
    const ft = {};
    (ft[uf(0xd5c)] = uf(0x808)),
      (ft[uf(0xd24)] = [uf(0x908), uf(0xa54), uf(0xb62), uf(0xa3c)]);
    const fu = {};
    (fu[uf(0xd5c)] = uf(0x2a5)),
      (fu[uf(0xd24)] = [
        uf(0x715),
        uf(0x27f),
        uf(0x35d),
        uf(0xd88),
        uf(0x75a),
        uf(0x48d),
      ]);
    const fv = {};
    (fv[uf(0xd5c)] = uf(0x2a1)), (fv[uf(0xd24)] = [uf(0x694)]);
    const fw = {};
    (fw[uf(0xd5c)] = uf(0x1bf)), (fw[uf(0xd24)] = [uf(0x3bd), uf(0x375)]);
    const fx = {};
    (fx[uf(0xd5c)] = uf(0xde0)),
      (fx[uf(0xd24)] = [uf(0x149), uf(0xc63), uf(0x1b1)]);
    const fy = {};
    (fy[uf(0xd5c)] = uf(0x7db)),
      (fy[uf(0xd24)] = [uf(0xc14), uf(0x2ef), uf(0x11b), uf(0x7d0), uf(0x865)]);
    const fz = {};
    (fz[uf(0xd5c)] = uf(0x21c)), (fz[uf(0xd24)] = [uf(0x960), uf(0x906)]);
    const fA = {};
    (fA[uf(0xd5c)] = uf(0x8be)),
      (fA[uf(0xd24)] = [uf(0x2b9), uf(0x4f5), uf(0x73c)]);
    const fB = {};
    (fB[uf(0xd5c)] = uf(0x174)), (fB[uf(0xd24)] = [uf(0x1dd)]);
    const fC = {};
    (fC[uf(0xd5c)] = uf(0x77c)), (fC[uf(0xd24)] = [uf(0x818)]);
    const fD = {};
    (fD[uf(0xd5c)] = uf(0xbca)), (fD[uf(0xd24)] = [uf(0x195)]);
    const fE = {};
    (fE[uf(0xd5c)] = uf(0x20b)),
      (fE[uf(0xd24)] = [uf(0x2ad), uf(0x73e), uf(0x113)]);
    const fF = {};
    (fF[uf(0xd5c)] = uf(0x293)),
      (fF[uf(0xd24)] = [
        uf(0x6d3),
        uf(0x8c9),
        uf(0xcbc),
        uf(0xd97),
        uf(0xdb3),
        uf(0x1b9),
        uf(0xb7e),
        uf(0x4f7),
        uf(0x851),
        uf(0xcf7),
        uf(0x5bd),
        uf(0x1ee),
        uf(0x15a),
        uf(0x43d),
      ]);
    const fG = {};
    (fG[uf(0xd5c)] = uf(0x713)),
      (fG[uf(0xd24)] = [
        uf(0x18c),
        uf(0x4b9),
        uf(0x295),
        uf(0x366),
        uf(0x929),
        uf(0x1cc),
        uf(0x843),
        uf(0xfe),
      ]);
    const fH = {};
    (fH[uf(0xd5c)] = uf(0xb87)),
      (fH[uf(0xd24)] = [
        uf(0xda7),
        uf(0x626),
        uf(0xb46),
        uf(0x788),
        uf(0x486),
        uf(0x1ae),
        uf(0x911),
        uf(0x4ce),
        uf(0xb8e),
        uf(0x145),
        uf(0x8e8),
        uf(0xc19),
        uf(0x5b8),
        uf(0x2e1),
      ]);
    const fI = {};
    (fI[uf(0xd5c)] = uf(0x27a)),
      (fI[uf(0xd24)] = [
        uf(0x3ec),
        uf(0x8a8),
        uf(0xa57),
        uf(0x933),
        uf(0x6f7),
        uf(0x1b8),
        uf(0x93a),
      ]);
    const fJ = {};
    (fJ[uf(0xd5c)] = uf(0x990)),
      (fJ[uf(0xd24)] = [
        uf(0x60b),
        uf(0xb7b),
        uf(0xd93),
        uf(0x11d),
        uf(0x665),
        uf(0x635),
        uf(0x279),
        uf(0x752),
        uf(0x56d),
        uf(0x39d),
        uf(0xb2c),
        uf(0x314),
        uf(0x397),
        uf(0xbff),
      ]);
    const fK = {};
    (fK[uf(0xd5c)] = uf(0x8da)),
      (fK[uf(0xd24)] = [
        uf(0x2cc),
        uf(0xff),
        uf(0xb6b),
        uf(0x9f5),
        uf(0x30f),
        uf(0x92f),
        uf(0xd61),
        uf(0xbb5),
        uf(0xcff),
        uf(0xd8c),
        uf(0xa70),
        uf(0x85a),
        uf(0x6dc),
        uf(0xac0),
        uf(0x692),
      ]);
    const fL = {};
    (fL[uf(0xd5c)] = uf(0x17e)),
      (fL[uf(0xd24)] = [
        uf(0xc13),
        uf(0x919),
        uf(0x7a4),
        uf(0xbae),
        uf(0x82d),
        uf(0x690),
        uf(0xb85),
        uf(0x728),
        uf(0x750),
        uf(0xdc0),
        uf(0xa6a),
        uf(0xae1),
        uf(0x3bf),
      ]);
    const fM = {};
    (fM[uf(0xd5c)] = uf(0xd74)),
      (fM[uf(0xd24)] = [
        uf(0xaba),
        uf(0x9f6),
        uf(0xbf2),
        uf(0xbf0),
        uf(0x949),
        uf(0xb4c),
      ]);
    const fN = {};
    (fN[uf(0xd5c)] = uf(0x866)),
      (fN[uf(0xd24)] = [
        uf(0x98a),
        uf(0x67d),
        uf(0xd90),
        uf(0x4db),
        uf(0xc9d),
        uf(0x81a),
        uf(0xc48),
        uf(0x66e),
        uf(0xdf1),
      ]);
    const fO = {};
    (fO[uf(0xd5c)] = uf(0x866)),
      (fO[uf(0xd24)] = [
        uf(0x23a),
        uf(0x26f),
        uf(0xc09),
        uf(0x6c3),
        uf(0xbbf),
        uf(0x86b),
        uf(0x498),
        uf(0xa33),
        uf(0x8b3),
        uf(0xdcf),
        uf(0x6b7),
        uf(0xade),
        uf(0x734),
        uf(0xa56),
        uf(0x5b4),
        uf(0x597),
        uf(0xb89),
      ]);
    const fP = {};
    (fP[uf(0xd5c)] = uf(0x6a6)), (fP[uf(0xd24)] = [uf(0x9d0), uf(0x896)]);
    const fQ = {};
    (fQ[uf(0xd5c)] = uf(0x989)),
      (fQ[uf(0xd24)] = [uf(0xd9e), uf(0x4b2), uf(0x69d)]);
    const fR = {};
    (fR[uf(0xd5c)] = uf(0x9f2)),
      (fR[uf(0xd24)] = [uf(0xdf5), uf(0x8f7), uf(0x51d), uf(0x946)]);
    const fS = {};
    (fS[uf(0xd5c)] = uf(0x8d8)),
      (fS[uf(0xd24)] = [
        uf(0x2bc),
        uf(0x1da),
        uf(0x10f),
        uf(0xdd0),
        uf(0x6a9),
        uf(0x8db),
      ]);
    const fT = {};
    (fT[uf(0xd5c)] = uf(0x93e)), (fT[uf(0xd24)] = [uf(0x58e)]);
    const fU = {};
    (fU[uf(0xd5c)] = uf(0x3e2)),
      (fU[uf(0xd24)] = [
        uf(0x9a7),
        uf(0x7a9),
        uf(0x57c),
        uf(0x83a),
        uf(0x3b8),
        uf(0x159),
        uf(0x9ba),
        uf(0x987),
      ]);
    const fV = {};
    (fV[uf(0xd5c)] = uf(0x640)), (fV[uf(0xd24)] = [uf(0xb7a), uf(0x1f2)]);
    const fW = {};
    (fW[uf(0xd5c)] = uf(0x3a8)),
      (fW[uf(0xd24)] = [uf(0xc2a), uf(0xc2f), uf(0x10a), uf(0x8ca), uf(0xcf4)]);
    const fX = {};
    (fX[uf(0xd5c)] = uf(0xda2)),
      (fX[uf(0xd24)] = [
        uf(0x82c),
        uf(0x353),
        uf(0x7cb),
        uf(0xaf3),
        uf(0xd0d),
        uf(0x5ba),
        uf(0x311),
        uf(0xbe0),
        uf(0x358),
      ]);
    const fY = {};
    (fY[uf(0xd5c)] = uf(0x393)),
      (fY[uf(0xd24)] = [
        uf(0xdf3),
        uf(0xa2e),
        uf(0x957),
        uf(0x429),
        uf(0x31d),
        uf(0xdce),
        uf(0xd2e),
        uf(0x526),
      ]);
    const fZ = {};
    (fZ[uf(0xd5c)] = uf(0x2f5)),
      (fZ[uf(0xd24)] = [
        uf(0x622),
        uf(0x99b),
        uf(0xd59),
        uf(0x9eb),
        uf(0xc08),
        uf(0xc99),
        uf(0x38f),
        uf(0x7cd),
        uf(0x8d3),
      ]);
    const g0 = {};
    (g0[uf(0xd5c)] = uf(0x606)),
      (g0[uf(0xd24)] = [
        uf(0x7a8),
        uf(0xd27),
        uf(0xbfc),
        uf(0xc99),
        uf(0x915),
        uf(0x332),
        uf(0x7d2),
        uf(0x25d),
        uf(0xb38),
        uf(0x4d7),
        uf(0x3cb),
      ]);
    const g1 = {};
    (g1[uf(0xd5c)] = uf(0x606)),
      (g1[uf(0xd24)] = [uf(0x651), uf(0x72b), uf(0x3ef), uf(0xae4), uf(0x490)]);
    const g2 = {};
    (g2[uf(0xd5c)] = uf(0x6a4)), (g2[uf(0xd24)] = [uf(0xa4a), uf(0x94a)]);
    const g3 = {};
    (g3[uf(0xd5c)] = uf(0x55f)), (g3[uf(0xd24)] = [uf(0x537)]);
    const g4 = {};
    (g4[uf(0xd5c)] = uf(0x323)),
      (g4[uf(0xd24)] = [uf(0x5be), uf(0x68d), uf(0x2bb), uf(0xb51)]);
    const g5 = {};
    (g5[uf(0xd5c)] = uf(0x337)),
      (g5[uf(0xd24)] = [uf(0xc93), uf(0x245), uf(0x5d6), uf(0x127)]);
    const g6 = {};
    (g6[uf(0xd5c)] = uf(0x337)),
      (g6[uf(0xd24)] = [
        uf(0x349),
        uf(0xd61),
        uf(0xdf8),
        uf(0xc6f),
        uf(0x14e),
        uf(0x228),
        uf(0x449),
        uf(0x835),
        uf(0x430),
        uf(0xb7d),
        uf(0x3c0),
        uf(0x395),
        uf(0x5d2),
        uf(0x234),
        uf(0x171),
        uf(0x2aa),
        uf(0xcab),
        uf(0xd70),
        uf(0x6a0),
        uf(0x8fc),
      ]);
    const g7 = {};
    (g7[uf(0xd5c)] = uf(0xd89)),
      (g7[uf(0xd24)] = [uf(0x736), uf(0x399), uf(0xd9b), uf(0x868)]);
    const g8 = {};
    (g8[uf(0xd5c)] = uf(0x617)),
      (g8[uf(0xd24)] = [uf(0x26c), uf(0x1f8), uf(0xaec)]);
    const g9 = {};
    (g9[uf(0xd5c)] = uf(0x7c2)),
      (g9[uf(0xd24)] = [
        uf(0x913),
        uf(0x37e),
        uf(0x528),
        uf(0x4a2),
        uf(0x47a),
        uf(0x9da),
        uf(0x325),
        uf(0x216),
        uf(0x3ac),
        uf(0x657),
        uf(0x260),
        uf(0x72c),
        uf(0xd41),
        uf(0xdd9),
        uf(0x343),
      ]);
    const ga = {};
    (ga[uf(0xd5c)] = uf(0x20c)), (ga[uf(0xd24)] = [uf(0x470), uf(0xd53)]);
    const gb = {};
    (gb[uf(0xd5c)] = uf(0x4bf)),
      (gb[uf(0xd24)] = [uf(0x410), uf(0x90d), uf(0x7d6)]);
    const gc = {};
    (gc[uf(0xd5c)] = uf(0x120)),
      (gc[uf(0xd24)] = [uf(0x577), uf(0x117), uf(0x650)]);
    const gd = {};
    (gd[uf(0xd5c)] = uf(0x49f)),
      (gd[uf(0xd24)] = [uf(0x4a9), uf(0xcba), uf(0x2a9), uf(0xc11)]);
    const ge = {};
    (ge[uf(0xd5c)] = uf(0x8ed)),
      (ge[uf(0xd24)] = [uf(0x99a), uf(0x747), uf(0xa0c)]);
    const gf = {};
    (gf[uf(0xd5c)] = uf(0x47b)),
      (gf[uf(0xd24)] = [
        uf(0xd61),
        uf(0x132),
        uf(0xc61),
        uf(0x15b),
        uf(0x182),
        uf(0x12f),
        uf(0x912),
        uf(0x76b),
        uf(0x39c),
        uf(0xbd6),
        uf(0x742),
        uf(0xba4),
        uf(0x775),
        uf(0x4ad),
        uf(0xccf),
        uf(0x59e),
        uf(0x999),
        uf(0xd96),
        uf(0x52e),
        uf(0xb0e),
        uf(0x9e9),
        uf(0x51f),
        uf(0x795),
        uf(0x55d),
      ]);
    const gg = {};
    (gg[uf(0xd5c)] = uf(0xa02)),
      (gg[uf(0xd24)] = [uf(0x281), uf(0xbaf), uf(0x6e2), uf(0xbc0)]);
    const gh = {};
    (gh[uf(0xd5c)] = uf(0x9b8)),
      (gh[uf(0xd24)] = [
        uf(0x941),
        uf(0x7b9),
        uf(0x137),
        uf(0xd61),
        uf(0x9c1),
        uf(0x6b6),
        uf(0xdbb),
        uf(0x3cf),
      ]);
    const gi = {};
    (gi[uf(0xd5c)] = uf(0x619)),
      (gi[uf(0xd24)] = [
        uf(0x110),
        uf(0x3c7),
        uf(0x4a2),
        uf(0x798),
        uf(0x26a),
        uf(0xba0),
        uf(0x7dd),
        uf(0x97c),
        uf(0x5fc),
        uf(0xd63),
        uf(0x472),
        uf(0x199),
        uf(0x4f9),
        uf(0x456),
        uf(0x8c3),
        uf(0xddc),
        uf(0x96b),
      ]);
    const gj = {};
    (gj[uf(0xd5c)] = uf(0x44e)),
      (gj[uf(0xd24)] = [
        uf(0xde1),
        uf(0x555),
        uf(0xbc6),
        uf(0x74b),
        uf(0xd19),
        uf(0xa68),
        uf(0xdd3),
        uf(0xa81),
        uf(0x198),
        uf(0x6c9),
        uf(0xd7f),
      ]);
    const gk = {};
    (gk[uf(0xd5c)] = uf(0xda4)),
      (gk[uf(0xd24)] = [
        uf(0x41f),
        uf(0x327),
        uf(0x5ed),
        uf(0x1c7),
        uf(0x6c0),
        uf(0x5b6),
        uf(0x15d),
        uf(0x331),
        uf(0x3fa),
        uf(0xc6d),
      ]);
    const gl = {};
    (gl[uf(0xd5c)] = uf(0xda4)),
      (gl[uf(0xd24)] = [
        uf(0x687),
        uf(0x956),
        uf(0x748),
        uf(0xc5f),
        uf(0xc0f),
        uf(0xb57),
        uf(0x354),
        uf(0xa1f),
        uf(0x51e),
        uf(0xb0a),
      ]);
    const gm = {};
    (gm[uf(0xd5c)] = uf(0x12e)),
      (gm[uf(0xd24)] = [
        uf(0xcec),
        uf(0xaf5),
        uf(0x860),
        uf(0x3ab),
        uf(0x62a),
        uf(0xd49),
        uf(0xd06),
        uf(0xc4f),
        uf(0x140),
        uf(0x1b2),
      ]);
    const gn = {};
    (gn[uf(0xd5c)] = uf(0x12e)),
      (gn[uf(0xd24)] = [
        uf(0x651),
        uf(0x5ea),
        uf(0x1cf),
        uf(0xc7f),
        uf(0x79c),
        uf(0xbe2),
        uf(0x927),
        uf(0x5d3),
        uf(0x948),
        uf(0x59c),
        uf(0x3b6),
      ]);
    const go = {};
    (go[uf(0xd5c)] = uf(0x231)),
      (go[uf(0xd24)] = [uf(0x207), uf(0x128), uf(0x51a)]);
    const gp = {};
    (gp[uf(0xd5c)] = uf(0x231)),
      (gp[uf(0xd24)] = [
        uf(0x3be),
        uf(0x232),
        uf(0xa14),
        uf(0x7b0),
        uf(0xc76),
        uf(0x506),
        uf(0x540),
        uf(0x7e1),
      ]);
    const gq = {};
    (gq[uf(0xd5c)] = uf(0x478)),
      (gq[uf(0xd24)] = [uf(0xbc7), uf(0x779), uf(0x9a3)]);
    const gr = {};
    (gr[uf(0xd5c)] = uf(0x478)),
      (gr[uf(0xd24)] = [
        uf(0xc33),
        uf(0xdf1),
        uf(0xaf9),
        uf(0x54e),
        uf(0x83f),
        uf(0x594),
      ]);
    const gs = {};
    (gs[uf(0xd5c)] = uf(0x478)),
      (gs[uf(0xd24)] = [uf(0xdfc), uf(0x658), uf(0x3aa), uf(0x2ea)]);
    const gt = {};
    (gt[uf(0xd5c)] = uf(0x478)),
      (gt[uf(0xd24)] = [
        uf(0x631),
        uf(0xa2b),
        uf(0x954),
        uf(0x391),
        uf(0x17a),
        uf(0x229),
        uf(0x2f1),
        uf(0x8ec),
        uf(0x252),
        uf(0x580),
        uf(0xa21),
      ]);
    const gu = {};
    (gu[uf(0xd5c)] = uf(0x92b)),
      (gu[uf(0xd24)] = [uf(0x834), uf(0x8ea), uf(0x6b5)]);
    const gv = {};
    (gv[uf(0xd5c)] = uf(0xb25)),
      (gv[uf(0xd24)] = [
        uf(0xd5b),
        uf(0xdcd),
        uf(0xdf1),
        uf(0x5c3),
        uf(0x781),
        uf(0xaad),
        uf(0x881),
        uf(0xb8d),
        uf(0x54c),
        uf(0x5d7),
        uf(0x1b3),
        uf(0xbbc),
        uf(0x4a2),
        uf(0x19f),
        uf(0xd67),
        uf(0x5f9),
        uf(0x31e),
        uf(0x810),
        uf(0x80a),
        uf(0x188),
        uf(0x424),
        uf(0x937),
        uf(0x3e8),
        uf(0xc60),
        uf(0x12b),
        uf(0x25e),
        uf(0x696),
        uf(0xac1),
        uf(0x8ff),
        uf(0x309),
        uf(0x69b),
        uf(0x480),
        uf(0x1a7),
        uf(0x722),
      ]);
    const gw = {};
    (gw[uf(0xd5c)] = uf(0x381)), (gw[uf(0xd24)] = [uf(0x47e)]);
    const gx = {};
    (gx[uf(0xd5c)] = uf(0x5bc)),
      (gx[uf(0xd24)] = [
        uf(0x4b6),
        uf(0xa6d),
        uf(0xafa),
        uf(0xd30),
        uf(0xad1),
        uf(0x983),
        uf(0x9f9),
        uf(0x4a2),
        uf(0xb61),
        uf(0x7d9),
        uf(0xceb),
        uf(0xd31),
        uf(0x211),
        uf(0xcf6),
        uf(0x1ad),
        uf(0x94c),
        uf(0x477),
        uf(0x111),
        uf(0x3b4),
        uf(0xd21),
        uf(0xc77),
        uf(0x12a),
        uf(0x573),
        uf(0x9fe),
        uf(0xc22),
        uf(0x8c5),
        uf(0x1ea),
        uf(0x9e7),
        uf(0x9b4),
        uf(0x425),
        uf(0x480),
        uf(0xd3e),
        uf(0x9a4),
        uf(0x2e2),
        uf(0x78b),
      ]);
    const gy = {};
    (gy[uf(0xd5c)] = uf(0x2a2)),
      (gy[uf(0xd24)] = [
        uf(0x40f),
        uf(0x686),
        uf(0x97b),
        uf(0x459),
        uf(0x5b7),
        uf(0x175),
        uf(0x4a2),
        uf(0x7c7),
        uf(0x7aa),
        uf(0x680),
        uf(0x3e3),
        uf(0xba1),
        uf(0x743),
        uf(0x44d),
        uf(0x9fb),
        uf(0x679),
        uf(0x91f),
        uf(0x761),
        uf(0x70e),
        uf(0x2ac),
        uf(0x6b2),
        uf(0x477),
        uf(0x543),
        uf(0x485),
        uf(0x9b6),
        uf(0x106),
        uf(0xdbe),
        uf(0x50c),
        uf(0x5c1),
        uf(0x5b1),
        uf(0xdc4),
        uf(0x267),
        uf(0xd23),
        uf(0xa4c),
        uf(0x480),
        uf(0xd3d),
        uf(0x107),
        uf(0x69c),
        uf(0xd9c),
      ]);
    const gz = {};
    (gz[uf(0xd5c)] = uf(0xb94)),
      (gz[uf(0xd24)] = [
        uf(0x54a),
        uf(0x2c8),
        uf(0x480),
        uf(0xa5f),
        uf(0x2b2),
        uf(0x85f),
        uf(0x9d1),
        uf(0x464),
        uf(0xd52),
        uf(0x4a2),
        uf(0x982),
        uf(0x583),
        uf(0x595),
        uf(0x183),
      ]);
    const gA = {};
    (gA[uf(0xd5c)] = uf(0x272)),
      (gA[uf(0xd24)] = [uf(0xab7), uf(0x7b3), uf(0xd60), uf(0x33d), uf(0x112)]);
    const gB = {};
    (gB[uf(0xd5c)] = uf(0xbd8)),
      (gB[uf(0xd24)] = [uf(0x8c8), uf(0x1f0), uf(0xb81), uf(0x7e7)]);
    const gC = {};
    (gC[uf(0xd5c)] = uf(0xbd8)),
      (gC[uf(0xd24)] = [uf(0xdf1), uf(0xb49), uf(0xd25)]);
    const gD = {};
    (gD[uf(0xd5c)] = uf(0x42b)),
      (gD[uf(0xd24)] = [uf(0x6dd), uf(0xc02), uf(0x4ed), uf(0x401), uf(0x790)]);
    const gE = {};
    (gE[uf(0xd5c)] = uf(0x42b)),
      (gE[uf(0xd24)] = [uf(0x10b), uf(0x239), uf(0x8b6), uf(0xcd5)]);
    const gF = {};
    (gF[uf(0xd5c)] = uf(0x42b)), (gF[uf(0xd24)] = [uf(0xd9a), uf(0x275)]);
    const gG = {};
    (gG[uf(0xd5c)] = uf(0xc44)),
      (gG[uf(0xd24)] = [
        uf(0x607),
        uf(0x6a5),
        uf(0xa83),
        uf(0xaa5),
        uf(0x9d6),
        uf(0xc8a),
        uf(0x3df),
        uf(0xc2c),
        uf(0xd64),
      ]);
    const gH = {};
    (gH[uf(0xd5c)] = uf(0xb16)),
      (gH[uf(0xd24)] = [
        uf(0x63a),
        uf(0x581),
        uf(0x3a2),
        uf(0xb4d),
        uf(0x5ae),
        uf(0x828),
        uf(0x683),
      ]);
    const gI = {};
    (gI[uf(0xd5c)] = uf(0xb9f)),
      (gI[uf(0xd24)] = [
        uf(0xda6),
        uf(0xc78),
        uf(0x8f1),
        uf(0x95b),
        uf(0xb19),
        uf(0x32b),
        uf(0xc2b),
        uf(0x31c),
        uf(0x802),
        uf(0x129),
        uf(0x40e),
        uf(0x829),
      ]);
    const gJ = {};
    (gJ[uf(0xd5c)] = uf(0x4e8)),
      (gJ[uf(0xd24)] = [
        uf(0x2c3),
        uf(0x5e2),
        uf(0x192),
        uf(0xacd),
        uf(0xd3c),
        uf(0x1b7),
        uf(0x884),
        uf(0x74f),
        uf(0xad0),
        uf(0xa24),
      ]);
    const gK = {};
    (gK[uf(0xd5c)] = uf(0x4e8)),
      (gK[uf(0xd24)] = [
        uf(0x6e4),
        uf(0x124),
        uf(0x83b),
        uf(0x435),
        uf(0xd6a),
        uf(0x8af),
      ]);
    const gL = {};
    (gL[uf(0xd5c)] = uf(0x71c)),
      (gL[uf(0xd24)] = [uf(0x156), uf(0xb6e), uf(0xd29)]);
    const gM = {};
    (gM[uf(0xd5c)] = uf(0x71c)),
      (gM[uf(0xd24)] = [uf(0xdf1), uf(0x93c), uf(0x79f), uf(0xac9), uf(0x824)]);
    const gN = {};
    (gN[uf(0xd5c)] = uf(0xd3f)),
      (gN[uf(0xd24)] = [
        uf(0x484),
        uf(0x675),
        uf(0xadf),
        uf(0xc51),
        uf(0xda1),
        uf(0x287),
        uf(0x480),
        uf(0x916),
        uf(0xabd),
        uf(0x5bb),
        uf(0xb21),
        uf(0x2f4),
        uf(0x4a2),
        uf(0xa9c),
        uf(0xa3b),
        uf(0x24d),
        uf(0x9c8),
        uf(0x891),
        uf(0x479),
      ]);
    const gO = {};
    (gO[uf(0xd5c)] = uf(0xa86)),
      (gO[uf(0xd24)] = [
        uf(0x72f),
        uf(0x844),
        uf(0x6a3),
        uf(0x460),
        uf(0x5a8),
        uf(0x64a),
        uf(0x6ca),
        uf(0xb70),
      ]);
    const gP = {};
    (gP[uf(0xd5c)] = uf(0xa86)), (gP[uf(0xd24)] = [uf(0xaee), uf(0x6c7)]);
    const gQ = {};
    (gQ[uf(0xd5c)] = uf(0x1a1)), (gQ[uf(0xd24)] = [uf(0x147), uf(0x4d1)]);
    const gR = {};
    (gR[uf(0xd5c)] = uf(0x1a1)),
      (gR[uf(0xd24)] = [
        uf(0x8d0),
        uf(0xacc),
        uf(0x20f),
        uf(0x80c),
        uf(0x203),
        uf(0x63c),
        uf(0xa39),
        uf(0x475),
        uf(0xc1c),
      ]);
    const gS = {};
    (gS[uf(0xd5c)] = uf(0xf4)), (gS[uf(0xd24)] = [uf(0xaa8), uf(0xdbc)]);
    const gT = {};
    (gT[uf(0xd5c)] = uf(0xf4)),
      (gT[uf(0xd24)] = [
        uf(0xdb5),
        uf(0xb13),
        uf(0xda9),
        uf(0x403),
        uf(0xd36),
        uf(0x88f),
        uf(0x1c2),
        uf(0xdf1),
        uf(0x444),
      ]);
    const gU = {};
    (gU[uf(0xd5c)] = uf(0x875)), (gU[uf(0xd24)] = [uf(0x5f2)]);
    const gV = {};
    (gV[uf(0xd5c)] = uf(0x875)),
      (gV[uf(0xd24)] = [
        uf(0x290),
        uf(0x7ef),
        uf(0x685),
        uf(0x898),
        uf(0xdf1),
        uf(0xabb),
        uf(0xa7b),
      ]);
    const gW = {};
    (gW[uf(0xd5c)] = uf(0x875)),
      (gW[uf(0xd24)] = [uf(0xa7d), uf(0x89a), uf(0x3ed)]);
    const gX = {};
    (gX[uf(0xd5c)] = uf(0x329)),
      (gX[uf(0xd24)] = [uf(0x444), uf(0x5fd), uf(0xf5), uf(0xb22)]);
    const gY = {};
    (gY[uf(0xd5c)] = uf(0x329)), (gY[uf(0xd24)] = [uf(0x7c6)]);
    const gZ = {};
    (gZ[uf(0xd5c)] = uf(0x329)),
      (gZ[uf(0xd24)] = [uf(0x4bc), uf(0xbd9), uf(0x1d2), uf(0xcbe), uf(0x6d2)]);
    const h0 = {};
    (h0[uf(0xd5c)] = uf(0x4cf)),
      (h0[uf(0xd24)] = [uf(0xd37), uf(0x9b5), uf(0xb33)]);
    const h1 = {};
    (h1[uf(0xd5c)] = uf(0x463)), (h1[uf(0xd24)] = [uf(0x60e), uf(0x104)]);
    const h2 = {};
    (h2[uf(0xd5c)] = uf(0x3f1)), (h2[uf(0xd24)] = [uf(0x807), uf(0xac7)]);
    const h3 = {};
    (h3[uf(0xd5c)] = uf(0x718)), (h3[uf(0xd24)] = [uf(0xa65)]);
    var h4 = [
      fd(uf(0xbe4)),
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
    console[uf(0x8d7)](uf(0x585));
    var h5 = Date[uf(0x160)]() < 0x18e9c4b6482,
      h6 = Math[uf(0x61d)](Math[uf(0x50e)]() * 0xa);
    function h7(ra) {
      const uC = uf,
        rb = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rc = "";
      for (const rd of ra) {
        rd === "\x20"
          ? (rc += "\x20")
          : (rc += rb[(h6 + rd[uC(0x897)](0x0)) % rb[uC(0x28c)]]);
      }
      return rc;
    }
    h5 &&
      document[uf(0xbda)](uf(0x813))[uf(0x654)](
        uf(0xaaa),
        h7(uf(0x6bb)) + uf(0x737)
      );
    function h8(ra, rb, rc) {
      const uD = uf,
        rd = rb - ra;
      if (Math[uD(0x10d)](rd) < 0.01) return rb;
      return ra + rd * (0x1 - Math[uD(0x496)](-rc * pB));
    }
    var h9 = [],
      ha = 0x0;
    function hb(ra, rb = 0x1388) {
      const uE = uf,
        rc = nA(uE(0x572) + jw(ra) + uE(0xcde));
      kH[uE(0x771)](rc);
      let rd = 0x0;
      re();
      function re() {
        const uF = uE;
        (rc[uF(0xdd7)][uF(0x81c)] = uF(0x50a) + ha + uF(0x938)),
          (rc[uF(0xdd7)][uF(0x663)] = rd);
      }
      (this[uE(0x3dc)] = ![]),
        (this[uE(0x364)] = () => {
          const uG = uE;
          rb -= pA;
          const rf = rb > 0x0 ? 0x1 : 0x0;
          (rd = h8(rd, rf, 0.3)),
            re(),
            rb < 0x0 &&
              rd <= 0x0 &&
              (rc[uG(0x86e)](), (this[uG(0x3dc)] = !![])),
            (ha += rd * (rc[uG(0x421)] + 0x5));
        }),
        h9[uE(0x462)](this);
    }
    function hc(ra) {
      new hb(ra, 0x1388);
    }
    function hd() {
      const uH = uf;
      ha = 0x0;
      for (let ra = h9[uH(0x28c)] - 0x1; ra >= 0x0; ra--) {
        const rb = h9[ra];
        rb[uH(0x364)](), rb[uH(0x3dc)] && h9[uH(0x27c)](ra, 0x1);
      }
    }
    var he = !![],
      hf = document[uf(0xbda)](uf(0x294));
    fetch(uf(0xb40))
      [uf(0xcf2)]((ra) => {
        const uI = uf;
        (hf[uI(0xdd7)][uI(0xd71)] = uI(0x18e)), (he = ![]);
      })
      [uf(0x54b)]((ra) => {
        const uJ = uf;
        hf[uJ(0xdd7)][uJ(0xd71)] = "";
      });
    var hg = document[uf(0xbda)](uf(0xb01)),
      hh = Date[uf(0x160)]();
    function hi() {
      const uK = uf;
      console[uK(0x8d7)](uK(0x161)),
        (hh = Date[uK(0x160)]()),
        (hg[uK(0xdd7)][uK(0xd71)] = "");
      try {
        aiptag[uK(0x99d)][uK(0xd71)][uK(0x462)](function () {
          const uL = uK;
          aipDisplayTag[uL(0xd71)](uL(0xa5a));
        }),
          aiptag[uK(0x99d)][uK(0xd71)][uK(0x462)](function () {
            const uM = uK;
            aipDisplayTag[uM(0xd71)](uM(0x849));
          });
      } catch (ra) {
        console[uK(0x8d7)](uK(0x59a));
      }
    }
    setInterval(function () {
      const uN = uf;
      hg[uN(0xdd7)][uN(0xd71)] === "" &&
        Date[uN(0x160)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const uO = uf;
      console[uO(0x8d7)](uO(0x931)),
        typeof aiptag[uO(0x79b)] !== uO(0xc80)
          ? ((hj = 0x45),
            (hk = Date[uO(0x160)]()),
            aiptag[uO(0x99d)][uO(0xa98)][uO(0x462)](function () {
              const uP = uO;
              aiptag[uP(0x79b)][uP(0x951)]();
            }))
          : window[uO(0xba9)](uO(0x47c));
    }
    window[uf(0xba9)] = function (ra) {
      const uQ = uf;
      console[uQ(0x8d7)](uQ(0x2b6) + ra);
      if (ra === uQ(0xc83) || ra[uQ(0x8f2)](uQ(0xb56)) > -0x1) {
        if (hj !== null && Date[uQ(0x160)]() - hk > 0xbb8) {
          console[uQ(0x8d7)](uQ(0xcc0));
          if (hW) {
            const rb = {};
            (rb[uQ(0xd5c)] = uQ(0x2f9)),
              (rb[uQ(0x8ac)] = ![]),
              kI(
                uQ(0x589),
                (rc) => {
                  const uR = uQ;
                  rc &&
                    hW &&
                    (il(new Uint8Array([cI[uR(0xc2d)]])), hK(uR(0xc7b)));
                },
                rb
              );
          }
        } else hK(uQ(0x121));
      } else alert(uQ(0x274) + ra);
      hm[uQ(0x3d4)][uQ(0x86e)](uQ(0xafb)), (hj = null);
    };
    var hm = document[uf(0xbda)](uf(0x60c));
    (hm[uf(0x4a5)] = function () {
      const uS = uf;
      hm[uS(0x3d4)][uS(0xa29)](uS(0xafb)), hl();
    }),
      (hm[uf(0xb1a)] = function () {
        const uT = uf;
        return nA(
          uT(0x1c5) + hP[uT(0x4c8)] + uT(0xbd5) + hP[uT(0xa93)] + uT(0x406)
        );
      }),
      (hm[uf(0xd1b)] = !![]);
    var hn = [
        uf(0x201),
        uf(0x5a2),
        uf(0x765),
        uf(0x751),
        uf(0x36d),
        uf(0xc35),
        uf(0xc1b),
        uf(0x8e1),
        uf(0x167),
        uf(0x21a),
        uf(0x830),
        uf(0x1ac),
      ],
      ho = document[uf(0xbda)](uf(0x76a)),
      hp =
        Date[uf(0x160)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[uf(0x61d)](Math[uf(0x50e)]() * hn[uf(0x28c)]);
    hr();
    function hq(ra) {
      const uU = uf;
      (hp += ra),
        hp < 0x0 ? (hp = hn[uU(0x28c)] - 0x1) : (hp %= hn[uU(0x28c)]),
        hr();
    }
    function hr() {
      const uV = uf,
        ra = hn[hp];
      (ho[uV(0xdd7)][uV(0xce3)] =
        uV(0xb2f) + ra[uV(0x2a0)](uV(0x611))[0x1] + uV(0xd17)),
        (ho[uV(0x4a5)] = function () {
          const uW = uV;
          window[uW(0x1dc)](ra, uW(0x6f2)), hq(0x1);
        });
    }
    (document[uf(0xbda)](uf(0x814))[uf(0x4a5)] = function () {
      hq(-0x1);
    }),
      (document[uf(0xbda)](uf(0x92a))[uf(0x4a5)] = function () {
        hq(0x1);
      });
    var hs = document[uf(0xbda)](uf(0xa28));
    hs[uf(0xb1a)] = function () {
      const uX = uf;
      return nA(
        uX(0x1c5) + hP[uX(0x4c8)] + uX(0x4f0) + hP[uX(0x3f4)] + uX(0x362)
      );
    };
    var ht = document[uf(0xbda)](uf(0x706)),
      hu = document[uf(0xbda)](uf(0x63e)),
      hv = ![];
    function hw() {
      const uY = uf;
      let ra = "";
      for (let rc = 0x0; rc < h4[uY(0x28c)]; rc++) {
        const { title: rd, content: re } = h4[rc];
        (ra += uY(0xa15) + rd + uY(0x73b)),
          re[uY(0x96e)]((rf, rg) => {
            const uZ = uY;
            let rh = "-\x20";
            if (rf[0x0] === "*") {
              const ri = rf[rg + 0x1];
              if (ri && ri[0x0] === "*") rh = uZ(0xd8e);
              else rh = uZ(0x566);
              rf = rf[uZ(0x471)](0x1);
            }
            (rf = rh + rf), (ra += uZ(0xd66) + rf + uZ(0x441));
          }),
          (ra += uY(0x5c2));
      }
      const rb = hD[uY(0x504)];
      (hv = rb !== void 0x0 && parseInt(rb) < fc), (ht[uY(0x729)] = ra);
    }
    CanvasRenderingContext2D[uf(0x1e4)][uf(0x3ad)] = function (ra) {
      const v0 = uf;
      this[v0(0x37a)](ra, ra);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[uf(0x1e4)][uf(0x3ad)] = function (ra) {
        const v1 = uf;
        this[v1(0x37a)](ra, ra);
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
            parseInt(ra[v2(0x471)](0x1, 0x3), 0x10),
            parseInt(ra[v2(0x471)](0x3, 0x5), 0x10),
            parseInt(ra[v2(0x471)](0x5, 0x7), 0x10),
          ]),
        hz[ra]
      );
    }
    var hB = document[uf(0x9bf)](uf(0xc56)),
      hC = document[uf(0xddf)](uf(0x740));
    for (let ra = 0x0; ra < hC[uf(0x28c)]; ra++) {
      const rb = hC[ra],
        rc = f9[rb[uf(0x867)](uf(0xcd6))];
      rc && rb[uf(0xc50)](nA(rc), rb[uf(0x600)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rd) {
      console[uf(0x78f)](uf(0x5a4), rd), (hD = {});
    }
    var hE = document[uf(0xbda)](uf(0xb9c)),
      hF = document[uf(0xbda)](uf(0x61e)),
      hG = document[uf(0xbda)](uf(0x80e));
    (hE[uf(0xb1a)] = function () {
      const v3 = uf;
      return nA(
        v3(0x90a) + hP[v3(0x16d)] + v3(0x3f8) + cN + v3(0x1cd) + cM + v3(0x4c4)
      );
    }),
      (hF[uf(0xa59)] = cM),
      (hF[uf(0xc87)] = function () {
        const v4 = uf;
        !cO[v4(0x21d)](this[v4(0x6f1)]) &&
          (this[v4(0x6f1)] = this[v4(0x6f1)][v4(0x5fe)](cP, ""));
      });
    var hH,
      hI = document[uf(0xbda)](uf(0x642));
    function hJ(re) {
      const v5 = uf;
      re ? k8(hI, re + v5(0x8dd)) : k8(hI, v5(0x800)),
        (hE[v5(0xdd7)][v5(0xd71)] =
          re && re[v5(0x8f2)]("\x20") === -0x1 ? v5(0x18e) : "");
    }
    hG[uf(0x4a5)] = ng(function () {
      const v6 = uf;
      if (!hW || jy) return;
      const re = hF[v6(0x6f1)],
        rf = re[v6(0x28c)];
      if (rf < cN) hc(v6(0x165));
      else {
        if (rf > cM) hc(v6(0x310));
        else {
          if (!cO[v6(0x21d)](re)) hc(v6(0x19d));
          else {
            hc(v6(0x723), hP[v6(0x3f4)]), (hH = re);
            const rg = new Uint8Array([
              cI[v6(0xacf)],
              ...new TextEncoder()[v6(0x1d1)](re),
            ]);
            il(rg);
          }
        }
      }
    });
    function hK(re, rf = n3[uf(0xd86)]) {
      n6(-0x1, null, re, rf);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[uf(0x16d)] = uf(0x22d)),
      (hO[uf(0x3f4)] = uf(0x142)),
      (hO[uf(0x3d6)] = uf(0x66c)),
      (hO[uf(0x3a0)] = uf(0x9a9)),
      (hO[uf(0xb5d)] = uf(0x4d5)),
      (hO[uf(0xa93)] = uf(0x4cc)),
      (hO[uf(0x4c8)] = uf(0x2b4)),
      (hO[uf(0xb32)] = uf(0x6be)),
      (hO[uf(0x40d)] = uf(0xb11));
    var hP = hO,
      hQ = Object[uf(0xb74)](hP),
      hR = [];
    for (let re = 0x0; re < hQ[uf(0x28c)]; re++) {
      const rf = hQ[re],
        rg = rf[uf(0x471)](0x4, rf[uf(0x8f2)](")"))
          [uf(0x2a0)](",\x20")
          [uf(0x196)]((rh) => parseInt(rh) * 0.8);
      hR[uf(0x462)](pL(rg));
    }
    hS(uf(0x259), uf(0x81d)),
      hS(uf(0x902), uf(0xb43)),
      hS(uf(0x138), uf(0x2cb)),
      hS(uf(0x7a0), uf(0x6a8)),
      hS(uf(0xa97), uf(0x7df)),
      hS(uf(0xd5d), uf(0x803)),
      hS(uf(0x15c), uf(0x705));
    function hS(rh, ri) {
      const v7 = uf;
      document[v7(0xbda)](rh)[v7(0x4a5)] = function () {
        const v8 = v7;
        window[v8(0x1dc)](ri, v8(0x6f2));
      };
    }
    setInterval(function () {
      const v9 = uf;
      hW && il(new Uint8Array([cI[v9(0x932)]]));
    }, 0x3e8);
    function hT() {
      const va = uf;
      (px = [pE]),
        (j6[va(0x9cc)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[va(0x28c)] = 0x0),
        (iw = []),
        (iG[va(0x28c)] = 0x0),
        (iC[va(0x729)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pn = 0x0),
        (hW = ![]),
        (mn = 0x0),
        (mm = 0x0),
        (m9 = ![]),
        (m5[va(0xdd7)][va(0xd71)] = va(0x18e)),
        (pP[va(0xdd7)][va(0xd71)] = pO[va(0xdd7)][va(0xd71)] = va(0x18e)),
        (pl = 0x0),
        (pm = 0x0);
    }
    var hU;
    function hV(rh) {
      const vb = uf;
      (jh[vb(0xdd7)][vb(0xd71)] = vb(0x18e)),
        (p2[vb(0xdd7)][vb(0xd71)] = vb(0x18e)),
        hZ(),
        kA[vb(0x3d4)][vb(0xa29)](vb(0x230)),
        kB[vb(0x3d4)][vb(0x86e)](vb(0x230)),
        hT(),
        console[vb(0x8d7)](vb(0x7fa) + rh + vb(0x7fd)),
        iu(),
        (hU = new WebSocket(rh)),
        (hU[vb(0xc91)] = vb(0xae6)),
        (hU[vb(0x565)] = hX),
        (hU[vb(0xc7c)] = k1),
        (hU[vb(0x4c2)] = kg);
    }
    crypto[uf(0xa0f)] =
      crypto[uf(0xa0f)] ||
      function rh() {
        const vc = uf;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vc(0x5fe)
        ](/[018]/g, (ri) =>
          (ri ^
            (crypto[vc(0x988)](new Uint8Array(0x1))[0x0] &
              (0xf >> (ri / 0x4))))[vc(0x7e3)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vd = uf;
      console[vd(0x8d7)](vd(0x914)), ie();
    }
    var hY = document[uf(0xbda)](uf(0x2d4));
    function hZ() {
      const ve = uf;
      hY[ve(0xdd7)][ve(0xd71)] = ve(0x18e);
    }
    var i0 = document[uf(0xbda)](uf(0xb0c)),
      i1 = document[uf(0xbda)](uf(0x515)),
      i2 = document[uf(0xbda)](uf(0x669)),
      i3 = document[uf(0xbda)](uf(0x568));
    i3[uf(0x4a5)] = function () {
      const vf = uf;
      !i6 &&
        (window[vf(0x273)][vf(0x87c)] =
          vf(0xaf2) +
          encodeURIComponent(!window[vf(0x317)] ? vf(0xc95) : vf(0xde3)) +
          vf(0xb96) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[uf(0xbda)](uf(0xc5b));
    (i4[uf(0x4a5)] = function () {
      const vg = uf;
      i5 == hD[vg(0x9a8)] && delete hD[vg(0x9a8)];
      delete hD[vg(0xc3c)];
      if (hU)
        try {
          hU[vg(0x436)]();
        } catch (ri) {}
    }),
      hZ();
    var i5, i6;
    function i7(ri) {
      const vi = uf;
      try {
        let rk = function (rl) {
          const vh = b;
          return rl[vh(0x5fe)](/([.*+?\^$(){}|\[\]\/\\])/g, vh(0x693));
        };
        var rj = document[vi(0x2d7)][vi(0x13f)](
          RegExp(vi(0x14c) + rk(ri) + vi(0x65f))
        );
        return rj ? rj[0x1] : null;
      } catch (rl) {
        return "";
      }
    }
    var i8 = !window[uf(0x317)];
    function i9(ri) {
      const vj = uf;
      try {
        document[vj(0x2d7)] = ri + vj(0xd73) + (i8 ? vj(0x298) : "");
      } catch (rj) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vk = uf;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vk(0x9a8)]) && (hD[vk(0x9a8)] = crypto[vk(0xa0f)]());
      (i5 = hD[vk(0x9a8)]), (i6 = hD[vk(0xc3c)]);
      !i6 &&
        ((i6 = i7(vk(0xc3c))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vk(0xc3c)));
      if (i6)
        try {
          const ri = i6;
          i6 = JSON[vk(0xcb7)](decodeURIComponent(escape(atob(ri))));
          if (eV(i6[vk(0x2fa)]))
            (i5 = i6[vk(0x2fa)]),
              i1[vk(0x654)](vk(0xaaa), i6[vk(0x9dd)]),
              i6[vk(0x6fc)] &&
                (i2[vk(0xdd7)][vk(0xce3)] = vk(0xc47) + i6[vk(0x6fc)] + ")"),
              (hD[vk(0xc3c)] = ri);
          else throw new Error(vk(0xb4b));
        } catch (rj) {
          (i6 = null), delete hD[vk(0xc3c)], console[vk(0xd86)](vk(0x289) + rj);
        }
      ib = hD[vk(0x97a)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vl = uf,
        ri = [
          vl(0xa1e),
          vl(0xdec),
          vl(0x2a6),
          vl(0x671),
          vl(0xac3),
          vl(0x1d9),
          vl(0x5eb),
          vl(0x66a),
          vl(0x5a5),
          vl(0x47f),
          vl(0x6ba),
          vl(0x9a1),
          vl(0x4da),
          vl(0x917),
          vl(0x978),
          vl(0x997),
          vl(0xcf1),
          vl(0x341),
          vl(0x569),
          vl(0x8bb),
          vl(0x2db),
          vl(0x874),
          vl(0xbee),
          vl(0xbdd),
          vl(0xbad),
          vl(0xbba),
          vl(0xa47),
          vl(0xdba),
          vl(0xc92),
          vl(0x6fe),
          vl(0xa72),
          vl(0x33c),
          vl(0xcd0),
          vl(0x6d0),
          vl(0xaea),
          vl(0x7b7),
          vl(0x551),
          vl(0x16f),
          vl(0xbf5),
          vl(0xa52),
          vl(0xa71),
          vl(0x4af),
          vl(0xa8c),
          vl(0x23c),
          vl(0x49b),
          vl(0xbb1),
          vl(0x158),
          vl(0xc82),
          vl(0x90b),
          vl(0x8e6),
          vl(0xabc),
          vl(0x5ac),
          vl(0xbf9),
          vl(0x5c6),
          vl(0xa3e),
          vl(0x7a2),
          vl(0xaab),
          vl(0xccc),
          vl(0xae2),
          vl(0xc9a),
          vl(0xc18),
          vl(0x909),
          vl(0x7d7),
          vl(0xb0b),
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
          if (ih[vm(0xc53)] === void 0x0) {
            var ro = function (rt) {
              const vn = vm,
                ru = vn(0x97e);
              let rv = "",
                rw = "";
              for (
                let rx = 0xc6a + -0x161c + -0x22 * -0x49,
                  ry,
                  rz,
                  rA = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rz = rt[vn(0x7e0)](rA++));
                ~rz &&
                ((ry =
                  rx % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? ry * (0x2422 + -0x5 * 0x38b + -0x122b) + rz
                    : rz),
                rx++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rv += String[vn(0x644)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (ry >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rx) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rz = ru[vn(0x8f2)](rz);
              }
              for (
                let rB = 0x23d0 + 0x13 * -0xdf + -0x1343, rC = rv[vn(0x28c)];
                rB < rC;
                rB++
              ) {
                rw +=
                  "%" +
                  ("00" +
                    rv[vn(0x897)](rB)[vn(0x7e3)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vn(0x471)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
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
                  (rw + rv[rz] + ru[vo(0x897)](rz % ru[vo(0x28c)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rx = rv[rz]),
                  (rv[rz] = rv[rw]),
                  (rv[rw] = rx);
              }
              (rz = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rw = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rA = -0x1d30 + -0x23c8 + 0x40f8;
                rA < rt[vo(0x28c)];
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
                  (ry += String[vo(0x644)](
                    rt[vo(0x897)](rA) ^
                      rv[(rv[rz] + rv[rw]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return ry;
            };
            (ih[vm(0x681)] = rs), (ri = arguments), (ih[vm(0xc53)] = !![]);
          }
          const rp = rk[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rq = rl + rp,
            rr = ri[rq];
          return (
            !rr
              ? (ih[vm(0x62b)] === void 0x0 && (ih[vm(0x62b)] = !![]),
                (rn = ih[vm(0x681)](rn, rm)),
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
            (parseInt(rk(0x1a1, 0x1b2, 0x1a9, 0x1b7, vp(0xda8))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rm(-0x105, -0x12e, -0x131, vp(0xda8), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rk(0x1b5, 0x1c9, 0x1b1, 0x1cb, vp(0x992))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rm(-0x128, -0x132, -0x134, vp(0x64c), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rm(-0x131, -0x155, -0x130, vp(0xd01), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rn(0x9a, 0xb1, 0xb2, vp(0x992), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rk(0x1b5, 0x1d3, 0x1bc, 0x1d1, vp(0x316))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rn(0xb2, 0xbe, 0xb9, vp(0x6f3), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rk(0x183, 0x1ae, 0x197, 0x19e, vp(0x703))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rp(-0x244, -0x216, -0x232, -0x217, vp(0x95e))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rm(-0x126, -0x10f, -0x13a, vp(0x77e), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rp(-0x203, -0x209, -0x200, -0x1e1, vp(0x19e))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rq === rj) break;
          else ro[vp(0x462)](ro[vp(0x200)]());
        } catch (rr) {
          ro[vp(0x462)](ro[vp(0x200)]());
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
            rl(vq(0x64c), -0x130, -0x106, -0x11f, -0x11d) +
            rl(vq(0x4f3), -0x11a, -0x142, -0x138, -0x135),
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
        ri[rk(-0x27e, -0x274, -0x265, vq(0x6e0), -0x274)](
          typeof window,
          ri[rm(vq(0x9b3), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        ri[ro(-0x17d, -0x171, -0x181, vq(0xa26), -0x16a)](
          typeof ki,
          ri[rk(-0x25a, -0x263, -0x26c, vq(0x4f3), -0x270)]
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
      const rn = rj[rm(vq(0x6f3), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function ro(ru, rv, rw, rx, ry) {
        return ih(ru - -0x20a, rx);
      }
      const rp = ri[rr(0x43a, vq(0x284), 0x40e, 0x428, 0x430)](
        ij,
        ri[rk(-0x28e, -0x27f, -0x272, vq(0xa26), -0x281)](
          ri[rl(vq(0xaf7), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rn
          ),
          ib[rl(vq(0x3e5), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rq = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rp[
        rl(vq(0x6e7), -0x11e, -0x149, -0x131, -0x13c) +
          ro(-0x172, -0x16e, -0x175, vq(0x9b3), -0x166)
      ](rq++, cI[ro(-0x18e, -0x16e, -0x17a, vq(0x64c), -0x1a6)]),
        rp[
          rr(0x415, vq(0x4aa), 0x44c, 0x433, 0x422) +
            rm(vq(0x9c2), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rq, cJ),
        (rq += -0x3dd + -0x6b5 + 0xa94);
      function rr(ru, rv, rw, rx, ry) {
        return ih(rx - 0x3a2, rv);
      }
      const rs = ri[rr(0x43c, vq(0x91e), 0x43b, 0x446, 0x459)](
        ri[rk(-0x283, -0x272, -0x298, vq(0x8a1), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let ru = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        ri[rm(vq(0x450), 0x200, 0x1fc, 0x1fc, 0x1e5)](ru, rn);
        ru++
      ) {
        rp[
          rk(-0x287, -0x273, -0x27d, vq(0x9b3), -0x27c) +
            rm(vq(0xfc), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rq++,
          ri[rm(vq(0x522), 0x201, 0x215, 0x21c, 0x1fc)](
            rj[
              rl(vq(0x6ea), -0x11c, -0x130, -0x128, -0x13b) +
                rk(-0x289, -0x29c, -0x26a, vq(0x3e5), -0x290)
            ](
              ri[rl(vq(0xce4), -0x13a, -0x124, -0x111, -0x120)](
                ri[rl(vq(0x6e0), -0x10d, -0x119, -0x108, -0x128)](rn, ru),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rs
          )
        );
      }
      if (ib) {
        const rv = ib[rm(vq(0xa26), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rw = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          ri[rm(vq(0x5a1), 0x21f, 0x216, 0x204, 0x200)](rw, rv);
          rw++
        ) {
          rp[
            rm(vq(0x9c2), 0x207, 0x20e, 0x209, 0x202) +
              rm(vq(0x6ea), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rq++,
            ri[rk(-0x25b, -0x256, -0x24f, vq(0x75e), -0x261)](
              ib[
                rk(-0x267, -0x256, -0x25e, vq(0x64d), -0x271) +
                  rr(0x412, vq(0x6ea), 0x411, 0x421, 0x425)
              ](
                ri[rr(0x435, vq(0xda8), 0x427, 0x434, 0x41a)](
                  ri[rl(vq(0x22e), -0x143, -0x134, -0x133, -0x137)](rv, rw),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rs
            )
          );
        }
      }
      const rt = rp[
        rr(0x423, vq(0x64c), 0x44b, 0x440, 0x45a) +
          rk(-0x280, -0x27d, -0x26e, vq(0x9c2), -0x288)
      ](
        ri[ro(-0x162, -0x164, -0x161, vq(0x4f3), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          ri[rr(0x429, vq(0x2d1), 0x43d, 0x437, 0x44b)](
            ri[rl(vq(0x703), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rn
          )
        )
      );
      ri[rr(0x435, vq(0x36e), 0x43b, 0x42a, 0x448)](il, rp), (ia = rt);
    }
    function ij(ri) {
      return new DataView(new ArrayBuffer(ri));
    }
    function ik() {
      const vr = uf;
      return hU && hU[vr(0xd7d)] === WebSocket[vr(0xa1a)];
    }
    function il(ri) {
      const vs = uf;
      if (ik()) {
        po += ri[vs(0x53a)];
        if (hW) {
          const rj = new Uint8Array(ri[vs(0x451)]);
          for (let rm = 0x0; rm < rj[vs(0x28c)]; rm++) {
            rj[rm] ^= ia;
          }
          const rk = cJ % rj[vs(0x28c)],
            rl = rj[0x0];
          (rj[0x0] = rj[rk]), (rj[rk] = rl);
        }
        hU[vs(0x94b)](ri);
      }
    }
    function im(ri, rj = 0x1) {
      const vt = uf;
      let rk = eU(ri);
      const rl = new Uint8Array([
        cI[vt(0x882)],
        rk,
        Math[vt(0x7cc)](rj * 0xff),
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
          vu(0xb71),
          vu(0x414),
          vu(0x768),
          vu(0x299),
          vu(0x4c5),
          vu(0x799),
          vu(0xcc2),
          vu(0xdf0),
          vu(0x61d),
          vu(0xc59),
          vu(0x300),
          vu(0x624),
          vu(0xa31),
          vu(0xc7a),
          vu(0x42d),
          vu(0x442),
          vu(0x4ef),
          vu(0xbfd),
          vu(0xb30),
          vu(0xb80),
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
          else rl[vv(0x462)](rl[vv(0x200)]());
        } catch (rr) {
          rl[vv(0x462)](rl[vv(0x200)]());
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
        (kk[vw(0x729)] = vw(0xc2e) + ri + vw(0x563) + rj + vw(0xd91)),
        kk[vw(0x771)](hY),
        (hY[vw(0xdd7)][vw(0xd71)] = ""),
        (i3[vw(0xdd7)][vw(0xd71)] = vw(0x18e)),
        (i0[vw(0xdd7)][vw(0xd71)] = vw(0x18e)),
        (hY[vw(0xbda)](vw(0x591))[vw(0xdd7)][vw(0x48e)] = "0"),
        document[vw(0xde9)][vw(0x3d4)][vw(0x86e)](vw(0xb06)),
        (kk[vw(0xdd7)][vw(0xd71)] = ""),
        (kl[vw(0xdd7)][vw(0xd71)] =
          kn[vw(0xdd7)][vw(0xd71)] =
          km[vw(0xdd7)][vw(0xd71)] =
          kC[vw(0xdd7)][vw(0xd71)] =
            vw(0x18e));
      const rl = document[vw(0xbda)](vw(0x6eb));
      document[vw(0xbda)](vw(0x5de))[vw(0x4a5)] = function () {
        ro();
      };
      let rm = rk;
      k8(rl, vw(0x587) + rm + vw(0x253));
      const rn = setInterval(() => {
        const vx = vw;
        rm--, rm <= 0x0 ? ro() : k8(rl, vx(0x587) + rm + vx(0x253));
      }, 0x3e8);
      function ro() {
        const vy = vw;
        clearInterval(rn), k8(rl, vy(0x1f1)), location[vy(0xd1a)]();
      }
    }
    function iu() {
      const vz = uf;
      if (hU) {
        hU[vz(0x565)] = hU[vz(0xc7c)] = hU[vz(0x4c2)] = null;
        try {
          hU[vz(0x436)]();
        } catch (ri) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = uf(0xb8a);
    function iB() {
      const vA = uf;
      iA = getComputedStyle(document[vA(0xde9)])[vA(0x68b)];
    }
    var iC = document[uf(0xbda)](uf(0x842)),
      iD = document[uf(0xbda)](uf(0xa4f)),
      iE = document[uf(0xbda)](uf(0x5a0)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(ri) {
      const vB = uf;
      if (ri < 0.01) return "0";
      ri = Math[vB(0x7cc)](ri);
      if (ri >= 0x3b9aca00)
        return parseFloat((ri / 0x3b9aca00)[vB(0x24a)](0x2)) + "b";
      else {
        if (ri >= 0xf4240)
          return parseFloat((ri / 0xf4240)[vB(0x24a)](0x2)) + "m";
        else {
          if (ri >= 0x3e8)
            return parseFloat((ri / 0x3e8)[vB(0x24a)](0x1)) + "k";
        }
      }
      return ri;
    }
    function iK(ri, rj) {
      const vC = uf,
        rk = document[vC(0x9bf)](vC(0xc56));
      rk[vC(0x894)] = vC(0x1c6);
      const rl = document[vC(0x9bf)](vC(0xc56));
      (rl[vC(0x894)] = vC(0x9d9)), rk[vC(0x771)](rl);
      const rm = document[vC(0x9bf)](vC(0x668));
      rk[vC(0x771)](rm), iC[vC(0x771)](rk);
      const rn = {};
      (rn[vC(0x739)] = ri),
        (rn[vC(0x869)] = rj),
        (rn[vC(0x1fd)] = 0x0),
        (rn[vC(0x901)] = 0x0),
        (rn[vC(0xdcb)] = 0x0),
        (rn["el"] = rk),
        (rn[vC(0x5fa)] = rl),
        (rn[vC(0xb1c)] = rm);
      const ro = rn;
      (ro[vC(0x8cd)] = iG[vC(0x28c)]),
        (ro[vC(0x364)] = function () {
          const vD = vC;
          (this[vD(0x1fd)] = pg(this[vD(0x1fd)], this[vD(0x869)], 0x64)),
            (this[vD(0xdcb)] = pg(this[vD(0xdcb)], this[vD(0x901)], 0x64)),
            this[vD(0xb1c)][vD(0x654)](
              vD(0xaaa),
              (this[vD(0x739)] ? this[vD(0x739)] + vD(0x9ef) : "") +
                iJ(this[vD(0x1fd)])
            ),
            (this[vD(0x5fa)][vD(0xdd7)][vD(0x662)] = this[vD(0xdcb)] + "%");
        }),
        ro[vC(0x364)](),
        iG[vC(0x462)](ro);
    }
    function iL(ri) {
      const vE = uf;
      if (iG[vE(0x28c)] === 0x0) return;
      const rj = iG[0x0];
      rj[vE(0x901)] = rj[vE(0xdcb)] = 0x64;
      for (let rk = 0x1; rk < iG[vE(0x28c)]; rk++) {
        const rl = iG[rk];
        (rl[vE(0x901)] =
          Math[vE(0x9dc)](
            0x1,
            rj[vE(0x869)] === 0x0 ? 0x1 : rl[vE(0x869)] / rj[vE(0x869)]
          ) * 0x64),
          ri && (rl[vE(0xdcb)] = rl[vE(0x901)]),
          iC[vE(0x771)](rl["el"]);
      }
    }
    function iM(ri) {
      const vF = uf,
        rj = new Path2D();
      rj[vF(0x371)](...ri[vF(0x2ed)][0x0]);
      for (let rk = 0x0; rk < ri[vF(0x2ed)][vF(0x28c)] - 0x1; rk++) {
        const rl = ri[vF(0x2ed)][rk],
          rm = ri[vF(0x2ed)][rk + 0x1];
        let rn = 0x0;
        const ro = rm[0x0] - rl[0x0],
          rp = rm[0x1] - rl[0x1],
          rq = Math[vF(0x5b5)](ro, rp);
        while (rn < rq) {
          rj[vF(0x8f6)](
            rl[0x0] + (rn / rq) * ro + (Math[vF(0x50e)]() * 0x2 - 0x1) * 0x32,
            rl[0x1] + (rn / rq) * rp + (Math[vF(0x50e)]() * 0x2 - 0x1) * 0x32
          ),
            (rn += Math[vF(0x50e)]() * 0x28 + 0x1e);
        }
        rj[vF(0x8f6)](...rm);
      }
      ri[vF(0xc38)] = rj;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(ri, rj) {
      const vG = uf;
      if (!oV[vG(0x6ae)]) return;
      let rk;
      var baseHP = getHP(ri, hack.moblst);
      var decDmg = ri['nHealth'] - rj;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if (baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      const rl = rj === void 0x0;
      !rl && (rk = Math[vG(0x48b)]((ri[vG(0x969)] - rj) * 0x64) || 0x1),
        iz[vG(0x462)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rk,
          x: ri["x"] + (Math[vG(0x50e)]() * 0x2 - 0x1) * ri[vG(0xd48)] * 0.6,
          y: ri["y"] + (Math[vG(0x50e)]() * 0x2 - 0x1) * ri[vG(0xd48)] * 0.6,
          vx: (Math[vG(0x50e)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vG(0x50e)]() * 0x3,
          angle: (Math[vG(0x50e)]() * 0x2 - 0x1) * (rl ? 0x1 : 0.1),
          size: Math[vG(0x8ab)](0x1, (ri[vG(0xd48)] * 0.2) / 0x14),
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
        rj[vH(0x3dc)] = !![];
        if (
          Math[vH(0x10d)](rj["nx"] - iU) > iW + rj[vH(0x9ac)] ||
          Math[vH(0x10d)](rj["ny"] - iV) > iX + rj[vH(0x9ac)]
        )
          rj[vH(0x2e4)] = 0xa;
        else !rj[vH(0x558)] && iT(rj, 0x0);
        delete iv[ri];
      }
    }
    var iZ = [
      uf(0x673),
      uf(0xbec),
      uf(0x1a6),
      uf(0x5f1),
      uf(0x534),
      uf(0x2bf),
      uf(0xc4b),
      uf(0xcfb),
      uf(0x65c),
      uf(0xd6f),
      uf(0x1be),
      uf(0x806),
      uf(0x3e6),
    ];
    function j0(ri, rj = iy) {
      const vI = uf;
      (ri[vI(0x673)] = rj[vI(0x673)]),
        (ri[vI(0xbec)] = rj[vI(0xbec)]),
        (ri[vI(0x1a6)] = rj[vI(0x1a6)]),
        (ri[vI(0x5f1)] = rj[vI(0x5f1)]),
        (ri[vI(0x534)] = rj[vI(0x534)]),
        (ri[vI(0x2bf)] = rj[vI(0x2bf)]),
        (ri[vI(0xc4b)] = rj[vI(0xc4b)]),
        (ri[vI(0xcfb)] = rj[vI(0xcfb)]),
        (ri[vI(0x65c)] = rj[vI(0x65c)]),
        (ri[vI(0xd6f)] = rj[vI(0xd6f)]),
        (ri[vI(0x84d)] = rj[vI(0x84d)]),
        (ri[vI(0x1be)] = rj[vI(0x1be)]),
        (ri[vI(0x8a5)] = rj[vI(0x8a5)]),
        (ri[vI(0x806)] = rj[vI(0x806)]),
        (ri[vI(0x3e6)] = rj[vI(0x3e6)]);
    }
    function j1() {
      (oJ = null), oR(null), (oN = null), (oL = ![]), (oM = 0x0), o5 && pw();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[uf(0xdd1)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[uf(0x462)](uf(0x6ac)),
      j8[uf(0x462)](hP[uf(0x16d)] || uf(0x8f5)),
      j7[uf(0x462)](uf(0x730)),
      j8[uf(0x462)](uf(0x979));
    var j9 = [];
    for (let ri = 0x0; ri < j7[uf(0x28c)]; ri++) {
      const rj = d9[j7[ri]] || 0x0;
      j9[ri] = 0x78 + (rj - d9[uf(0x4c8)]) * 0x3c - 0x1 + 0x1;
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
          vJ(0xb55) + j7[rk] + vJ(0x7b8) + rl + vJ(0x56b) + rl + vJ(0xd98)
        ),
        rn = rm[vJ(0xbda)](vJ(0x44c));
      (j6 = {
        id: rk,
        el: rm,
        state: cT[vJ(0x18e)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rm[vJ(0xbda)](vJ(0x4ff)),
        progressEl: rn,
        barEl: rn[vJ(0xbda)](vJ(0xd9d)),
        textEl: rn[vJ(0xbda)](vJ(0x668)),
        nameEl: rm[vJ(0xbda)](vJ(0x3ea)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vK = vJ,
            ro = Math[vK(0x9dc)](0x1, (pz - this[vK(0xdb9)]) / 0x64);
          this[vK(0x7b6)] =
            this[vK(0xbf8)] + (this[vK(0x545)] - this[vK(0xbf8)]) * ro;
          const rp = this[vK(0x7b6)] - 0x1;
          this[vK(0x5fa)][vK(0xdd7)][vK(0x81c)] =
            vK(0x811) + rp * 0x64 + vK(0xa50) + rp + vK(0x939);
        },
        update() {
          const vL = vJ,
            ro = je(this["t"]),
            rp = 0x1 - ro;
          (this["el"][vL(0xdd7)][vL(0x48e)] = -0xc8 * rp + "px"),
            (this["el"][vL(0xdd7)][vL(0x81c)] = vL(0x492) + -0x64 * rp + "%)");
        },
        remove() {
          const vM = vJ;
          rm[vM(0x86e)]();
        },
      }),
        (j6[vJ(0x4e0)][vJ(0xdd7)][vJ(0xd71)] = vJ(0x18e)),
        jc[vJ(0x462)](j6),
        j6[vJ(0x364)](),
        jb[vJ(0x462)](j6),
        km[vJ(0xc50)](rm, pM);
    }
    function je(rk) {
      return 0x1 - (0x1 - rk) * (0x1 - rk);
    }
    function jf(rk) {
      const vN = uf;
      return rk < 0.5
        ? (0x1 - Math[vN(0xa62)](0x1 - Math[vN(0x695)](0x2 * rk, 0x2))) / 0x2
        : (Math[vN(0xa62)](0x1 - Math[vN(0x695)](-0x2 * rk + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const vO = uf;
      (ok[vO(0x729)] = ""), (om = {});
    }
    var jh = document[uf(0xbda)](uf(0x357));
    jh[uf(0xdd7)][uf(0xd71)] = uf(0x18e);
    var ji = document[uf(0xbda)](uf(0x39b)),
      jj = [],
      jk = document[uf(0xbda)](uf(0x4b5));
    jk[uf(0x4eb)] = function () {
      jl();
    };
    function jl() {
      const vP = uf;
      for (let rk = 0x0; rk < jj[vP(0x28c)]; rk++) {
        const rl = jj[rk];
        k8(rl[vP(0x600)][0x0], jk[vP(0x850)] ? vP(0x684) : rl[vP(0x19b)]);
      }
    }
    function jm(rk) {
      const vQ = uf;
      (jh[vQ(0xdd7)][vQ(0xd71)] = ""), (ji[vQ(0x729)] = vQ(0xc29));
      const rl = rk[vQ(0x28c)];
      jj = [];
      for (let rm = 0x0; rm < rl; rm++) {
        const rn = rk[rm];
        ji[vQ(0x771)](nA(vQ(0x2d0) + (rm + 0x1) + vQ(0x726))), jn(rn);
      }
      m1[vQ(0x3c6)][vQ(0x230)]();
    }
    function jn(rk) {
      const vR = uf;
      for (let rl = 0x0; rl < rk[vR(0x28c)]; rl++) {
        const rm = rk[rl],
          rn = nA(vR(0x69e) + rm + vR(0x5d5));
        (rn[vR(0x19b)] = rm),
          rl > 0x0 && jj[vR(0x462)](rn),
          (rn[vR(0x4a5)] = function () {
            jp(rm);
          }),
          ji[vR(0x771)](rn);
      }
      jl();
    }
    function jo(rk) {
      const vS = uf;
      var rl = document[vS(0x9bf)](vS(0xc34));
      (rl[vS(0x6f1)] = rk),
        (rl[vS(0xdd7)][vS(0x525)] = "0"),
        (rl[vS(0xdd7)][vS(0x59b)] = "0"),
        (rl[vS(0xdd7)][vS(0x251)] = vS(0x6c2)),
        document[vS(0xde9)][vS(0x771)](rl),
        rl[vS(0x218)](),
        rl[vS(0xb18)]();
      try {
        var rm = document[vS(0xa6e)](vS(0x7b2)),
          rn = rm ? vS(0x971) : vS(0xa2c);
      } catch (ro) {}
      document[vS(0xde9)][vS(0xc1e)](rl);
    }
    function jp(rk) {
      const vT = uf;
      if (!navigator[vT(0x483)]) {
        jo(rk);
        return;
      }
      navigator[vT(0x483)][vT(0xcce)](rk)[vT(0xcf2)](
        function () {},
        function (rl) {}
      );
    }
    var jq = [
        uf(0x995),
        uf(0x719),
        uf(0x5db),
        uf(0xa43),
        uf(0xde8),
        uf(0xb82),
        uf(0xbc2),
        uf(0x45b),
        uf(0xa7f),
        uf(0x9ee),
        uf(0x793),
      ],
      jr = [uf(0x5dc), uf(0x326), uf(0xed)];
    function js(rk) {
      const vU = uf,
        rl = rk ? jr : jq;
      return rl[Math[vU(0x61d)](Math[vU(0x50e)]() * rl[vU(0x28c)])];
    }
    function jt(rk) {
      const vV = uf;
      return rk[vV(0x13f)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[uf(0xbda)](uf(0xcd4));
    ju[uf(0x4a5)] = ng(function (rk) {
      const vW = uf;
      iy && il(new Uint8Array([cI[vW(0x29a)]]));
    });
    var jv = "";
    function jw(rk) {
      const vX = uf;
      return rk[vX(0x5fe)](/"/g, vX(0xcf9));
    }
    function jx(rk) {
      const vY = uf;
      let rl = "";
      for (let rm = 0x0; rm < rk[vY(0x28c)]; rm++) {
        const [rn, ro, rp] = rk[rm];
        rl +=
          vY(0x5cd) +
          rn +
          "\x22\x20" +
          (rp ? vY(0x2c9) : "") +
          vY(0x14f) +
          jw(ro) +
          vY(0x9ca);
      }
      return vY(0x955) + rl + vY(0x2c0);
    }
    var jy = ![];
    function jz() {
      const vZ = uf;
      return nA(vZ(0x1c5) + hP[vZ(0x4c8)] + vZ(0xdc6));
    }
    var jA = document[uf(0xbda)](uf(0x28b));
    function jB() {
      const w0 = uf;
      (oC[w0(0xdd7)][w0(0xd71)] = pM[w0(0xdd7)][w0(0xd71)] =
        jy ? w0(0x18e) : ""),
        (jA[w0(0xdd7)][w0(0xd71)] = ky[w0(0xdd7)][w0(0xd71)] =
          jy ? "" : w0(0x18e));
      jy
        ? (kz[w0(0x3d4)][w0(0xa29)](w0(0x1fa)),
          k8(kz[w0(0x600)][0x0], w0(0xb86)))
        : (kz[w0(0x3d4)][w0(0x86e)](w0(0x1fa)),
          k8(kz[w0(0x600)][0x0], w0(0x854)));
      const rk = [hG, m7];
      for (let rl = 0x0; rl < rk[w0(0x28c)]; rl++) {
        const rm = rk[rl];
        rm[w0(0x3d4)][jy ? w0(0xa29) : w0(0x86e)](w0(0x720)),
          (rm[w0(0xb1a)] = jy ? jz : null),
          (rm[w0(0xd1b)] = !![]);
      }
      jC[w0(0xdd7)][w0(0xd71)] = nJ[w0(0xdd7)][w0(0xd71)] = jy ? w0(0x18e) : "";
    }
    var jC = document[uf(0xbda)](uf(0x2c4)),
      jD = document[uf(0xbda)](uf(0x271)),
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
      for (let rn = jL[w1(0x28c)] - 0x1; rn >= 0x0; rn--) {
        const ro = jL[rn];
        if (ni(rk, ro) > 0.7) {
          rm++;
          if (rm >= 0x5) return ![];
        }
      }
      return jL[w1(0x462)](rk), !![];
    }
    var jO = document[uf(0xbda)](uf(0xc9f)),
      jP = document[uf(0xbda)](uf(0x8bc)),
      jQ = document[uf(0xbda)](uf(0x530)),
      jR = document[uf(0xbda)](uf(0x64e)),
      jS;
    k8(jQ, "-"),
      (jQ[uf(0x4a5)] = function () {
        if (jS) mi(jS);
      });
    var jT = 0x0,
      jU = document[uf(0xbda)](uf(0x9d8));
    setInterval(() => {
      const w2 = uf;
      jT--;
      if (jT < 0x0) {
        jU[w2(0x3d4)][w2(0x755)](w2(0x230)) &&
          hW &&
          il(new Uint8Array([cI[w2(0xafe)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const w3 = uf,
        rk = document[w3(0xbda)](w3(0x6e8))[w3(0x600)],
        rl = document[w3(0xbda)](w3(0x6d4))[w3(0x600)];
      for (let rm = 0x0; rm < rk[w3(0x28c)]; rm++) {
        const rn = rk[rm],
          ro = rl[rm];
        rn[w3(0x4a5)] = function () {
          const w4 = w3;
          for (let rp = 0x0; rp < rl[w4(0x28c)]; rp++) {
            const rq = rm === rp;
            (rl[rp][w4(0xdd7)][w4(0xd71)] = rq ? "" : w4(0x18e)),
              rk[rp][w4(0x3d4)][rq ? w4(0xa29) : w4(0x86e)](w4(0xd77));
          }
        };
      }
      rk[0x0][w3(0x4a5)]();
    }
    jW();
    var jX = [];
    function jY(rk) {
      const w5 = uf;
      rk[w5(0x3d4)][w5(0xa29)](w5(0x942)), jX[w5(0x462)](rk);
    }
    var jZ,
      k0 = document[uf(0xbda)](uf(0x176));
    function k1(rk, rl = !![]) {
      const w6 = uf;
      if (rl) {
        if (pz < jG) {
          jH[w6(0x462)](rk);
          return;
        } else {
          if (jH[w6(0x28c)] > 0x0)
            while (jH[w6(0x28c)] > 0x0) {
              k1(jH[w6(0x200)](), ![]);
            }
        }
      }
      function rm() {
        const w7 = w6,
          ry = rv[w7(0x936)](rw++),
          rz = new Uint8Array(ry);
        for (let rA = 0x0; rA < ry; rA++) {
          rz[rA] = rv[w7(0x936)](rw++);
        }
        return new TextDecoder()[w7(0x7f8)](rz);
      }
      function rn() {
        const w8 = w6;
        return rv[w8(0x936)](rw++) / 0xff;
      }
      function ro(ry) {
        const w9 = w6,
          rz = rv[w9(0x7a6)](rw);
        (rw += 0x2),
          (ry[w9(0x320)] = rz & 0x1),
          (ry[w9(0x673)] = rz & 0x2),
          (ry[w9(0xbec)] = rz & 0x4),
          (ry[w9(0x1a6)] = rz & 0x8),
          (ry[w9(0x5f1)] = rz & 0x10),
          (ry[w9(0x534)] = rz & 0x20),
          (ry[w9(0x2bf)] = rz & 0x40),
          (ry[w9(0xc4b)] = rz & 0x80),
          (ry[w9(0xcfb)] = rz & 0x100),
          (ry[w9(0x65c)] = rz & (0x1 << 0x9)),
          (ry[w9(0xd6f)] = rz & (0x1 << 0xa)),
          (ry[w9(0x84d)] = rz & (0x1 << 0xb)),
          (ry[w9(0x1be)] = rz & (0x1 << 0xc)),
          (ry[w9(0x8a5)] = rz & (0x1 << 0xd)),
          (ry[w9(0x806)] = rz & (0x1 << 0xe)),
          (ry[w9(0x3e6)] = rz & (0x1 << 0xf));
      }
      function rp() {
        const wa = w6,
          ry = rv[wa(0x524)](rw);
        rw += 0x4;
        const rz = rm();
        iK(rz, ry);
      }
      function rq() {
        const wb = w6,
          ry = rv[wb(0x7a6)](rw) - cG;
        return (rw += 0x2), ry;
      }
      function rr() {
        const wc = w6,
          ry = {};
        for (let rJ in mb) {
          (ry[rJ] = rv[wc(0x524)](rw)), (rw += 0x4);
        }
        const rz = rm(),
          rA = Number(rv[wc(0xcbf)](rw));
        rw += 0x8;
        const rB = d5(d4(rA)[0x0]),
          rC = rB * 0x2,
          rD = Array(rC);
        for (let rK = 0x0; rK < rC; rK++) {
          const rL = rv[wc(0x7a6)](rw) - 0x1;
          rw += 0x2;
          if (rL < 0x0) continue;
          rD[rK] = dC[rL];
        }
        const rE = [],
          rF = rv[wc(0x7a6)](rw);
        rw += 0x2;
        for (let rM = 0x0; rM < rF; rM++) {
          const rN = rv[wc(0x7a6)](rw);
          rw += 0x2;
          const rO = rv[wc(0x524)](rw);
          (rw += 0x4), rE[wc(0x462)]([dC[rN], rO]);
        }
        const rG = [],
          rH = rv[wc(0x7a6)](rw);
        rw += 0x2;
        for (let rP = 0x0; rP < rH; rP++) {
          const rQ = rv[wc(0x7a6)](rw);
          (rw += 0x2), !eK[rQ] && console[wc(0x8d7)](rQ), rG[wc(0x462)](eK[rQ]);
        }
        const rI = rv[wc(0x936)](rw++);
        mg(rz, ry, rE, rG, rA, rD, rI);
      }
      function rs() {
        const wd = w6,
          ry = Number(rv[wd(0xcbf)](rw));
        return (rw += 0x8), ry;
      }
      function rt() {
        const we = w6,
          ry = rv[we(0x524)](rw);
        rw += 0x4;
        const rz = rv[we(0x936)](rw++),
          rA = {};
        (rA[we(0xa4e)] = ry), (rA[we(0xd07)] = {});
        const rB = rA;
        f3[we(0x96e)]((rD, rE) => {
          const wf = we;
          rB[wf(0xd07)][rD] = [];
          for (let rF = 0x0; rF < rz; rF++) {
            const rG = rm();
            let rH;
            rD === "xp" ? (rH = rs()) : ((rH = rv[wf(0x524)](rw)), (rw += 0x4)),
              rB[wf(0xd07)][rD][wf(0x462)]([rG, rH]);
          }
        }),
          k8(jD, k9(rB[we(0xa4e)]) + we(0x8b9)),
          (ml[we(0x729)] = "");
        let rC = 0x0;
        for (let rD in rB[we(0xd07)]) {
          const rE = kd(rD),
            rF = rB[we(0xd07)][rD],
            rG = nA(we(0x637) + rC + we(0x7e9) + rE + we(0xa0d)),
            rH = rG[we(0xbda)](we(0xdfd));
          for (let rI = 0x0; rI < rF[we(0x28c)]; rI++) {
            const [rJ, rK] = rF[rI];
            let rL = ma(rD, rK);
            rD === "xp" && (rL += we(0x33a) + (d4(rK)[0x0] + 0x1) + ")");
            const rM = nA(
              we(0x964) + (rI + 0x1) + ".\x20" + rJ + we(0x62c) + rL + we(0x542)
            );
            (rM[we(0x4a5)] = function () {
              mi(rJ);
            }),
              rH[we(0x40b)](rM);
          }
          ml[we(0x40b)](rG), rC++;
        }
      }
      function ru() {
        const wg = w6;
        (jS = rm()), k8(jQ, jS || "-");
        const ry = Number(rv[wg(0xcbf)](rw));
        (rw += 0x8),
          (jT = Math[wg(0x7cc)]((ry - Date[wg(0x160)]()) / 0x3e8)),
          jV();
        const rz = rv[wg(0x7a6)](rw);
        rw += 0x2;
        if (rz === 0x0) jP[wg(0x729)] = wg(0x9cb);
        else {
          jP[wg(0x729)] = "";
          for (let rB = 0x0; rB < rz; rB++) {
            const rC = rm(),
              rD = rv[wg(0x43c)](rw);
            rw += 0x4;
            const rE = rD * 0x64,
              rF = rE >= 0x1 ? rE[wg(0x24a)](0x2) : rE[wg(0x24a)](0x5),
              rG = nA(
                wg(0xba8) +
                  (rB + 0x1) +
                  ".\x20" +
                  rC +
                  wg(0x8e4) +
                  rF +
                  wg(0x7fb)
              );
            rC === jv && rG[wg(0x3d4)][wg(0xa29)]("me"),
              (rG[wg(0x4a5)] = function () {
                mi(rC);
              }),
              jP[wg(0x771)](rG);
          }
        }
        k0[wg(0x729)] = "";
        const rA = rv[wg(0x7a6)](rw);
        (rw += 0x2), (jZ = {});
        if (rA === 0x0)
          (jO[wg(0x729)] = wg(0x618)), (k0[wg(0xdd7)][wg(0xd71)] = wg(0x18e));
        else {
          const rH = {};
          jO[wg(0x729)] = "";
          for (let rI = 0x0; rI < rA; rI++) {
            const rJ = rv[wg(0x7a6)](rw);
            rw += 0x2;
            const rK = rv[wg(0x524)](rw);
            (rw += 0x4), (jZ[rJ] = rK);
            const rL = dC[rJ],
              rM = nA(
                wg(0xc8b) +
                  rL[wg(0x24f)] +
                  wg(0x711) +
                  qk(rL) +
                  wg(0x365) +
                  rK +
                  wg(0x741)
              );
            (rM[wg(0x6f0)] = jU),
              jY(rM),
              (rM[wg(0xb1a)] = rL),
              jO[wg(0x771)](rM),
              (rH[rL[wg(0x24f)]] = (rH[rL[wg(0x24f)]] || 0x0) + rK);
          }
          nX(jO), (k0[wg(0xdd7)][wg(0xd71)] = ""), oo(k0, rH);
        }
      }
      const rv = new DataView(rk[w6(0x4a4)]);
      po += rv[w6(0x53a)];
      let rw = 0x0;
      const rx = rv[w6(0x936)](rw++);
      switch (rx) {
        case cI[w6(0xdb0)]:
          {
            const rT = rv[w6(0x7a6)](rw);
            rw += 0x2;
            for (let rU = 0x0; rU < rT; rU++) {
              const rV = rv[w6(0x7a6)](rw);
              rw += 0x2;
              const rW = rv[w6(0x524)](rw);
              (rw += 0x4), mQ(rV, rW);
            }
          }
          break;
        case cI[w6(0x3b1)]:
          ru();
          break;
        case cI[w6(0x9c6)]:
          kC[w6(0x3d4)][w6(0xa29)](w6(0x230)), hT(), (jG = pz + 0x1f4);
          break;
        case cI[w6(0x3fc)]:
          (m5[w6(0x729)] = w6(0x355)), m5[w6(0x771)](m8), (m9 = ![]);
          break;
        case cI[w6(0x5fb)]: {
          const rX = dC[rv[w6(0x7a6)](rw)];
          rw += 0x2;
          const rY = rv[w6(0x524)](rw);
          (rw += 0x4),
            (m5[w6(0x729)] =
              w6(0x554) +
              rX[w6(0x24f)] +
              "\x22\x20" +
              qk(rX) +
              w6(0x365) +
              k9(rY) +
              w6(0xf7));
          const rZ = m5[w6(0xbda)](w6(0x13d));
          (rZ[w6(0xb1a)] = rX),
            (rZ[w6(0x4a5)] = function () {
              const wh = w6;
              mQ(rX["id"], rY), (this[wh(0x4a5)] = null), m8[wh(0x4a5)]();
            }),
            (m9 = ![]);
          break;
        }
        case cI[w6(0x57a)]: {
          const s0 = rv[w6(0x936)](rw++),
            s1 = rv[w6(0x524)](rw);
          rw += 0x4;
          const s2 = rm();
          (m5[w6(0x729)] =
            w6(0xd7b) +
            s2 +
            w6(0x7b8) +
            hP[w6(0x3f4)] +
            w6(0x240) +
            k9(s1) +
            "\x20" +
            hN[s0] +
            w6(0x7b8) +
            hQ[s0] +
            w6(0x7de)),
            (m5[w6(0xbda)](w6(0xc84))[w6(0x4a5)] = function () {
              mi(s2);
            }),
            m5[w6(0x771)](m8),
            (m9 = ![]);
          break;
        }
        case cI[w6(0xb15)]:
          (m5[w6(0x729)] = w6(0xb50)), m5[w6(0x771)](m8), (m9 = ![]);
          break;
        case cI[w6(0xa88)]:
          hK(w6(0x144));
          break;
        case cI[w6(0x513)]:
          rt();
          break;
        case cI[w6(0xd10)]:
          hK(w6(0xa91)), hc(w6(0xa91));
          break;
        case cI[w6(0x9e4)]:
          hK(w6(0x3d3)), hc(w6(0x5b2));
          break;
        case cI[w6(0x1a0)]:
          hK(w6(0x7ed));
          break;
        case cI[w6(0x518)]:
          rr();
          break;
        case cI[w6(0xd09)]:
          hc(w6(0xc0a));
          break;
        case cI[w6(0x73a)]:
          hc(w6(0x7a7), hP[w6(0x16d)]), hJ(hH);
          break;
        case cI[w6(0x3c6)]:
          const ry = rv[w6(0x7a6)](rw);
          rw += 0x2;
          const rz = [];
          for (let s3 = 0x0; s3 < ry; s3++) {
            const s4 = rv[w6(0x524)](rw);
            rw += 0x4;
            const s5 = rm(),
              s6 = rm(),
              s7 = rm();
            rz[w6(0x462)]([s5 || w6(0x674) + s4, s6, s7]);
          }
          jm(rz);
          break;
        case cI[w6(0x863)]:
          for (let s8 in mb) {
            const s9 = rv[w6(0x524)](rw);
            (rw += 0x4), mc[s8][w6(0x12d)](s9);
          }
          break;
        case cI[w6(0x826)]:
          const rA = rv[w6(0x936)](rw++),
            rB = rv[w6(0x524)](rw++),
            rC = {};
          (rC[w6(0x6f9)] = rA), (rC[w6(0xd02)] = rB), (oN = rC);
          break;
        case cI[w6(0xd6b)]:
          (i0[w6(0xdd7)][w6(0xd71)] = i6 ? "" : w6(0x18e)),
            (i3[w6(0xdd7)][w6(0xd71)] = !i6 ? "" : w6(0x18e)),
            (hY[w6(0xdd7)][w6(0xd71)] = ""),
            (kn[w6(0xdd7)][w6(0xd71)] = w6(0x18e)),
            (hW = !![]),
            kB[w6(0x3d4)][w6(0xa29)](w6(0x230)),
            kA[w6(0x3d4)][w6(0x86e)](w6(0x230)),
            j1(),
            m0(![]),
            (ix = rv[w6(0x524)](rw)),
            (rw += 0x4),
            (jv = rm()),
            hJ(jv),
            (jy = rv[w6(0x936)](rw++)),
            jB(),
            (j2 = rv[w6(0x7a6)](rw)),
            (rw += 0x2),
            (j5 = rv[w6(0x936)](rw++)),
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
            const sb = rv[w6(0x7a6)](rw) - 0x1;
            rw += 0x2;
            if (sb < 0x0) continue;
            iP[sa] = dC[sb];
          }
          nv(), nD();
          const rD = rv[w6(0x7a6)](rw);
          rw += 0x2;
          for (let sc = 0x0; sc < rD; sc++) {
            const sd = rv[w6(0x7a6)](rw);
            rw += 0x2;
            const se = nF(eK[sd]);
            se[w6(0x6f0)] = m2;
          }
          iS = {};
          while (rw < rv[w6(0x53a)]) {
            const sf = rv[w6(0x7a6)](rw);
            rw += 0x2;
            const sg = rv[w6(0x524)](rw);
            (rw += 0x4), (iS[sf] = sg);
          }
          nV(), mR();
          break;
        case cI[w6(0x264)]:
          const rE = rv[w6(0x936)](rw++),
            rF = hL[rE] || w6(0x556);
          console[w6(0x8d7)](w6(0x18f) + rF + ")"),
            (kf = rE === cR[w6(0x2b1)] || rE === cR[w6(0x9b2)]);
          !kf &&
            it(w6(0xd57), w6(0xac4) + rF, rE === cR[w6(0x28a)] ? 0xa : 0x3c);
          break;
        case cI[w6(0x1a9)]:
          (hg[w6(0xdd7)][w6(0xd71)] = kn[w6(0xdd7)][w6(0xd71)] = w6(0x18e)),
            kG(!![]),
            ju[w6(0x3d4)][w6(0xa29)](w6(0x230)),
            jg(),
            (p2[w6(0xdd7)][w6(0xd71)] = "");
          for (let sh in iQ) {
            iQ[sh][w6(0x84c)] = 0x0;
          }
          (jI = pz),
            (n8 = {}),
            (n0 = 0x1),
            (n1 = 0x1),
            (mY = 0x0),
            (mZ = 0x0),
            mp(),
            (mV = cY[w6(0x220)]),
            (jE = pz);
          break;
        case cI[w6(0x364)]:
          (pn = pz - jE), (jE = pz), pT[w6(0x12d)](rn()), pV[w6(0x12d)](rn());
          if (jy) {
            const si = rv[w6(0x936)](rw++);
            (jJ = si & 0x80), (jK = f6[si & 0x7f]);
          } else (jJ = ![]), (jK = null), pW[w6(0x12d)](rn());
          (pu = 0x1 + cW[rv[w6(0x936)](rw++)] / 0x64),
            (iW = (d0 / 0x2) * pu),
            (iX = (d1 / 0x2) * pu);
          const rG = rv[w6(0x7a6)](rw);
          rw += 0x2;
          for (let sj = 0x0; sj < rG; sj++) {
            const sk = rv[w6(0x524)](rw);
            rw += 0x4;
            let sl = iv[sk];
            if (sl) {
              if (sl[w6(0xb68)]) {
                sl[w6(0x238)] = rv[w6(0x936)](rw++) - 0x1;
                continue;
              }
              const sm = rv[w6(0x936)](rw++);
              sm & 0x1 &&
                ((sl["nx"] = rq()), (sl["ny"] = rq()), (sl[w6(0xce2)] = 0x0));
              sm & 0x2 &&
                ((sl[w6(0x2c2)] = eS(rv[w6(0x936)](rw++))),
                (sl[w6(0xce2)] = 0x0));
              if (sm & 0x4) {
                const sn = rn();
                if (sn < sl[w6(0x969)]) iT(sl, sn), (sl[w6(0x993)] = 0x1);
                else sn > sl[w6(0x969)] && (sl[w6(0x993)] = 0x0);
                (sl[w6(0x969)] = sn), (sl[w6(0xce2)] = 0x0);
              }
              sm & 0x8 &&
                ((sl[w6(0x928)] = 0x1),
                (sl[w6(0xce2)] = 0x0),
                sl === iy && (pf = 0x1));
              sm & 0x10 && ((sl[w6(0x9ac)] = rv[w6(0x7a6)](rw)), (rw += 0x2));
              sm & 0x20 && (sl[w6(0x33b)] = rv[w6(0x936)](rw++));
              sm & 0x40 && ro(sl);
              if (sm & 0x80) {
                if (sl[w6(0x3ae)])
                  (sl[w6(0x263)] = rv[w6(0x7a6)](rw)), (rw += 0x2);
                else {
                  const so = rn();
                  so > sl[w6(0xb04)] && iT(sl), (sl[w6(0xb04)] = so);
                }
              }
              sl[w6(0x3ae)] && sm & 0x4 && (sl[w6(0x93b)] = rn()),
                (sl["ox"] = sl["x"]),
                (sl["oy"] = sl["y"]),
                (sl[w6(0xcc9)] = sl[w6(0xcaa)]),
                (sl[w6(0xc1d)] = sl[w6(0x81b)]),
                (sl[w6(0x553)] = sl[w6(0xd48)]),
                (sl[w6(0xdaf)] = 0x0);
            } else {
              const sp = rv[w6(0x936)](rw++);
              if (sp === cS[w6(0x7c0)]) {
                let su = rv[w6(0x936)](rw++);
                const sv = {};
                (sv[w6(0x2ed)] = []), (sv["a"] = 0x1);
                const sw = sv;
                while (su--) {
                  const sx = rq(),
                    sy = rq();
                  sw[w6(0x2ed)][w6(0x462)]([sx, sy]);
                }
                iM(sw), (pf = 0x1), iF[w6(0x462)](sw);
                continue;
              }
              const sq = hM[sp],
                sr = rq(),
                ss = rq(),
                st = sp === cS[w6(0x5a3)];
              if (sp === cS[w6(0x584)] || sp === cS[w6(0x6e5)] || st) {
                const sz = rv[w6(0x7a6)](rw);
                (rw += 0x2),
                  (sl = new lK(sp, sk, sr, ss, sz)),
                  st &&
                    ((sl[w6(0xb68)] = !![]),
                    (sl[w6(0x238)] = rv[w6(0x936)](rw++) - 0x1));
              } else {
                if (sp === cS[w6(0x4fd)]) {
                  const sA = rv[w6(0x7a6)](rw);
                  (rw += 0x2), (sl = new lN(sk, sr, ss, sA));
                } else {
                  const sB = eS(rv[w6(0x936)](rw++)),
                    sC = rv[w6(0x7a6)](rw);
                  rw += 0x2;
                  if (sp === cS[w6(0xa98)]) {
                    const sD = rn(),
                      sE = rv[w6(0x936)](rw++);
                    (sl = new lT(sk, sr, ss, sB, sD, sE, sC)),
                      ro(sl),
                      (sl[w6(0x263)] = rv[w6(0x7a6)](rw)),
                      (rw += 0x2),
                      (sl[w6(0x739)] = rm()),
                      (sl[w6(0x5ef)] = rm()),
                      (sl[w6(0x93b)] = rn());
                    if (ix === sk) iy = sl;
                    else {
                      if (jy) {
                        const sF = pF();
                        (sF[w6(0x236)] = sl), px[w6(0x462)](sF);
                      }
                    }
                  } else {
                    if (sq[w6(0x904)](w6(0xb1a)))
                      sl = new lG(sk, sp, sr, ss, sB, sC);
                    else {
                      const sG = rn(),
                        sH = rv[w6(0x936)](rw++),
                        sI = sH >> 0x4,
                        sJ = sH & 0x1,
                        sK = sH & 0x2,
                        sL = rn();
                      (sl = new lG(sk, sp, sr, ss, sB, sC, sG)),
                        (sl[w6(0x24f)] = sI),
                        (sl[w6(0x64f)] = sJ),
                        (sl[w6(0x806)] = sK),
                        (sl[w6(0xb04)] = sL),
                        (sl[w6(0x6b8)] = hN[sI]);
                    }
                  }
                }
              }
              (iv[sk] = sl), iw[w6(0x462)](sl);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (pO[w6(0xdd7)][w6(0xd71)] = ""),
            pQ(pO, iy["nx"], iy["ny"]));
          const rH = rv[w6(0x7a6)](rw);
          rw += 0x2;
          for (let sM = 0x0; sM < rH; sM++) {
            const sN = rv[w6(0x524)](rw);
            (rw += 0x4), iY(sN);
          }
          const rI = rv[w6(0x936)](rw++);
          for (let sO = 0x0; sO < rI; sO++) {
            const sP = rv[w6(0x524)](rw);
            rw += 0x4;
            const sQ = iv[sP];
            if (sQ) {
              (sQ[w6(0xdef)] = iy), mQ(sQ[w6(0xb1a)]["id"], 0x1), iY(sP);
              if (!om[sQ[w6(0xb1a)]["id"]]) om[sQ[w6(0xb1a)]["id"]] = 0x0;
              om[sQ[w6(0xb1a)]["id"]]++;
            }
          }
          const rJ = rv[w6(0x936)](rw++);
          for (let sR = 0x0; sR < rJ; sR++) {
            const sS = rv[w6(0x936)](rw++),
              sT = rn(),
              sU = iQ[sS];
            (sU[w6(0x88d)] = sT), sT === 0x0 && (sU[w6(0x84c)] = 0x0);
          }
          (iI = rv[w6(0x7a6)](rw)), (rw += 0x2);
          const rK = rv[w6(0x7a6)](rw);
          (rw += 0x2),
            iE[w6(0x654)](
              w6(0xaaa),
              kh(iI, w6(0xa06)) + ",\x20" + kh(rK, w6(0xc57))
            );
          const rL = Math[w6(0x9dc)](0xa, iI);
          if (iH) {
            const sV = rv[w6(0x936)](rw++),
              sW = sV >> 0x4,
              sX = sV & 0xf,
              sY = rv[w6(0x936)](rw++);
            for (let t0 = 0x0; t0 < sX; t0++) {
              const t1 = rv[w6(0x936)](rw++);
              (iG[t1][w6(0x869)] = rv[w6(0x524)](rw)), (rw += 0x4);
            }
            const sZ = [];
            for (let t2 = 0x0; t2 < sY; t2++) {
              sZ[w6(0x462)](rv[w6(0x936)](rw++));
            }
            sZ[w6(0x582)](function (t3, t4) {
              return t4 - t3;
            });
            for (let t3 = 0x0; t3 < sY; t3++) {
              const t4 = sZ[t3];
              iG[t4]["el"][w6(0x86e)](), iG[w6(0x27c)](t4, 0x1);
            }
            for (let t5 = 0x0; t5 < sW; t5++) {
              rp();
            }
            iG[w6(0x582)](function (t6, t7) {
              const wi = w6;
              return t7[wi(0x869)] - t6[wi(0x869)];
            });
          } else {
            iG[w6(0x28c)] = 0x0;
            for (let t6 = 0x0; t6 < rL; t6++) {
              rp();
            }
            iH = !![];
          }
          iL();
          const rM = rv[w6(0x936)](rw++);
          for (let t7 = 0x0; t7 < rM; t7++) {
            const t8 = rv[w6(0x7a6)](rw);
            (rw += 0x2), nF(eK[t8]);
          }
          const rN = rv[w6(0x7a6)](rw);
          rw += 0x2;
          for (let t9 = 0x0; t9 < rN; t9++) {
            const ta = rv[w6(0x936)](rw++),
              tb = ta >> 0x7,
              tc = ta & 0x7f;
            if (tc === cQ[w6(0x67c)]) {
              const tg = rv[w6(0x936)](rw++),
                th = rv[w6(0x936)](rw++) - 0x1;
              let ti = null,
                tj = 0x0;
              if (tb) {
                const tl = rv[w6(0x524)](rw);
                rw += 0x4;
                const tm = rm();
                (ti = tm || w6(0x674) + tl), (tj = rv[w6(0x936)](rw++));
              }
              const tk = j8[tg];
              n6(
                w6(0x67c),
                null,
                "⚡\x20" +
                  j7[tg] +
                  w6(0x8d1) +
                  (th < 0x0
                    ? w6(0x262)
                    : th === 0x0
                    ? w6(0x46a)
                    : w6(0x56a) + (th + 0x1) + "!"),
                tk
              );
              ti &&
                n5(w6(0x67c), [
                  [w6(0x910), "🏆"],
                  [tk, ti + w6(0x505)],
                  [hP[w6(0x4c8)], tj + w6(0x7ba)],
                  [tk, w6(0x2ce)],
                ]);
              continue;
            }
            const td = rv[w6(0x524)](rw);
            rw += 0x4;
            const te = rm(),
              tf = te || w6(0x674) + td;
            if (tc === cQ[w6(0x9d2)]) {
              let tn = rm();
              oV[w6(0x282)] && (tn = fb(tn));
              if (jN(tn, td)) n6(td, tf, tn, td === ix ? n3["me"] : void 0x0);
              else td === ix && n6(-0x1, null, w6(0x5e0), n3[w6(0xd86)]);
            } else {
              if (tc === cQ[w6(0x826)]) {
                const to = rv[w6(0x7a6)](rw);
                rw += 0x2;
                const tp = rv[w6(0x524)](rw);
                rw += 0x4;
                const tq = rv[w6(0x524)](rw);
                rw += 0x4;
                const tr = dC[to],
                  ts = hN[tr[w6(0x24f)]],
                  tt = hN[tr[w6(0x4bb)][w6(0x24f)]],
                  tu = tq === 0x0;
                if (tu)
                  n5(w6(0x826), [
                    [n3[w6(0xd7c)], tf, !![]],
                    [n3[w6(0xd7c)], w6(0xadd)],
                    [
                      hQ[tr[w6(0x24f)]],
                      k9(tp) + "\x20" + ts + "\x20" + tr[w6(0x789)],
                    ],
                  ]);
                else {
                  const tv = hQ[tr[w6(0x4bb)][w6(0x24f)]];
                  n5(w6(0x826), [
                    [tv, "⭐"],
                    [tv, tf, !![]],
                    [tv, w6(0x1bb)],
                    [
                      tv,
                      k9(tq) +
                        "\x20" +
                        tt +
                        "\x20" +
                        tr[w6(0x789)] +
                        w6(0xbbd) +
                        k9(tp) +
                        "\x20" +
                        ts +
                        "\x20" +
                        tr[w6(0x789)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tw = rv[w6(0x7a6)](rw);
                rw += 0x2;
                const tx = eK[tw],
                  ty = hN[tx[w6(0x24f)]],
                  tz = tc === cQ[w6(0xa00)],
                  tA = hQ[tx[w6(0x24f)]];
                n5(w6(0x491), [
                  [
                    tA,
                    "" +
                      (tz ? w6(0x370) : "") +
                      jt(ty) +
                      "\x20" +
                      ty +
                      "\x20" +
                      tx[w6(0x789)] +
                      w6(0xd75) +
                      js(tz) +
                      w6(0x4a6),
                  ],
                  [tA, tf + "!", !![]],
                ]);
              }
            }
          }
          const rO = rv[w6(0x936)](rw++),
            rP = rO & 0xf,
            rQ = rO >> 0x4;
          let rR = ![];
          rP !== j6["id"] &&
            (j6 && (j6[w6(0x9cc)] = !![]),
            (rR = !![]),
            jd(rP),
            k8(pU, w6(0xa4d) + j9[rP] + w6(0x731)));
          const rS = rv[w6(0x936)](rw++);
          if (rS > 0x0) {
            let tB = ![];
            for (let tC = 0x0; tC < rS; tC++) {
              const tD = rv[w6(0x7a6)](rw);
              rw += 0x2;
              const tE = rv[w6(0x7a6)](rw);
              (rw += 0x2), (j6[tD] = tE);
              if (tE > 0x0) {
                if (!j6[w6(0x9a5)][tD]) {
                  tB = !![];
                  const tF = nF(eK[tD], !![]);
                  (tF[w6(0xd1b)] = !![]),
                    (tF[w6(0xaa2)] = ![]),
                    tF[w6(0x3d4)][w6(0x86e)](w6(0x417)),
                    (tF[w6(0x7e2)] = nA(w6(0x82f))),
                    tF[w6(0x771)](tF[w6(0x7e2)]),
                    (tF[w6(0x385)] = tD);
                  let tG = -0x1;
                  (tF["t"] = rR ? 0x1 : 0x0),
                    (tF[w6(0x9cc)] = ![]),
                    (tF[w6(0x377)] = 0x3e8),
                    (tF[w6(0x364)] = function () {
                      const wj = w6,
                        tH = tF["t"];
                      if (tH === tG) return;
                      tG = tH;
                      const tI = jf(Math[wj(0x9dc)](0x1, tH / 0.5)),
                        tJ = jf(
                          Math[wj(0x8ab)](
                            0x0,
                            Math[wj(0x9dc)]((tH - 0.5) / 0.5)
                          )
                        );
                      (tF[wj(0xdd7)][wj(0x81c)] =
                        wj(0x4c7) + -0x168 * (0x1 - tJ) + wj(0xdb4) + tJ + ")"),
                        (tF[wj(0xdd7)][wj(0x612)] = -1.12 * (0x1 - tI) + "em");
                    }),
                    jb[w6(0x462)](tF),
                    j6[w6(0xb3d)][w6(0x771)](tF),
                    (j6[w6(0x9a5)][tD] = tF);
                }
                oP(j6[w6(0x9a5)][tD][w6(0x7e2)], tE);
              } else {
                const tH = j6[w6(0x9a5)][tD];
                tH && ((tH[w6(0x9cc)] = !![]), delete j6[w6(0x9a5)][tD]),
                  delete j6[tD];
              }
            }
            tB &&
              [...j6[w6(0xb3d)][w6(0x600)]]
                [w6(0x582)]((tI, tJ) => {
                  const wk = w6;
                  return -nY(eK[tI[wk(0x385)]], eK[tJ[wk(0x385)]]);
                })
                [w6(0x96e)]((tI) => {
                  const wl = w6;
                  j6[wl(0xb3d)][wl(0x771)](tI);
                });
          }
          (j6[w6(0xdb9)] = pz), (j6[w6(0xa3f)] = rQ);
          if (rQ !== cT[w6(0x18e)]) {
            (j6[w6(0x4e0)][w6(0xdd7)][w6(0xd71)] = ""),
              (j6[w6(0xbf8)] = j6[w6(0x7b6)]),
              (j6[w6(0x545)] = rn());
            if (j6[w6(0xa96)] !== jJ) {
              const tI = jJ ? w6(0xa29) : w6(0x86e);
              j6[w6(0x5fa)][w6(0x3d4)][tI](w6(0xc70)),
                j6[w6(0x5fa)][w6(0x3d4)][tI](w6(0x9c9)),
                j6[w6(0xb1c)][w6(0x3d4)][tI](w6(0x85b)),
                (j6[w6(0xa96)] = jJ);
            }
            switch (rQ) {
              case cT[w6(0xcd3)]:
                k8(j6[w6(0xb7c)], w6(0xb34));
                break;
              case cT[w6(0x67c)]:
                const tJ = rv[w6(0x936)](rw++) + 0x1;
                k8(j6[w6(0xb7c)], w6(0x58a) + tJ);
                break;
              case cT[w6(0x3da)]:
                k8(j6[w6(0xb7c)], w6(0x716));
                break;
              case cT[w6(0xd99)]:
                k8(j6[w6(0xb7c)], w6(0xb23));
                break;
              case cT[w6(0xd92)]:
                k8(j6[w6(0xb7c)], w6(0xc3b));
                break;
            }
          } else j6[w6(0x4e0)][w6(0xdd7)][w6(0xd71)] = w6(0x18e);
          if (rv[w6(0x53a)] - rw > 0x0) {
            iy &&
              (j0(qd),
              (qd[w6(0x84d)] = ![]),
              (pP[w6(0xdd7)][w6(0xd71)] = ""),
              (pO[w6(0xdd7)][w6(0xd71)] = w6(0x18e)),
              pQ(pP, iy["nx"], iy["ny"]));
            qe[w6(0xb2b)](), (iy = null), ju[w6(0x3d4)][w6(0x86e)](w6(0x230));
            const tK = rv[w6(0x7a6)](rw) - 0x1;
            rw += 0x2;
            const tL = rv[w6(0x524)](rw);
            rw += 0x4;
            const tM = rv[w6(0x524)](rw);
            rw += 0x4;
            const tN = rv[w6(0x524)](rw);
            rw += 0x4;
            const tO = rv[w6(0x524)](rw);
            (rw += 0x4),
              k8(k3, ka(tM)),
              k8(k2, k9(tL)),
              k8(k4, k9(tN)),
              k8(k6, k9(tO));
            let tP = null;
            rv[w6(0x53a)] - rw > 0x0 && ((tP = rv[w6(0x524)](rw)), (rw += 0x4));
            tP !== null
              ? (k8(k7, k9(tP)), (k7[w6(0x516)][w6(0xdd7)][w6(0xd71)] = ""))
              : (k7[w6(0x516)][w6(0xdd7)][w6(0xd71)] = w6(0x18e));
            if (tK === -0x1) k8(k5, w6(0x691));
            else {
              const tQ = eK[tK];
              k8(k5, hN[tQ[w6(0x24f)]] + "\x20" + tQ[w6(0x789)]);
            }
            on(), (om = {}), (kn[w6(0xdd7)][w6(0xd71)] = ""), hi();
          }
          break;
        default:
          console[w6(0x8d7)](w6(0x1b6) + rx);
      }
    }
    var k2 = document[uf(0xbda)](uf(0x2ae)),
      k3 = document[uf(0xbda)](uf(0x2dd)),
      k4 = document[uf(0xbda)](uf(0xb10)),
      k5 = document[uf(0xbda)](uf(0xabf)),
      k6 = document[uf(0xbda)](uf(0x627)),
      k7 = document[uf(0xbda)](uf(0x36a));
    function k8(rk, rl) {
      const wm = uf;
      rk[wm(0x654)](wm(0xaaa), rl);
    }
    function k9(rk) {
      const wn = uf;
      return rk[wn(0xbdb)](wn(0xa45));
    }
    function ka(rk, rl) {
      const wo = uf,
        rm = [
          Math[wo(0x61d)](rk / (0x3e8 * 0x3c * 0x3c)),
          Math[wo(0x61d)]((rk % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wo(0x61d)]((rk % (0x3e8 * 0x3c)) / 0x3e8),
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
      [cS[uf(0x2ff)]]: uf(0x9c4),
      [cS[uf(0xb53)]]: uf(0x8c0),
      [cS[uf(0x39a)]]: uf(0x8c0),
      [cS[uf(0xcaf)]]: uf(0xbce),
      [cS[uf(0x952)]]: uf(0xbce),
      [cS[uf(0x3c8)]]: uf(0x3a1),
      [cS[uf(0x328)]]: uf(0x3a1),
      [cS[uf(0x42c)]]: uf(0x44a),
      [cS[uf(0x80b)]]: uf(0xb54),
    };
    kb["0"] = uf(0x691);
    var kc = kb;
    for (let rk in cS) {
      const rl = cS[rk];
      if (kc[rl]) continue;
      const rm = kd(rk);
      kc[rl] = rm[uf(0x5fe)](uf(0x836), uf(0xb00));
    }
    function kd(rn) {
      const wp = uf,
        ro = rn[wp(0x5fe)](/([A-Z])/g, wp(0x18d)),
        rp = ro[wp(0x7e0)](0x0)[wp(0x6f5)]() + ro[wp(0x471)](0x1);
      return rp;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wq = uf;
      console[wq(0x8d7)](wq(0xbaa)),
        hT(),
        ju[wq(0x3d4)][wq(0x86e)](wq(0x230)),
        kf &&
          (kk[wq(0xdd7)][wq(0xd71)] === wq(0x18e)
            ? (clearTimeout(ke),
              kC[wq(0x3d4)][wq(0xa29)](wq(0x230)),
              (ke = setTimeout(function () {
                const wr = wq;
                kC[wr(0x3d4)][wr(0x86e)](wr(0x230)),
                  (kk[wr(0xdd7)][wr(0xd71)] = ""),
                  kB[wr(0x702)](ko),
                  (kn[wr(0xdd7)][wr(0xd71)] = km[wr(0xdd7)][wr(0xd71)] =
                    wr(0x18e)),
                  hi(),
                  hV(hU[wr(0xd1f)]);
              }, 0x1f4)))
            : (kC[wq(0x3d4)][wq(0x86e)](wq(0x230)), hV(hU[wq(0xd1f)])));
    }
    function kh(rn, ro) {
      return rn + "\x20" + ro + (rn === 0x1 ? "" : "s");
    }
    var ki = document[uf(0x2be)](uf(0x297)),
      kj = ki[uf(0xd84)]("2d"),
      kk = document[uf(0xbda)](uf(0x848)),
      kl = document[uf(0xbda)](uf(0x5a7)),
      km = document[uf(0xbda)](uf(0x89c));
    km[uf(0xdd7)][uf(0xd71)] = uf(0x18e);
    var kn = document[uf(0xbda)](uf(0xb5b));
    kn[uf(0xdd7)][uf(0xd71)] = uf(0x18e);
    var ko = document[uf(0xbda)](uf(0x605)),
      kp = document[uf(0xbda)](uf(0x396)),
      kq = document[uf(0xbda)](uf(0x1c0));
    function kr() {
      const ws = uf;
      kq[ws(0x729)] = "";
      for (let rn = 0x0; rn < 0x32; rn++) {
        const ro = ks[rn],
          rp = nA(ws(0x95c) + rn + ws(0xbb2)),
          rq = rp[ws(0xbda)](ws(0x27d));
        if (ro)
          for (let rr = 0x0; rr < ro[ws(0x28c)]; rr++) {
            const rs = ro[rr],
              rt = dF[rs];
            if (!rt) rq[ws(0x771)](nA(ws(0xc0d)));
            else {
              const ru = nA(
                ws(0xc8b) + rt[ws(0x24f)] + "\x22\x20" + qk(rt) + ws(0x2d6)
              );
              (ru[ws(0xb1a)] = rt),
                (ru[ws(0x6f0)] = kp),
                jY(ru),
                rq[ws(0x771)](ru);
            }
          }
        else rq[ws(0x729)] = ws(0xc0d)[ws(0x68e)](0x5);
        (rp[ws(0xbda)](ws(0xd4c))[ws(0x4a5)] = function () {
          ku(rn);
        }),
          (rp[ws(0xbda)](ws(0xcb4))[ws(0x4a5)] = function () {
            kx(rn);
          }),
          kq[ws(0x771)](rp);
      }
    }
    var ks = kt();
    function kt() {
      const wt = uf;
      try {
        const rn = JSON[wt(0xcb7)](hD[wt(0xfa)]);
        for (const ro in rn) {
          !Array[wt(0xa46)](rn[ro]) && delete rn[ro];
        }
        return rn;
      } catch {
        return {};
      }
    }
    function ku(rn) {
      const wu = uf,
        ro = [],
        rp = nk[wu(0xddf)](wu(0x94e));
      for (let rq = 0x0; rq < rp[wu(0x28c)]; rq++) {
        const rr = rp[rq],
          rs = rr[wu(0x600)][0x0];
        !rs ? (ro[rq] = null) : (ro[rq] = rs[wu(0xb1a)][wu(0x9dd)]);
      }
      (ks[rn] = ro),
        (hD[wu(0xfa)] = JSON[wu(0xbb8)](ks)),
        kr(),
        hc(wu(0x72d) + rn + "!");
    }
    function kv() {
      const wv = uf;
      return nk[wv(0xddf)](wv(0x94e));
    }
    document[uf(0xbda)](uf(0x78e))[uf(0x4a5)] = function () {
      kw();
    };
    function kw() {
      const ww = uf,
        rn = kv();
      for (const ro of rn) {
        const rp = ro[ww(0x600)][0x0];
        if (!rp) continue;
        rp[ww(0x86e)](),
          iR[ww(0x462)](rp[ww(0x224)]),
          mQ(rp[ww(0xb1a)]["id"], 0x1),
          il(new Uint8Array([cI[ww(0x8b4)], ro[ww(0x8cd)]]));
      }
    }
    function kx(rn) {
      const wx = uf;
      if (mt || ms[wx(0x28c)] > 0x0) return;
      const ro = ks[rn];
      if (!ro) return;
      kw();
      const rp = kv(),
        rq = Math[wx(0x9dc)](rp[wx(0x28c)], ro[wx(0x28c)]);
      for (let rr = 0x0; rr < rq; rr++) {
        const rs = ro[rr],
          rt = dF[rs];
        if (!rt || !iS[rt["id"]]) continue;
        const ru = nA(
          wx(0xc8b) + rt[wx(0x24f)] + "\x22\x20" + qk(rt) + wx(0x2d6)
        );
        (ru[wx(0xb1a)] = rt),
          (ru[wx(0x233)] = !![]),
          (ru[wx(0x224)] = iR[wx(0xbb0)]()),
          nz(ru, rt),
          (iQ[ru[wx(0x224)]] = ru),
          rp[rr][wx(0x771)](ru),
          mQ(ru[wx(0xb1a)]["id"], -0x1);
        const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rv[wx(0x549)](0x0, cI[wx(0x324)]),
          rv[wx(0x616)](0x1, ru[wx(0xb1a)]["id"]),
          rv[wx(0x549)](0x3, rr),
          il(rv);
      }
      hc(wx(0xaf8) + rn + "!");
    }
    var ky = document[uf(0xbda)](uf(0xb63)),
      kz = document[uf(0xbda)](uf(0x9cd));
    kz[uf(0x4a5)] = function () {
      const wy = uf;
      kC[wy(0x3d4)][wy(0xa29)](wy(0x230)),
        jy
          ? (ke = setTimeout(function () {
              const wz = wy;
              il(new Uint8Array([cI[wz(0x29a)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wA = wy;
              kC[wA(0x3d4)][wA(0x86e)](wA(0x230)),
                (km[wA(0xdd7)][wA(0xd71)] = kn[wA(0xdd7)][wA(0xd71)] =
                  wA(0x18e)),
                (kk[wA(0xdd7)][wA(0xd71)] = ""),
                kB[wA(0x702)](ko),
                kB[wA(0x3d4)][wA(0xa29)](wA(0x230)),
                jg();
            }, 0x1f4));
    };
    var kA = document[uf(0xbda)](uf(0x710)),
      kB = document[uf(0xbda)](uf(0xdfa));
    kB[uf(0x3d4)][uf(0xa29)](uf(0x230));
    var kC = document[uf(0xbda)](uf(0x70d)),
      kD = document[uf(0xbda)](uf(0x1e2)),
      kE = document[uf(0xbda)](uf(0x7c4));
    (kE[uf(0x6f1)] = hD[uf(0xd46)] || ""),
      (kE[uf(0xa59)] = cK),
      (kE[uf(0xc87)] = function () {
        const wB = uf;
        hD[wB(0xd46)] = this[wB(0x6f1)];
      });
    var kF;
    kD[uf(0x4a5)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rn = ![]) {
      const wC = uf;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      hack.onload();
      hack.moblst = eO;
      if (kk[wC(0xdd7)][wC(0xd71)] === wC(0x18e)) {
        kC[wC(0x3d4)][wC(0x86e)](wC(0x230));
        return;
      }
      clearTimeout(kF),
        kB[wC(0x3d4)][wC(0x86e)](wC(0x230)),
        (kF = setTimeout(() => {
          const wD = wC;
          kC[wD(0x3d4)][wD(0xa29)](wD(0x230)),
            (kF = setTimeout(() => {
              const wE = wD;
              rn && kC[wE(0x3d4)][wE(0x86e)](wE(0x230)),
                (kk[wE(0xdd7)][wE(0xd71)] = wE(0x18e)),
                (hg[wE(0xdd7)][wE(0xd71)] = wE(0x18e)),
                (km[wE(0xdd7)][wE(0xd71)] = ""),
                km[wE(0x771)](ko),
                iq(kE[wE(0x6f1)][wE(0x471)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[uf(0xbda)](uf(0xd16));
    function kI(rn, ro, rp) {
      const wF = uf,
        rq = {};
      (rq[wF(0xd5c)] = wF(0x1d6)), (rq[wF(0x8ac)] = !![]), (rp = rp || rq);
      const rr = nA(
        wF(0x315) +
          rp[wF(0xd5c)] +
          wF(0xa8d) +
          rn +
          wF(0x17f) +
          (rp[wF(0x8ac)] ? wF(0x322) : "") +
          wF(0x2e3)
      );
      return (
        (rr[wF(0xbda)](wF(0x8e9))[wF(0x4a5)] = function () {
          const wG = wF;
          ro(!![]), rr[wG(0x86e)]();
        }),
        (rr[wF(0xbda)](wF(0x2fc))[wF(0x4a5)] = function () {
          const wH = wF;
          rr[wH(0x86e)](), ro(![]);
        }),
        kH[wF(0x771)](rr),
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
            wI(0x87c),
            wI(0x77d),
            wI(0x648),
            wI(0x241),
            wI(0xcbb),
            wI(0xd18),
            wI(0x412),
            wI(0xb4a),
            wI(0xb84),
            wI(0x168),
            wI(0x634),
            wI(0x98f),
            wI(0xb97),
            wI(0x2ba),
            wI(0x503),
            wI(0x786),
            wI(0xa04),
            wI(0x8b0),
            wI(0x6f6),
            wI(0x77b),
            wI(0xc1f),
            wI(0xd62),
            wI(0xa20),
            wI(0x8e7),
            wI(0xcea),
            wI(0xb1a),
            wI(0xc66),
            wI(0x45d),
            wI(0x502),
            wI(0x49e),
            wI(0x6fa),
            wI(0xc4e),
            wI(0xada),
            wI(0x78a),
            wI(0xa25),
            wI(0x8b5),
            wI(0x8ad),
            wI(0xab2),
            wI(0x991),
            wI(0x9fc),
            wI(0x7a3),
            wI(0xbe6),
            wI(0x102),
            wI(0x95f),
            wI(0xa36),
            wI(0x57b),
            wI(0x9f1),
            wI(0xb31),
            wI(0x7a1),
            wI(0x427),
            wI(0xc00),
            wI(0x4f1),
            wI(0x340),
            wI(0x256),
            wI(0xc43),
            wI(0x8e5),
            wI(0x15f),
            wI(0xaf0),
            wI(0xc31),
            wI(0xb76),
            wI(0x816),
            wI(0xcc7),
            wI(0xcbd),
            wI(0x839),
            wI(0x41a),
            wI(0xc4a),
            wI(0xc07),
            wI(0x5c5),
            wI(0xb37),
            wI(0xa40),
            wI(0xa49),
            wI(0x242),
            wI(0x9d5),
            wI(0x21e),
            wI(0x531),
            wI(0x46e),
            wI(0x6b3),
            wI(0x641),
            wI(0x360),
            wI(0xa60),
            wI(0x59d),
            wI(0x599),
            wI(0x166),
            wI(0x1a5),
            wI(0x5b0),
            wI(0x770),
            wI(0x4ea),
            wI(0x6fd),
            wI(0x313),
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
            else rz[wJ(0x462)](rz[wJ(0x200)]());
          } catch (rE) {
            rz[wJ(0x462)](rz[wJ(0x200)]());
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
    var kK = document[uf(0xbda)](uf(0xa5b)),
      kL = (function () {
        const wL = uf;
        let rn = ![];
        return (
          (function (ro) {
            const wK = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wK(0x21d)
              ](ro) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wK(0x21d)
              ](ro[wK(0x629)](0x0, 0x4))
            )
              rn = !![];
          })(navigator[wL(0x266)] || navigator[wL(0xca4)] || window[wL(0xca0)]),
          rn
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          uf(0x21d)
        ](navigator[uf(0x266)][uf(0x13e)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const wM = uf;
      (kS = Math[wM(0x8ab)](ki[wM(0x662)] / d0, ki[wM(0x645)] / d1)),
        (kR =
          Math[oV[wM(0xc5d)] ? wM(0x9dc) : wM(0x8ab)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rn = 0x0; rn < kQ[wM(0x28c)]; rn++) {
        const ro = kQ[rn];
        let rp = kR * (ro[wM(0xad9)] || 0x1);
        (ro[wM(0xdd7)][wM(0x81c)] = wM(0x725) + rp + ")"),
          (ro[wM(0xdd7)][wM(0x376)] = wM(0xd8f)),
          (ro[wM(0xdd7)][wM(0x662)] = kU() / rp + "px"),
          (ro[wM(0xdd7)][wM(0x645)] = kV() / rp + "px");
      }
    }
    function kU() {
      const wN = uf;
      return document[wN(0x8b2)][wN(0x776)];
    }
    function kV() {
      const wO = uf;
      return document[wO(0x8b2)][wO(0xf1)];
    }
    var kW = 0x1;
    function kX() {
      const wP = uf;
      (kW = oV[wP(0x9ea)] ? 0.65 : window[wP(0x482)]),
        (ki[wP(0x662)] = kU() * kW),
        (ki[wP(0x645)] = kV() * kW),
        kT();
      for (let rn = 0x0; rn < ms[wP(0x28c)]; rn++) {
        ms[rn][wP(0x976)]();
      }
    }
    window[uf(0x785)] = function () {
      kX(), qs();
    };
    var kY = (function () {
        const wQ = uf,
          rn = 0x23,
          ro = rn / 0x2,
          rp = document[wQ(0x9bf)](wQ(0x297));
        rp[wQ(0x662)] = rp[wQ(0x645)] = rn;
        const rq = rp[wQ(0xd84)]("2d");
        return (
          (rq[wQ(0x20a)] = wQ(0x3b2)),
          rq[wQ(0x721)](),
          rq[wQ(0x371)](0x0, ro),
          rq[wQ(0x8f6)](rn, ro),
          rq[wQ(0x371)](ro, 0x0),
          rq[wQ(0x8f6)](ro, rn),
          rq[wQ(0xaaa)](),
          rq[wQ(0x5af)](rp, wQ(0x68e))
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
      const rq = Math[wR(0x68a)](rn),
        rr = Math[wR(0xa3a)](rn),
        rs = rq * 0x28,
        rt = rr * 0x28;
      l1[wR(0x462)]({
        dir: ro,
        start: [rs, rt],
        curve: [
          rs + rq * 0x17 + -rr * ro * rp,
          rt + rr * 0x17 + rq * ro * rp,
          rs + rq * 0x2e,
          rt + rr * 0x2e,
        ],
        side: Math[wR(0x70f)](rn),
      });
    }
    var l3 = l4();
    function l4() {
      const wS = uf,
        rn = new Path2D(),
        ro = Math["PI"] / 0x5;
      return (
        rn[wS(0x1e0)](0x0, 0x0, 0x28, ro, l0 - ro),
        rn[wS(0xd95)](
          0x12,
          0x0,
          Math[wS(0x68a)](ro) * 0x28,
          Math[wS(0xa3a)](ro) * 0x28
        ),
        rn[wS(0x925)](),
        rn
      );
    }
    var l5 = l6();
    function l6() {
      const wT = uf,
        rn = new Path2D();
      return (
        rn[wT(0x371)](-0x28, 0x5),
        rn[wT(0x13c)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rn[wT(0x8f6)](0x28, -0x5),
        rn[wT(0x13c)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rn[wT(0x925)](),
        rn
      );
    }
    function l7(rn, ro = 0x1, rp = 0x0) {
      const wU = uf,
        rq = new Path2D();
      for (let rr = 0x0; rr < rn; rr++) {
        const rs = (Math["PI"] * 0x2 * rr) / rn + rp;
        rq[wU(0x8f6)](
          Math[wU(0x68a)](rs) - Math[wU(0xa3a)](rs) * 0.1 * ro,
          Math[wU(0xa3a)](rs)
        );
      }
      return rq[wU(0x925)](), rq;
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
          rn[wV(0x8f6)](Math[wV(0x68a)](rp) * rq, Math[wV(0xa3a)](rp) * rq);
        }
        return rn[wV(0x925)](), rn;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rn, ro, rp, rq, rr) {
      const wW = uf;
      (rn[wW(0x20a)] = rr),
        (rn[wW(0xd87)] = rp),
        rn[wW(0x96f)](),
        (ro *= 0.45),
        rn[wW(0x3ad)](ro),
        rn[wW(0x5df)](-0x14, 0x0),
        rn[wW(0x721)](),
        rn[wW(0x371)](0x0, 0x26),
        rn[wW(0x8f6)](0x50, 0x7),
        rn[wW(0x8f6)](0x50, -0x7),
        rn[wW(0x8f6)](0x0, -0x26),
        rn[wW(0x8f6)](-0x14, -0x1e),
        rn[wW(0x8f6)](-0x14, 0x1e),
        rn[wW(0x925)](),
        (rp = rp / ro),
        (rn[wW(0xd87)] = 0x64 + rp),
        (rn[wW(0x20a)] = rr),
        rn[wW(0xaaa)](),
        (rn[wW(0x20a)] = rn[wW(0x632)] = rq),
        (rn[wW(0xd87)] -= rp * 0x2),
        rn[wW(0xaaa)](),
        rn[wW(0x80f)](),
        rn[wW(0x416)]();
    }
    function la(rn, ro, rp, rq) {
      const wX = uf,
        rr = new Path2D();
      return lb(rr, rn, ro, rp, rq), rr[wX(0x925)](), rr;
    }
    function lb(rn, ro, rp, rq, rr) {
      const wY = uf;
      rn[wY(0x371)](rp, 0x0);
      for (let rs = 0x1; rs <= ro; rs++) {
        const rt = (Math["PI"] * 0x2 * (rs - rq)) / ro,
          ru = (Math["PI"] * 0x2 * rs) / ro;
        rn[wY(0xd95)](
          Math[wY(0x68a)](rt) * rp * rr,
          Math[wY(0xa3a)](rt) * rp * rr,
          Math[wY(0x68a)](ru) * rp,
          Math[wY(0xa3a)](ru) * rp
        );
      }
    }
    var lc = (function () {
        const wZ = uf,
          rn = new Path2D();
        rn[wZ(0x371)](0x3c, 0x0);
        const ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2,
            rr = ((rp + 0x1) / ro) * Math["PI"] * 0x2;
          rn[wZ(0xd95)](
            Math[wZ(0x68a)](rq) * 0x78,
            Math[wZ(0xa3a)](rq) * 0x78,
            Math[wZ(0x68a)](rr) * 0x3c,
            Math[wZ(0xa3a)](rr) * 0x3c
          );
        }
        return rn[wZ(0x925)](), rn;
      })(),
      ld = (function () {
        const x0 = uf,
          rn = new Path2D(),
          ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2;
          rn[x0(0x371)](0x0, 0x0), rn[x0(0x8f6)](...le(0x37, 0x0, rq));
          for (let rr = 0x0; rr < 0x2; rr++) {
            const rs = (rr / 0x2) * 0x1e + 0x14,
              rt = 0xa - rr * 0x2;
            rn[x0(0x371)](...le(rs + rt, -rt, rq)),
              rn[x0(0x8f6)](...le(rs, 0x0, rq)),
              rn[x0(0x8f6)](...le(rs + rt, rt, rq));
          }
        }
        return rn;
      })();
    function le(rn, ro, rp) {
      const x1 = uf,
        rq = Math[x1(0xa3a)](rp),
        rr = Math[x1(0x68a)](rp);
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
          ry = Math[x2(0x7cc)](rx * 0xff)[x2(0x7e3)](0x10);
        return ry[x2(0x28c)] === 0x1 ? "0" + ry : ry;
      };
      return "#" + rt(rq) + rt(rr) + rt(rs);
    }
    var lg = [];
    for (let rn = 0x0; rn < 0xa; rn++) {
      const ro = 0x1 - rn / 0xa;
      lg[uf(0x462)](lf(0x28 + ro * 0xc8, 0x50, 0x3c * ro));
    }
    var lh = [uf(0xcc8), uf(0x855)],
      li = lh[0x0],
      lj = [uf(0xc97), uf(0x3ca), uf(0x30a), uf(0x4e4)];
    function lk(rp = uf(0x135)) {
      const x3 = uf,
        rq = [];
      for (let rr = 0x0; rr < 0x5; rr++) {
        rq[x3(0x462)](pJ(rp, 0.8 - (rr / 0x5) * 0.25));
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
          body: uf(0x135),
          wing: uf(0x22f),
          tail_outline: uf(0x7ae),
          bone_outline: uf(0x94d),
          bone: uf(0x7ae),
          tail: lk(),
        },
      },
      lm = new Path2D(uf(0x7fc)),
      ln = new Path2D(uf(0xdb1)),
      lo = [];
    for (let rp = 0x0; rp < 0x3; rp++) {
      lo[uf(0x462)](pJ(lh[0x0], 0x1 - (rp / 0x3) * 0.2));
    }
    function lp(rq = Math[uf(0x50e)]()) {
      return function () {
        return (rq = (rq * 0x2455 + 0xc091) % 0x38f40), rq / 0x38f40;
      };
    }
    const lq = {
      [cS[uf(0xcd9)]]: [uf(0x7c3), uf(0xbe1)],
      [cS[uf(0xa9b)]]: [uf(0x135), uf(0x38d)],
      [cS[uf(0x7ec)]]: [uf(0x8b8), uf(0x8bf)],
    };
    var lr = lq;
    const ls = {};
    (ls[uf(0x237)] = !![]),
      (ls[uf(0xc4d)] = !![]),
      (ls[uf(0x384)] = !![]),
      (ls[uf(0x89e)] = !![]),
      (ls[uf(0xa74)] = !![]),
      (ls[uf(0x125)] = !![]),
      (ls[uf(0x38a)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[uf(0x5ee)] = !![]),
      (lu[uf(0x4dd)] = !![]),
      (lu[uf(0x3d7)] = !![]),
      (lu[uf(0xbf6)] = !![]),
      (lu[uf(0xc30)] = !![]),
      (lu[uf(0x461)] = !![]),
      (lu[uf(0x7c1)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[uf(0x3d7)] = !![]),
      (lw[uf(0xbf6)] = !![]),
      (lw[uf(0xc30)] = !![]),
      (lw[uf(0x461)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[uf(0x4dd)] = !![]), (ly[uf(0xb35)] = !![]), (ly[uf(0x89e)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[uf(0x45e)] = !![]), (lA[uf(0x80b)] = !![]), (lA[uf(0x53b)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[uf(0x8f4)] = !![]),
      (lC[uf(0x42c)] = !![]),
      (lC[uf(0xd43)] = !![]),
      (lC[uf(0x630)] = !![]),
      (lC[uf(0x7ab)] = !![]);
    var lD = lC;
    function lE(rq, rr) {
      const x4 = uf;
      rq[x4(0x721)](), rq[x4(0x371)](rr, 0x0);
      for (let rs = 0x0; rs < 0x6; rs++) {
        const rt = (rs / 0x6) * Math["PI"] * 0x2;
        rq[x4(0x8f6)](Math[x4(0x68a)](rt) * rr, Math[x4(0xa3a)](rt) * rr);
      }
      rq[x4(0x925)]();
    }
    function lF(rq, rr, rs, rt, ru) {
      const x5 = uf;
      rq[x5(0x721)](),
        rq[x5(0x371)](0x9, -0x5),
        rq[x5(0x13c)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rq[x5(0xd95)](0xd, 0x0, 0x9, -0x5),
        rq[x5(0x925)](),
        (rq[x5(0x62f)] = rq[x5(0xa23)] = x5(0x7cc)),
        (rq[x5(0x20a)] = rt),
        (rq[x5(0xd87)] = rr),
        rq[x5(0xaaa)](),
        (rq[x5(0xd87)] -= ru),
        (rq[x5(0x632)] = rq[x5(0x20a)] = rs),
        rq[x5(0x80f)](),
        rq[x5(0xaaa)]();
    }
    var lG = class {
        constructor(rq = -0x1, rr, rs, rt, ru, rv = 0x7, rw = -0x1) {
          const x6 = uf;
          (this["id"] = rq),
            (this[x6(0x344)] = rr),
            (this[x6(0x853)] = hM[rr]),
            (this[x6(0x558)] = this[x6(0x853)][x6(0x904)](x6(0xb1a))),
            (this["x"] = this["nx"] = this["ox"] = rs),
            (this["y"] = this["ny"] = this["oy"] = rt),
            (this[x6(0xcaa)] = this[x6(0x2c2)] = this[x6(0xcc9)] = ru),
            (this[x6(0x5f5)] =
              this[x6(0x81b)] =
              this[x6(0x969)] =
              this[x6(0xc1d)] =
                rw),
            (this[x6(0x993)] = 0x0),
            (this[x6(0xd48)] = this[x6(0x9ac)] = this[x6(0x553)] = rv),
            (this[x6(0xdaf)] = 0x0),
            (this[x6(0x3dc)] = ![]),
            (this[x6(0x2e4)] = 0x0),
            (this[x6(0x928)] = 0x0),
            (this[x6(0xa48)] = this[x6(0x853)][x6(0x8f2)](x6(0xc94)) > -0x1),
            (this[x6(0x7f9)] = this[x6(0xa48)] ? this[x6(0x81b)] < 0x1 : 0x1),
            (this[x6(0x64f)] = ![]),
            (this[x6(0xb04)] = 0x0),
            (this[x6(0x1a3)] = 0x0),
            (this[x6(0x359)] = 0x0),
            (this[x6(0xbcf)] = 0x1),
            (this[x6(0x45c)] = 0x0),
            (this[x6(0x567)] = [cS[x6(0xb79)], cS[x6(0x2cd)], cS[x6(0xa98)]][
              x6(0x9ae)
            ](this[x6(0x344)])),
            (this[x6(0x676)] = lv[this[x6(0x853)]]),
            (this[x6(0xc3e)] = lx[this[x6(0x853)]] ? 0x32 / 0xc8 : 0x0),
            (this[x6(0xa67)] = lt[this[x6(0x853)]]),
            (this[x6(0x7dc)] = 0x0),
            (this[x6(0x1eb)] = 0x0),
            (this[x6(0x320)] = ![]),
            (this[x6(0xa90)] = 0x0),
            (this[x6(0xca9)] = !![]),
            (this[x6(0xce2)] = 0x2),
            (this[x6(0xc3d)] = 0x0),
            (this[x6(0xd4d)] = lD[this[x6(0x853)]]),
            (this[x6(0xd51)] = lz[this[x6(0x853)]]),
            (this[x6(0xb1f)] = lB[this[x6(0x853)]]);
        }
        [uf(0x364)]() {
          const x7 = uf;
          this[x7(0x3dc)] && (this[x7(0x2e4)] += pA / 0xc8);
          (this[x7(0x1eb)] += ((this[x7(0x320)] ? 0x1 : -0x1) * pA) / 0xc8),
            (this[x7(0x1eb)] = Math[x7(0x9dc)](
              0x1,
              Math[x7(0x8ab)](0x0, this[x7(0x1eb)])
            )),
            (this[x7(0x359)] = pg(
              this[x7(0x359)],
              this[x7(0x1a3)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[x7(0x1a3)] = pg(this[x7(0x1a3)], this[x7(0xb04)], 0x64));
          this[x7(0x928)] > 0x0 &&
            ((this[x7(0x928)] -= pA / 0x96),
            this[x7(0x928)] < 0x0 && (this[x7(0x928)] = 0x0));
          (this[x7(0xdaf)] += pA / 0x64),
            (this["t"] = Math[x7(0x9dc)](0x1, this[x7(0xdaf)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[x7(0x81b)] =
              this[x7(0xc1d)] +
              (this[x7(0x969)] - this[x7(0xc1d)]) * this["t"]),
            (this[x7(0xd48)] =
              this[x7(0x553)] +
              (this[x7(0x9ac)] - this[x7(0x553)]) * this["t"]);
          if (this[x7(0x567)]) {
            const rq = Math[x7(0x9dc)](0x1, pA / 0x64);
            (this[x7(0xbcf)] +=
              (Math[x7(0x68a)](this[x7(0x2c2)]) - this[x7(0xbcf)]) * rq),
              (this[x7(0x45c)] +=
                (Math[x7(0xa3a)](this[x7(0x2c2)]) - this[x7(0x45c)]) * rq);
          }
          (this[x7(0xcaa)] = f8(this[x7(0xcc9)], this[x7(0x2c2)], this["t"])),
            (this[x7(0xa90)] +=
              ((Math[x7(0x5b5)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pA) /
              0x12),
            this[x7(0x993)] > 0x0 &&
              ((this[x7(0x993)] -= pA / 0x258),
              this[x7(0x993)] < 0x0 && (this[x7(0x993)] = 0x0)),
            this[x7(0xb1f)] &&
              ((this[x7(0xce2)] += pA / 0x5dc),
              this[x7(0xce2)] > 0x1 && (this[x7(0xce2)] = 0x1),
              (this[x7(0xca9)] = this[x7(0xce2)] < 0x1)),
            this[x7(0x81b)] < 0x1 &&
              (this[x7(0x7f9)] = pg(this[x7(0x7f9)], 0x1, 0xc8)),
            this[x7(0x993)] === 0x0 &&
              (this[x7(0x5f5)] +=
                (this[x7(0x81b)] - this[x7(0x5f5)]) *
                Math[x7(0x9dc)](0x1, pA / 0xc8));
        }
        [uf(0x16b)](rq, rr = ![]) {
          const x8 = uf,
            rs = this[x8(0xd48)] / 0x19;
          rq[x8(0x3ad)](rs),
            rq[x8(0x5df)](0x5, 0x0),
            (rq[x8(0xd87)] = 0x5),
            (rq[x8(0xa23)] = rq[x8(0x62f)] = x8(0x7cc)),
            (rq[x8(0x20a)] = rq[x8(0x632)] = this[x8(0xa9f)](x8(0x847)));
          rr &&
            (rq[x8(0x96f)](),
            rq[x8(0x5df)](0x3, 0x0),
            rq[x8(0x721)](),
            rq[x8(0x371)](-0xa, 0x0),
            rq[x8(0x8f6)](-0x28, -0xf),
            rq[x8(0xd95)](-0x21, 0x0, -0x28, 0xf),
            rq[x8(0x925)](),
            rq[x8(0x416)](),
            rq[x8(0xaaa)](),
            rq[x8(0x80f)]());
          rq[x8(0x721)](), rq[x8(0x371)](0x0, 0x1e);
          const rt = 0x1c,
            ru = 0x24,
            rv = 0x5;
          rq[x8(0x371)](0x0, rt);
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = ((((rw + 0.5) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              ry = ((((rw + 0x1) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rq[x8(0xd95)](
              Math[x8(0x68a)](rx) * ru * 0.85,
              -Math[x8(0xa3a)](rx) * ru,
              Math[x8(0x68a)](ry) * rt * 0.7,
              -Math[x8(0xa3a)](ry) * rt
            );
          }
          rq[x8(0x8f6)](-0x1c, -0x9),
            rq[x8(0xd95)](-0x26, 0x0, -0x1c, 0x9),
            rq[x8(0x8f6)](0x0, rt),
            rq[x8(0x925)](),
            (rq[x8(0x632)] = this[x8(0xa9f)](x8(0x3f5))),
            rq[x8(0x80f)](),
            rq[x8(0xaaa)](),
            rq[x8(0x721)]();
          for (let rz = 0x0; rz < 0x4; rz++) {
            const rA = (((rz / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rB = -0x1e + Math[x8(0x68a)](rA) * 0xd,
              rC = Math[x8(0xa3a)](rA) * 0xb;
            rq[x8(0x371)](rB, rC),
              rq[x8(0x8f6)](
                rB + Math[x8(0x68a)](rA) * 0x1b,
                rC + Math[x8(0xa3a)](rA) * 0x1b
              );
          }
          (rq[x8(0xd87)] = 0x4), rq[x8(0xaaa)]();
        }
        [uf(0xa4b)](rq, rr = uf(0xdae), rs = 0x0) {
          const x9 = uf;
          for (let rt = 0x0; rt < l1[x9(0x28c)]; rt++) {
            const ru = l1[rt];
            rq[x9(0x96f)](),
              rq[x9(0x488)](
                ru[x9(0xdc3)] * Math[x9(0xa3a)](this[x9(0xa90)] + rt) * 0.15 +
                  rs * ru[x9(0x6b1)]
              ),
              rq[x9(0x721)](),
              rq[x9(0x371)](...ru[x9(0x670)]),
              rq[x9(0xd95)](...ru[x9(0x5c7)]),
              (rq[x9(0x20a)] = this[x9(0xa9f)](rr)),
              (rq[x9(0xd87)] = 0x8),
              (rq[x9(0xa23)] = x9(0x7cc)),
              rq[x9(0xaaa)](),
              rq[x9(0x416)]();
          }
        }
        [uf(0xb48)](rq) {
          const xa = uf;
          rq[xa(0x721)]();
          let rr = 0x0,
            rs = 0x0,
            rt,
            ru;
          const rv = 0x14;
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = (rw / rv) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              ry = ((rw + 0x1) / rv) * 0x28;
            (rt = Math[xa(0x68a)](rx) * ry), (ru = Math[xa(0xa3a)](rx) * ry);
            const rz = rr + rt,
              rA = rs + ru;
            rq[xa(0xd95)](
              (rr + rz) * 0.5 + ru * 0.15,
              (rs + rA) * 0.5 - rt * 0.15,
              rz,
              rA
            ),
              (rr = rz),
              (rs = rA);
          }
          rq[xa(0xd95)](
            rr - ru * 0.42 + rt * 0.4,
            rs + rt * 0.42 + ru * 0.4,
            rr - ru * 0.84,
            rs + rt * 0.84
          ),
            (rq[xa(0x632)] = this[xa(0xa9f)](xa(0xb5f))),
            rq[xa(0x80f)](),
            (rq[xa(0xd87)] = 0x8),
            (rq[xa(0x20a)] = this[xa(0xa9f)](xa(0x6c8))),
            rq[xa(0xaaa)]();
        }
        [uf(0x89e)](rq) {
          const xb = uf;
          rq[xb(0x3ad)](this[xb(0xd48)] / 0xd),
            rq[xb(0x488)](-Math["PI"] / 0x6),
            (rq[xb(0xa23)] = rq[xb(0x62f)] = xb(0x7cc)),
            rq[xb(0x721)](),
            rq[xb(0x371)](0x0, -0xe),
            rq[xb(0x8f6)](0x6, -0x14),
            (rq[xb(0x632)] = rq[xb(0x20a)] = this[xb(0xa9f)](xb(0x36f))),
            (rq[xb(0xd87)] = 0x7),
            rq[xb(0xaaa)](),
            (rq[xb(0x632)] = rq[xb(0x20a)] = this[xb(0xa9f)](xb(0x885))),
            (rq[xb(0xd87)] = 0x2),
            rq[xb(0xaaa)](),
            rq[xb(0x721)](),
            rq[xb(0x371)](0x0, -0xc),
            rq[xb(0xd95)](-0x6, 0x0, 0x4, 0xe),
            rq[xb(0x13c)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rq[xb(0xd87)] = 0xc),
            (rq[xb(0x632)] = rq[xb(0x20a)] = this[xb(0xa9f)](xb(0x235))),
            rq[xb(0x80f)](),
            rq[xb(0xaaa)](),
            (rq[xb(0xd87)] = 0x6),
            (rq[xb(0x632)] = rq[xb(0x20a)] = this[xb(0xa9f)](xb(0x8fa))),
            rq[xb(0xaaa)](),
            rq[xb(0x80f)]();
        }
        [uf(0x384)](rq) {
          const xc = uf;
          rq[xc(0x3ad)](this[xc(0xd48)] / 0x2d),
            rq[xc(0x5df)](-0x14, 0x0),
            (rq[xc(0xa23)] = rq[xc(0x62f)] = xc(0x7cc)),
            rq[xc(0x721)]();
          const rr = 0x6,
            rs = Math["PI"] * 0.45,
            rt = 0x3c,
            ru = 0x46;
          rq[xc(0x371)](0x0, 0x0);
          for (let rv = 0x0; rv < rr; rv++) {
            const rw = ((rv / rr) * 0x2 - 0x1) * rs,
              rx = (((rv + 0x1) / rr) * 0x2 - 0x1) * rs;
            rv === 0x0 &&
              rq[xc(0xd95)](
                -0xa,
                -0x32,
                Math[xc(0x68a)](rw) * rt,
                Math[xc(0xa3a)](rw) * rt
              );
            const ry = (rw + rx) / 0x2;
            rq[xc(0xd95)](
              Math[xc(0x68a)](ry) * ru,
              Math[xc(0xa3a)](ry) * ru,
              Math[xc(0x68a)](rx) * rt,
              Math[xc(0xa3a)](rx) * rt
            );
          }
          rq[xc(0xd95)](-0xa, 0x32, 0x0, 0x0),
            (rq[xc(0x632)] = this[xc(0xa9f)](xc(0x6af))),
            (rq[xc(0x20a)] = this[xc(0xa9f)](xc(0x677))),
            (rq[xc(0xd87)] = 0xa),
            rq[xc(0xaaa)](),
            rq[xc(0x80f)](),
            rq[xc(0x721)](),
            rq[xc(0x1e0)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rq[xc(0x925)](),
            (rq[xc(0x20a)] = this[xc(0xa9f)](xc(0x772))),
            (rq[xc(0xd87)] = 0x1e),
            rq[xc(0xaaa)](),
            (rq[xc(0xd87)] = 0xa),
            (rq[xc(0x20a)] = rq[xc(0x632)] = this[xc(0xa9f)](xc(0xc6a))),
            rq[xc(0x80f)](),
            rq[xc(0xaaa)]();
        }
        [uf(0x777)](rq, rr = ![]) {
          const xd = uf;
          rq[xd(0x3ad)](this[xd(0xd48)] / 0x64);
          let rs = this[xd(0xa38)]
            ? 0.75
            : Math[xd(0xa3a)](Date[xd(0x160)]() / 0x96 + this[xd(0xa90)]);
          (rs = rs * 0.5 + 0.5),
            (rs *= 0.7),
            rq[xd(0x721)](),
            rq[xd(0x371)](0x0, 0x0),
            rq[xd(0x1e0)](0x0, 0x0, 0x64, rs, Math["PI"] * 0x2 - rs),
            rq[xd(0x925)](),
            (rq[xd(0x632)] = this[xd(0xa9f)](xd(0x9c5))),
            rq[xd(0x80f)](),
            rq[xd(0xc04)](),
            (rq[xd(0x20a)] = xd(0xb20)),
            (rq[xd(0xd87)] = rr ? 0x28 : 0x1e),
            (rq[xd(0x62f)] = xd(0x7cc)),
            rq[xd(0xaaa)](),
            !rr &&
              (rq[xd(0x721)](),
              rq[xd(0x1e0)](
                0x0 - rs * 0x8,
                -0x32 - rs * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rq[xd(0x632)] = xd(0x7eb)),
              rq[xd(0x80f)]());
        }
        [uf(0x3b7)](rq) {
          const xe = uf;
          rq[xe(0x3ad)](this[xe(0xd48)] / 0x50),
            rq[xe(0x488)](-this[xe(0xcaa)]),
            rq[xe(0x5df)](0x0, 0x50);
          const rr = Date[xe(0x160)]() / 0x12c + this[xe(0xa90)];
          rq[xe(0x721)]();
          const rs = 0x3;
          let rt;
          for (let rw = 0x0; rw < rs; rw++) {
            const rx = ((rw / rs) * 0x2 - 0x1) * 0x64,
              ry = (((rw + 0x1) / rs) * 0x2 - 0x1) * 0x64;
            (rt =
              0x14 +
              (Math[xe(0xa3a)]((rw / rs) * Math["PI"] * 0x8 + rr) * 0.5 + 0.5) *
                0x1e),
              rw === 0x0 && rq[xe(0x371)](rx, -rt),
              rq[xe(0x13c)](rx, rt, ry, rt, ry, -rt);
          }
          rq[xe(0x13c)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rt),
            rq[xe(0x925)](),
            (rq[xe(0xac6)] *= 0.7);
          const ru = this[xe(0x64f)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xe(0x28c)]];
          (rq[xe(0x632)] = this[xe(0xa9f)](ru)),
            rq[xe(0x80f)](),
            rq[xe(0xc04)](),
            (rq[xe(0x62f)] = xe(0x7cc)),
            (rq[xe(0x20a)] = xe(0xb20)),
            xe(0x32f),
            (rq[xe(0xd87)] = 0x1e),
            rq[xe(0xaaa)]();
          let rv = Math[xe(0xa3a)](rr * 0x1);
          (rv = rv * 0.5 + 0.5),
            (rv *= 0x3),
            rq[xe(0x721)](),
            rq[xe(0x9d3)](
              0x0,
              -0x82 - rv * 0x2,
              0x28 - rv,
              0x14 - rv * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xe(0x632)] = rq[xe(0x20a)]),
            rq[xe(0x80f)]();
        }
        [uf(0x664)](rq, rr) {
          const xf = uf;
          rq[xf(0x3ad)](this[xf(0xd48)] / 0x14);
          const rs = rq[xf(0xac6)];
          (rq[xf(0x20a)] = rq[xf(0x632)] = this[xf(0xa9f)](xf(0x8de))),
            (rq[xf(0xac6)] = 0.4 * rs),
            rq[xf(0x96f)](),
            rq[xf(0x721)](),
            rq[xf(0x488)](Math["PI"] * 0.16),
            rq[xf(0x5df)](rr ? -0x6 : -0x9, 0x0),
            rq[xf(0x371)](0x0, -0x4),
            rq[xf(0xd95)](-0x2, 0x0, 0x0, 0x4),
            (rq[xf(0xd87)] = 0x8),
            (rq[xf(0x62f)] = rq[xf(0xa23)] = xf(0x7cc)),
            rq[xf(0xaaa)](),
            rq[xf(0x416)](),
            rq[xf(0x721)](),
            rq[xf(0x1e0)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rq[xf(0x80f)](),
            rq[xf(0xc04)](),
            (rq[xf(0xac6)] = 0.5 * rs),
            (rq[xf(0xd87)] = rr ? 0x8 : 0x3),
            rq[xf(0xaaa)]();
        }
        [uf(0x630)](rq) {
          const xg = uf;
          rq[xg(0x3ad)](this[xg(0xd48)] / 0x64);
          const rr = this[xg(0xa9f)](xg(0xbf3)),
            rs = this[xg(0xa9f)](xg(0x4b1)),
            rt = 0x4;
          rq[xg(0x62f)] = rq[xg(0xa23)] = xg(0x7cc);
          const ru = 0x64 - rq[xg(0xd87)] * 0.5;
          for (let rv = 0x0; rv <= rt; rv++) {
            const rw = (0x1 - rv / rt) * ru;
            lE(rq, rw),
              (rq[xg(0xd87)] =
                0x1e +
                rv *
                  (Math[xg(0xa3a)](Date[xg(0x160)]() / 0x320 + rv) * 0.5 +
                    0.5) *
                  0x5),
              (rq[xg(0x632)] = rq[xg(0x20a)] = rv % 0x2 === 0x0 ? rr : rs),
              rv === rt - 0x1 && rq[xg(0x80f)](),
              rq[xg(0xaaa)]();
          }
        }
        [uf(0xb9a)](rq, rr) {
          const xh = uf;
          rq[xh(0x721)](),
            rq[xh(0x1e0)](0x0, 0x0, this[xh(0xd48)], 0x0, l0),
            (rq[xh(0x632)] = this[xh(0xa9f)](rr)),
            rq[xh(0x80f)](),
            (rq[xh(0x632)] = xh(0x7eb));
          for (let rs = 0x1; rs < 0x4; rs++) {
            rq[xh(0x721)](),
              rq[xh(0x1e0)](
                0x0,
                0x0,
                this[xh(0xd48)] * (0x1 - rs / 0x4),
                0x0,
                l0
              ),
              rq[xh(0x80f)]();
          }
        }
        [uf(0x961)](rq, rr) {
          const xi = uf;
          rq[xi(0x5df)](-this[xi(0xd48)], 0x0), (rq[xi(0xdff)] = xi(0x2b0));
          const rs = 0x32;
          let rt = ![];
          !this[xi(0xdeb)] && ((rt = !![]), (this[xi(0xdeb)] = []));
          while (this[xi(0xdeb)][xi(0x28c)] < rs) {
            this[xi(0xdeb)][xi(0x462)]({
              x: rt ? Math[xi(0x50e)]() : 0x0,
              y: Math[xi(0x50e)]() * 0x2 - 0x1,
              vx: Math[xi(0x50e)]() * 0.03 + 0.02,
              size: Math[xi(0x50e)]() * 0.2 + 0.2,
            });
          }
          const ru = this[xi(0xd48)] * 0x2,
            rv = Math[xi(0x8ab)](this[xi(0xd48)] * 0.1, 0x4),
            rw = rq[xi(0xac6)];
          (rq[xi(0x632)] = rr), rq[xi(0x721)]();
          for (let rx = rs - 0x1; rx >= 0x0; rx--) {
            const ry = this[xi(0xdeb)][rx];
            ry["x"] += ry["vx"];
            const rz = ry["x"] * ru,
              rA = this[xi(0xc3e)] * rz,
              rB = ry["y"] * rA,
              rC =
                Math[xi(0x695)](0x1 - Math[xi(0x10d)](rB) / rA, 0.2) *
                Math[xi(0x695)](0x1 - rz / ru, 0.2);
            if (ry["x"] >= 0x1 || rC < 0.001) {
              this[xi(0xdeb)][xi(0x27c)](rx, 0x1);
              continue;
            }
            (rq[xi(0xac6)] = rC * rw * 0.5),
              rq[xi(0x721)](),
              rq[xi(0x1e0)](
                rz,
                rB,
                ry[xi(0xd48)] * rA + rv,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xi(0x80f)]();
          }
        }
        [uf(0x2ff)](rq) {
          const xj = uf;
          rq[xj(0x3ad)](this[xj(0xd48)] / 0x46),
            rq[xj(0x488)](-Math["PI"] / 0x2);
          const rr = pz / 0xc8;
          (rq[xj(0xd87)] = 0x14),
            (rq[xj(0x20a)] = xj(0x3b2)),
            (rq[xj(0xa23)] = rq[xj(0x62f)] = xj(0x7cc)),
            (rq[xj(0x632)] = this[xj(0xa9f)](xj(0x154)));
          if (!![]) {
            this[xj(0xcc3)](rq);
            return;
          }
          const rs = 0x2;
          for (let rt = 0x1; rt <= rs; rt++) {
            rq[xj(0x96f)]();
            let ru = 0x1 - rt / rs;
            (ru *= 0x1 + Math[xj(0xa3a)](rr + rt) * 0.5),
              (ru = 0x1 + ru * 0.5),
              (rq[xj(0xac6)] *= Math[xj(0x695)](rt / rs, 0x2)),
              rq[xj(0x37a)](ru, ru),
              rt !== rs &&
                ((rq[xj(0xac6)] *= 0.7),
                (rq[xj(0xdff)] = xj(0x2b0)),
                (rq[xj(0x27e)] = xj(0x5e9))),
              this[xj(0xcc3)](rq),
              rq[xj(0x416)]();
          }
        }
        [uf(0xa84)](rq, rr = 0xbe) {
          const xk = uf;
          rq[xk(0x96f)](),
            rq[xk(0x721)](),
            rq[xk(0x371)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0x8f6)](0x1a, -0x46 + rr),
            rq[xk(0x8f6)](0xd, -0x46),
            rq[xk(0x8f6)](-0xd, -0x46),
            rq[xk(0x8f6)](-0x1a, -0x46 + rr),
            rq[xk(0x8f6)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0xc04)](),
            rq[xk(0x80f)](),
            rq[xk(0xaaa)](),
            rq[xk(0x416)](),
            rq[xk(0x96f)](),
            rq[xk(0x721)](),
            rq[xk(0x371)](-0x12, -0x46),
            rq[xk(0xd95)](-0x5, -0x50, -0xa, -0x69),
            rq[xk(0x13c)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rq[xk(0xd95)](0x5, -0x50, 0x12, -0x46),
            rq[xk(0xd95)](0x0, -0x3c, -0x12, -0x46),
            rq[xk(0x925)](),
            this[xk(0x558)]
              ? ((rq[xk(0x632)] = this[xk(0xa9f)](xk(0xa22))),
                (rq[xk(0x20a)] = this[xk(0xa9f)](xk(0x1d0))))
              : (rq[xk(0x20a)] = this[xk(0xa9f)](xk(0x1f7))),
            rq[xk(0x80f)](),
            (rq[xk(0xd87)] = 0xa),
            rq[xk(0xaaa)](),
            rq[xk(0x416)]();
        }
        [uf(0xcc3)](rq) {
          const xl = uf;
          rq[xl(0x96f)](), rq[xl(0x721)]();
          for (let rr = 0x0; rr < 0x2; rr++) {
            rq[xl(0x371)](0x14, -0x1e),
              rq[xl(0xd95)](0x5a, -0xa, 0x32, -0x32),
              rq[xl(0x8f6)](0xa0, -0x32),
              rq[xl(0xd95)](0x8c, 0x3c, 0x14, 0x0),
              rq[xl(0x37a)](-0x1, 0x1);
          }
          rq[xl(0xc04)](),
            rq[xl(0x80f)](),
            rq[xl(0xaaa)](),
            rq[xl(0x416)](),
            this[xl(0xa84)](rq),
            rq[xl(0x96f)](),
            rq[xl(0x721)](),
            rq[xl(0x1e0)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rq[xl(0x8f6)](-0x32, 0x1e),
            rq[xl(0x8f6)](-0x1e, 0x1e),
            rq[xl(0x8f6)](-0x1f, 0x32),
            rq[xl(0x8f6)](0x1f, 0x32),
            rq[xl(0x8f6)](0x1e, 0x1e),
            rq[xl(0x8f6)](0x32, 0x1e),
            rq[xl(0x8f6)](0x32, 0x0),
            rq[xl(0x80f)](),
            rq[xl(0xc04)](),
            rq[xl(0xaaa)](),
            rq[xl(0x721)](),
            rq[xl(0x9d3)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rq[xl(0x9d3)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rq[xl(0x632)] = rq[xl(0x20a)]),
            rq[xl(0x80f)](),
            rq[xl(0x416)]();
        }
        [uf(0x45e)](rq) {
          const xm = uf;
          rq[xm(0x3ad)](this[xm(0xd48)] / 0x64), (rq[xm(0x20a)] = xm(0x7eb));
          const rr = this[xm(0xa9f)](xm(0xd38)),
            rs = this[xm(0xa9f)](xm(0xae5));
          (this[xm(0xc3d)] += (pA / 0x12c) * (this[xm(0xca9)] ? 0x1 : -0x1)),
            (this[xm(0xc3d)] = Math[xm(0x9dc)](
              0x1,
              Math[xm(0x8ab)](0x0, this[xm(0xc3d)])
            ));
          const rt = this[xm(0xa38)] ? 0x1 : this[xm(0xc3d)],
            ru = 0x1 - rt;
          rq[xm(0x96f)](),
            rq[xm(0x721)](),
            rq[xm(0x5df)](
              (0x30 +
                (Math[xm(0xa3a)](this[xm(0xa90)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rt +
                (0x1 - rt) * -0x14,
              0x0
            ),
            rq[xm(0x37a)](1.1, 1.1),
            rq[xm(0x371)](0x0, -0xa),
            rq[xm(0x13c)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rq[xm(0x632)] = rs),
            rq[xm(0x80f)](),
            (rq[xm(0x62f)] = xm(0x7cc)),
            (rq[xm(0xd87)] = 0x1c),
            rq[xm(0xc04)](),
            rq[xm(0xaaa)](),
            rq[xm(0x416)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            const rw = Math[xm(0xa3a)](this[xm(0xa90)] * 0x1);
            rq[xm(0x96f)]();
            const rx = rv * 0x2 - 0x1;
            rq[xm(0x37a)](0x1, rx),
              rq[xm(0x5df)](0x32 * rt - ru * 0xa, 0x50 * rt),
              rq[xm(0x488)](rw * 0.2 + 0.3 - ru * 0x1),
              rq[xm(0x721)](),
              rq[xm(0x371)](0xa, -0xa),
              rq[xm(0xd95)](0x1e, 0x28, -0x14, 0x50),
              rq[xm(0xd95)](0xa, 0x1e, -0xf, 0x0),
              (rq[xm(0x20a)] = rr),
              (rq[xm(0xd87)] = 0x2c),
              (rq[xm(0xa23)] = rq[xm(0x62f)] = xm(0x7cc)),
              rq[xm(0xaaa)](),
              (rq[xm(0xd87)] -= 0x1c),
              (rq[xm(0x632)] = rq[xm(0x20a)] = rs),
              rq[xm(0x80f)](),
              rq[xm(0xaaa)](),
              rq[xm(0x416)]();
          }
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = Math[xm(0xa3a)](this[xm(0xa90)] * 0x1 + 0x1);
            rq[xm(0x96f)]();
            const rA = ry * 0x2 - 0x1;
            rq[xm(0x37a)](0x1, rA),
              rq[xm(0x5df)](-0x41 * rt, 0x32 * rt),
              rq[xm(0x488)](rz * 0.3 + 1.3),
              rq[xm(0x721)](),
              rq[xm(0x371)](0xc, -0x5),
              rq[xm(0xd95)](0x28, 0x1e, 0x0, 0x3c),
              rq[xm(0xd95)](0x14, 0x1e, 0x0, 0x0),
              (rq[xm(0x20a)] = rr),
              (rq[xm(0xd87)] = 0x2c),
              (rq[xm(0xa23)] = rq[xm(0x62f)] = xm(0x7cc)),
              rq[xm(0xaaa)](),
              (rq[xm(0xd87)] -= 0x1c),
              (rq[xm(0x632)] = rq[xm(0x20a)] = rs),
              rq[xm(0xaaa)](),
              rq[xm(0x80f)](),
              rq[xm(0x416)]();
          }
          this[xm(0x83d)](rq);
        }
        [uf(0x83d)](rq, rr = 0x1) {
          const xn = uf;
          rq[xn(0x721)](),
            rq[xn(0x1e0)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xn(0x20a)] = xn(0x7eb)),
            (rq[xn(0x632)] = this[xn(0xa9f)](xn(0x92c))),
            rq[xn(0x80f)](),
            (rq[xn(0xd87)] = 0x1e * rr),
            rq[xn(0x96f)](),
            rq[xn(0xc04)](),
            rq[xn(0xaaa)](),
            rq[xn(0x416)](),
            rq[xn(0x96f)](),
            rq[xn(0x721)](),
            rq[xn(0x1e0)](
              0x0,
              0x0,
              0x64 - rq[xn(0xd87)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xn(0xc04)](),
            rq[xn(0x721)]();
          for (let rs = 0x0; rs < 0x6; rs++) {
            const rt = (rs / 0x6) * Math["PI"] * 0x2;
            rq[xn(0x8f6)](
              Math[xn(0x68a)](rt) * 0x28,
              Math[xn(0xa3a)](rt) * 0x28
            );
          }
          rq[xn(0x925)]();
          for (let ru = 0x0; ru < 0x6; ru++) {
            const rv = (ru / 0x6) * Math["PI"] * 0x2,
              rw = Math[xn(0x68a)](rv) * 0x28,
              rx = Math[xn(0xa3a)](rv) * 0x28;
            rq[xn(0x371)](rw, rx), rq[xn(0x8f6)](rw * 0x3, rx * 0x3);
          }
          (rq[xn(0xd87)] = 0x10 * rr),
            (rq[xn(0xa23)] = rq[xn(0x62f)] = xn(0x7cc)),
            rq[xn(0xaaa)](),
            rq[xn(0x416)]();
        }
        [uf(0x37d)](rq) {
          const xo = uf;
          rq[xo(0x3ad)](this[xo(0xd48)] / 0x82);
          let rr, rs;
          const rt = 0x2d,
            ru = lp(
              this[xo(0x7d3)] ||
                (this[xo(0x7d3)] = this[xo(0xa38)]
                  ? 0x28
                  : Math[xo(0x50e)]() * 0x3e8)
            );
          let rv = ru() * 6.28;
          const rw = Date[xo(0x160)]() / 0xc8,
            rx = [xo(0x108), xo(0xde5)][xo(0x196)]((ry) => this[xo(0xa9f)](ry));
          for (let ry = 0x0; ry <= rt; ry++) {
            (ry % 0x5 === 0x0 || ry === rt) &&
              (ry > 0x0 &&
                ((rq[xo(0xd87)] = 0x19),
                (rq[xo(0x62f)] = rq[xo(0xa23)] = xo(0x7cc)),
                (rq[xo(0x20a)] = rx[0x1]),
                rq[xo(0xaaa)](),
                (rq[xo(0xd87)] = 0xc),
                (rq[xo(0x20a)] = rx[0x0]),
                rq[xo(0xaaa)]()),
              ry !== rt && (rq[xo(0x721)](), rq[xo(0x371)](rr, rs)));
            let rz = ry / 0x32;
            (rz *= rz), (rv += (0.3 + ru() * 0.8) * 0x3);
            const rA = 0x14 + Math[xo(0xa3a)](rz * 3.14) * 0x6e,
              rB = Math[xo(0xa3a)](ry + rw) * 0.5,
              rC = Math[xo(0x68a)](rv + rB) * rA,
              rD = Math[xo(0xa3a)](rv + rB) * rA,
              rE = rC - rr,
              rF = rD - rs;
            rq[xo(0xd95)]((rr + rC) / 0x2 + rF, (rs + rD) / 0x2 - rE, rC, rD),
              (rr = rC),
              (rs = rD);
          }
        }
        [uf(0x7ab)](rq) {
          const xp = uf;
          rq[xp(0x3ad)](this[xp(0xd48)] / 0x6e),
            (rq[xp(0x20a)] = xp(0x7eb)),
            (rq[xp(0xd87)] = 0x1c),
            rq[xp(0x721)](),
            rq[xp(0x1e0)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x632)] = this[xp(0xa9f)](xp(0xb8b))),
            rq[xp(0x80f)](),
            rq[xp(0x96f)](),
            rq[xp(0xc04)](),
            rq[xp(0xaaa)](),
            rq[xp(0x416)](),
            rq[xp(0x721)](),
            rq[xp(0x1e0)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x632)] = xp(0x9c0)),
            rq[xp(0x80f)](),
            rq[xp(0x96f)](),
            rq[xp(0xc04)](),
            rq[xp(0xaaa)](),
            rq[xp(0x416)]();
          const rr = lp(
              this[xp(0x126)] ||
                (this[xp(0x126)] = this[xp(0xa38)]
                  ? 0x1e
                  : Math[xp(0x50e)]() * 0x3e8)
            ),
            rs = this[xp(0xa9f)](xp(0x37c)),
            rt = this[xp(0xa9f)](xp(0x769));
          for (let rw = 0x0; rw < 0x3; rw++) {
            rq[xp(0x721)]();
            const rx = 0xc;
            for (let ry = 0x0; ry < rx; ry++) {
              const rz = (Math["PI"] * 0x2 * ry) / rx;
              rq[xp(0x96f)](),
                rq[xp(0x488)](rz + rr() * 0.4),
                rq[xp(0x5df)](0x3c + rr() * 0xa, 0x0),
                rq[xp(0x371)](rr() * 0x5, rr() * 0x5),
                rq[xp(0x13c)](
                  0x14 + rr() * 0xa,
                  rr() * 0x14,
                  0x28 + rr() * 0x14,
                  rr() * 0x1e + 0xa,
                  0x3c + rr() * 0xa,
                  rr() * 0xa + 0xa
                ),
                rq[xp(0x416)]();
            }
            (rq[xp(0xa23)] = rq[xp(0x62f)] = xp(0x7cc)),
              (rq[xp(0xd87)] = 0x12 - rw * 0x2),
              (rq[xp(0x20a)] = rs),
              rq[xp(0xaaa)](),
              (rq[xp(0xd87)] -= 0x8),
              (rq[xp(0x20a)] = rt),
              rq[xp(0xaaa)]();
          }
          const ru = 0x28;
          rq[xp(0x488)](-this[xp(0xcaa)]),
            (rq[xp(0x632)] = this[xp(0xa9f)](xp(0x288))),
            (rq[xp(0x20a)] = this[xp(0xa9f)](xp(0x1c9))),
            (rq[xp(0xd87)] = 0x9);
          const rv = this[xp(0x81b)] * 0x6;
          for (let rA = 0x0; rA < rv; rA++) {
            const rB = ((rA - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rq[xp(0x721)](),
              rq[xp(0x9d3)](
                Math[xp(0x68a)](rB) * ru,
                Math[xp(0xa3a)](rB) * ru * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xp(0x80f)](),
              rq[xp(0xaaa)]();
          }
        }
        [uf(0x172)](rq) {
          const xq = uf;
          rq[xq(0x488)](-this[xq(0xcaa)]),
            rq[xq(0x3ad)](this[xq(0xd48)] / 0x3c),
            (rq[xq(0xa23)] = rq[xq(0x62f)] = xq(0x7cc));
          let rr =
            Math[xq(0xa3a)](Date[xq(0x160)]() / 0x12c + this[xq(0xa90)] * 0.5) *
              0.5 +
            0.5;
          (rr *= 1.5),
            rq[xq(0x721)](),
            rq[xq(0x371)](-0x32, -0x32 - rr * 0x3),
            rq[xq(0xd95)](0x0, -0x3c, 0x32, -0x32 - rr * 0x3),
            rq[xq(0xd95)](0x50 - rr * 0x3, -0xa, 0x50, 0x32),
            rq[xq(0xd95)](0x46, 0x4b, 0x28, 0x4e + rr * 0x5),
            rq[xq(0x8f6)](0x1e, 0x3c + rr * 0x5),
            rq[xq(0xd95)](0x2d, 0x37, 0x32, 0x2d),
            rq[xq(0xd95)](0x0, 0x41, -0x32, 0x32),
            rq[xq(0xd95)](-0x2d, 0x37, -0x1e, 0x3c + rr * 0x3),
            rq[xq(0x8f6)](-0x28, 0x4e + rr * 0x5),
            rq[xq(0xd95)](-0x46, 0x4b, -0x50, 0x32),
            rq[xq(0xd95)](-0x50 + rr * 0x3, -0xa, -0x32, -0x32 - rr * 0x3),
            (rq[xq(0x632)] = this[xq(0xa9f)](xq(0x2f8))),
            rq[xq(0x80f)](),
            (rq[xq(0x20a)] = xq(0x7eb)),
            rq[xq(0x96f)](),
            rq[xq(0xc04)](),
            (rq[xq(0xd87)] = 0xe),
            rq[xq(0xaaa)](),
            rq[xq(0x416)]();
          for (let rs = 0x0; rs < 0x2; rs++) {
            rq[xq(0x96f)](),
              rq[xq(0x37a)](rs * 0x2 - 0x1, 0x1),
              rq[xq(0x5df)](-0x22, -0x18 - rr * 0x3),
              rq[xq(0x488)](-0.6),
              rq[xq(0x37a)](1.3, 1.3),
              rq[xq(0x721)](),
              rq[xq(0x371)](-0x14, 0x0),
              rq[xq(0xd95)](-0x14, -0x19, 0x0, -0x28),
              rq[xq(0xd95)](0x14, -0x19, 0x14, 0x0),
              rq[xq(0x80f)](),
              rq[xq(0xc04)](),
              (rq[xq(0xd87)] = 0xd),
              rq[xq(0xaaa)](),
              rq[xq(0x416)]();
          }
          rq[xq(0x96f)](),
            rq[xq(0x721)](),
            rq[xq(0x9d3)](
              0x0,
              0x1e,
              0x24 - rr * 0x2,
              0x8 - rr,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xq(0x632)] = this[xq(0xa9f)](xq(0xaf6))),
            (rq[xq(0xac6)] *= 0.2),
            rq[xq(0x80f)](),
            rq[xq(0x416)](),
            (rq[xq(0x632)] = rq[xq(0x20a)] = this[xq(0xa9f)](xq(0x291)));
          for (let rt = 0x0; rt < 0x2; rt++) {
            rq[xq(0x96f)](),
              rq[xq(0x37a)](rt * 0x2 - 0x1, 0x1),
              rq[xq(0x5df)](0x19 - rr * 0x1, 0xf - rr * 0x3),
              rq[xq(0x488)](-0.3),
              rq[xq(0x721)](),
              rq[xq(0x1e0)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rq[xq(0x80f)](),
              rq[xq(0x416)]();
          }
          rq[xq(0x96f)](),
            (rq[xq(0xd87)] = 0x5),
            rq[xq(0x5df)](0x0, 0x21 - rr * 0x1),
            rq[xq(0x721)](),
            rq[xq(0x371)](-0xc, 0x0),
            rq[xq(0x13c)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rq[xq(0x13c)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rq[xq(0xaaa)](),
            rq[xq(0x416)]();
        }
        [uf(0xa66)](rq) {
          const xr = uf;
          rq[xr(0x3ad)](this[xr(0xd48)] / 0x3c),
            rq[xr(0x488)](-Math["PI"] / 0x2),
            rq[xr(0x721)](),
            rq[xr(0x371)](0x32, 0x50),
            rq[xr(0xd95)](0x1e, 0x1e, 0x32, -0x14),
            rq[xr(0xd95)](0x5a, -0x64, 0x0, -0x64),
            rq[xr(0xd95)](-0x5a, -0x64, -0x32, -0x14),
            rq[xr(0xd95)](-0x1e, 0x1e, -0x32, 0x50),
            (rq[xr(0x632)] = this[xr(0xa9f)](xr(0x4ec))),
            rq[xr(0x80f)](),
            (rq[xr(0x62f)] = rq[xr(0xa23)] = xr(0x7cc)),
            (rq[xr(0xd87)] = 0x14),
            rq[xr(0xc04)](),
            (rq[xr(0x20a)] = xr(0x7eb)),
            rq[xr(0xaaa)](),
            (rq[xr(0x632)] = this[xr(0xa9f)](xr(0x2df)));
          const rr = 0x6;
          rq[xr(0x721)](), rq[xr(0x371)](-0x32, 0x50);
          for (let rs = 0x0; rs < rr; rs++) {
            const rt = (((rs + 0.5) / rr) * 0x2 - 0x1) * 0x32,
              ru = (((rs + 0x1) / rr) * 0x2 - 0x1) * 0x32;
            rq[xr(0xd95)](rt, 0x1e, ru, 0x50);
          }
          (rq[xr(0xd87)] = 0x8),
            rq[xr(0x80f)](),
            rq[xr(0xaaa)](),
            (rq[xr(0x20a)] = rq[xr(0x632)] = xr(0x7eb)),
            rq[xr(0x96f)](),
            rq[xr(0x5df)](0x0, -0x5),
            rq[xr(0x721)](),
            rq[xr(0x371)](0x0, 0x0),
            rq[xr(0x13c)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rq[xr(0xaaa)](),
            rq[xr(0x416)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xr(0x96f)](),
              rq[xr(0x37a)](rv * 0x2 - 0x1, 0x1),
              rq[xr(0x5df)](0x19, -0x38),
              rq[xr(0x721)](),
              rq[xr(0x1e0)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rq[xr(0xc04)](),
              (rq[xr(0xd87)] = 0xf),
              rq[xr(0xaaa)](),
              rq[xr(0x80f)](),
              rq[xr(0x416)]();
          }
        }
        [uf(0xa35)](rq) {
          const xs = uf;
          rq[xs(0x3ad)](this[xs(0xd48)] / 0x32),
            (rq[xs(0x20a)] = xs(0x7eb)),
            (rq[xs(0xd87)] = 0x10);
          const rr = 0x7;
          rq[xs(0x721)]();
          const rs = 0x12;
          rq[xs(0x632)] = this[xs(0xa9f)](xs(0x148));
          const rt = Math[xs(0xa3a)](pz / 0x258);
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = 1.2 - ru * 0.2;
            for (let rw = 0x0; rw < rr; rw++) {
              rq[xs(0x96f)](),
                rq[xs(0x488)](
                  (rw / rr) * Math["PI"] * 0x2 + (ru / rr) * Math["PI"]
                ),
                rq[xs(0x5df)](0x2e, 0x0),
                rq[xs(0x37a)](rv, rv);
              const rx = Math[xs(0xa3a)](rt + rw * 0.05 * (0x1 - ru * 0.5));
              rq[xs(0x721)](),
                rq[xs(0x371)](0x0, rs),
                rq[xs(0xd95)](0x14, rs, 0x28 + rx, 0x0 + rx * 0x5),
                rq[xs(0xd95)](0x14, -rs, 0x0, -rs),
                rq[xs(0x80f)](),
                rq[xs(0xc04)](),
                rq[xs(0xaaa)](),
                rq[xs(0x416)]();
            }
          }
          rq[xs(0x721)](),
            rq[xs(0x1e0)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rq[xs(0x632)] = this[xs(0xa9f)](xs(0xd2f))),
            rq[xs(0x80f)](),
            rq[xs(0xc04)](),
            (rq[xs(0xd87)] = 0x19),
            rq[xs(0xaaa)]();
        }
        [uf(0x53b)](rq) {
          const xt = uf;
          rq[xt(0x3ad)](this[xt(0xd48)] / 0x28);
          let rr = this[xt(0xa90)];
          const rs = this[xt(0xa38)] ? 0x0 : Math[xt(0xa3a)](pz / 0x64) * 0xf;
          (rq[xt(0xa23)] = rq[xt(0x62f)] = xt(0x7cc)),
            rq[xt(0x721)](),
            rq[xt(0x96f)]();
          const rt = 0x3;
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = ru === 0x0 ? 0x1 : -0x1;
            for (let rw = 0x0; rw <= rt; rw++) {
              rq[xt(0x96f)](), rq[xt(0x371)](0x0, 0x0);
              const rx = Math[xt(0xa3a)](rr + rw + ru);
              rq[xt(0x488)](((rw / rt) * 0x2 - 0x1) * 0.6 + 1.4 + rx * 0.15),
                rq[xt(0x8f6)](0x2d + rv * rs, 0x0),
                rq[xt(0x488)](0.2 + (rx * 0.5 + 0.5) * 0.1),
                rq[xt(0x8f6)](0x4b, 0x0),
                rq[xt(0x416)]();
            }
            rq[xt(0x37a)](0x1, -0x1);
          }
          rq[xt(0x416)](),
            (rq[xt(0xd87)] = 0x8),
            (rq[xt(0x20a)] = this[xt(0xa9f)](xt(0xd58))),
            rq[xt(0xaaa)](),
            rq[xt(0x96f)](),
            rq[xt(0x5df)](0x0, rs),
            this[xt(0x8dc)](rq),
            rq[xt(0x416)]();
        }
        [uf(0x8dc)](rq, rr = ![]) {
          const xu = uf;
          (rq[xu(0xa23)] = rq[xu(0x62f)] = xu(0x7cc)),
            rq[xu(0x488)](-0.15),
            rq[xu(0x721)](),
            rq[xu(0x371)](-0x32, 0x0),
            rq[xu(0x8f6)](0x28, 0x0),
            rq[xu(0x371)](0xf, 0x0),
            rq[xu(0x8f6)](-0x5, 0x19),
            rq[xu(0x371)](-0x3, 0x0),
            rq[xu(0x8f6)](0xc, -0x14),
            rq[xu(0x371)](-0xe, -0x5),
            rq[xu(0x8f6)](-0x2e, -0x17),
            (rq[xu(0xd87)] = 0x1c),
            (rq[xu(0x20a)] = this[xu(0xa9f)](xu(0xcf8))),
            rq[xu(0xaaa)](),
            (rq[xu(0x20a)] = this[xu(0xa9f)](xu(0x945))),
            (rq[xu(0xd87)] -= rr ? 0xf : 0xa),
            rq[xu(0xaaa)]();
        }
        [uf(0xb6f)](rq) {
          const xv = uf;
          rq[xv(0x3ad)](this[xv(0xd48)] / 0x64),
            rq[xv(0x721)](),
            rq[xv(0x1e0)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xv(0x632)] = this[xv(0xa9f)](xv(0x8b7))),
            rq[xv(0x80f)](),
            rq[xv(0xc04)](),
            (rq[xv(0xd87)] = this[xv(0x558)] ? 0x32 : 0x1e),
            (rq[xv(0x20a)] = xv(0x7eb)),
            rq[xv(0xaaa)]();
          if (!this[xv(0x6cd)]) {
            const rr = new Path2D(),
              rs = this[xv(0x558)] ? 0x2 : 0x3;
            for (let rt = 0x0; rt <= rs; rt++) {
              for (let ru = 0x0; ru <= rs; ru++) {
                const rv =
                    ((ru / rs + Math[xv(0x50e)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rt % 0x2 === 0x0 ? -0x14 : 0x0),
                  rw = ((rt / rs + Math[xv(0x50e)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rx = Math[xv(0x50e)]() * 0xd + (this[xv(0x558)] ? 0xe : 0x7);
                rr[xv(0x371)](rv, rw),
                  rr[xv(0x1e0)](rv, rw, rx, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xv(0x6cd)] = rr;
          }
          rq[xv(0x721)](),
            rq[xv(0x1e0)](
              0x0,
              0x0,
              0x64 - rq[xv(0xd87)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xv(0xc04)](),
            (rq[xv(0x632)] = xv(0xc5a)),
            rq[xv(0x80f)](this[xv(0x6cd)]);
        }
        [uf(0x3ee)](rq) {
          const xw = uf;
          rq[xw(0x3ad)](this[xw(0xd48)] / 0x64),
            rq[xw(0x96f)](),
            rq[xw(0x5df)](-0xf5, -0xdc),
            (rq[xw(0x20a)] = this[xw(0xa9f)](xw(0x3a3))),
            (rq[xw(0x632)] = this[xw(0xa9f)](xw(0x37b))),
            (rq[xw(0xd87)] = 0xf),
            (rq[xw(0x62f)] = rq[xw(0xa23)] = xw(0x7cc));
          const rr = !this[xw(0x558)];
          if (rr) {
            rq[xw(0x96f)](),
              rq[xw(0x5df)](0x10e, 0xde),
              rq[xw(0x96f)](),
              rq[xw(0x488)](-0.1);
            for (let rs = 0x0; rs < 0x3; rs++) {
              rq[xw(0x721)](),
                rq[xw(0x371)](-0x5, 0x0),
                rq[xw(0xd95)](0x0, 0x28, 0x5, 0x0),
                rq[xw(0xaaa)](),
                rq[xw(0x80f)](),
                rq[xw(0x5df)](0x28, 0x0);
            }
            rq[xw(0x416)](), rq[xw(0x5df)](0x17, 0x32), rq[xw(0x488)](0.05);
            for (let rt = 0x0; rt < 0x2; rt++) {
              rq[xw(0x721)](),
                rq[xw(0x371)](-0x5, 0x0),
                rq[xw(0xd95)](0x0, -0x28, 0x5, 0x0),
                rq[xw(0xaaa)](),
                rq[xw(0x80f)](),
                rq[xw(0x5df)](0x28, 0x0);
            }
            rq[xw(0x416)]();
          }
          rq[xw(0x80f)](lm),
            rq[xw(0xaaa)](lm),
            rq[xw(0x80f)](ln),
            rq[xw(0xaaa)](ln),
            rq[xw(0x416)](),
            rr &&
              (rq[xw(0x721)](),
              rq[xw(0x1e0)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rq[xw(0x1e0)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rq[xw(0x632)] = xw(0x7eb)),
              rq[xw(0x80f)]());
        }
        [uf(0x15e)](rq) {
          const xx = uf;
          rq[xx(0x3ad)](this[xx(0xd48)] / 0x46), rq[xx(0x96f)]();
          !this[xx(0x558)] && rq[xx(0x488)](Math["PI"] / 0x2);
          rq[xx(0x5df)](0x0, 0x2d),
            rq[xx(0x721)](),
            rq[xx(0x371)](0x0, -0x64),
            rq[xx(0x13c)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rq[xx(0x13c)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rq[xx(0xa23)] = rq[xx(0x62f)] = xx(0x7cc)),
            (rq[xx(0xd87)] = 0x3c),
            (rq[xx(0x20a)] = this[xx(0xa9f)](xx(0x6d8))),
            rq[xx(0xaaa)](),
            (rq[xx(0xd87)] -= this[xx(0x558)] ? 0x23 : 0x14),
            (rq[xx(0x632)] = rq[xx(0x20a)] = this[xx(0xa9f)](xx(0xcdb))),
            rq[xx(0xaaa)](),
            (rq[xx(0xd87)] -= this[xx(0x558)] ? 0x16 : 0xf),
            (rq[xx(0x632)] = rq[xx(0x20a)] = this[xx(0xa9f)](xx(0x319))),
            rq[xx(0xaaa)](),
            rq[xx(0x80f)](),
            rq[xx(0x5df)](0x0, -0x24);
          if (this[xx(0x558)]) rq[xx(0x3ad)](0.9);
          rq[xx(0x721)](),
            rq[xx(0x9d3)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x632)] = this[xx(0xa9f)](xx(0xc62))),
            rq[xx(0x80f)](),
            rq[xx(0xc04)](),
            (rq[xx(0xd87)] = 0xd),
            (rq[xx(0x20a)] = xx(0x7eb)),
            rq[xx(0xaaa)](),
            rq[xx(0x721)](),
            rq[xx(0x9d3)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x632)] = xx(0x131)),
            rq[xx(0x80f)](),
            rq[xx(0x416)]();
        }
        [uf(0x60f)](rq) {
          const xy = uf;
          rq[xy(0x3ad)](this[xy(0xd48)] / 0x19);
          !this[xy(0xa38)] &&
            this[xy(0x558)] &&
            rq[xy(0x488)](Math[xy(0xa3a)](pz / 0x64 + this["id"]) * 0.15);
          rq[xy(0x721)](),
            rq[xy(0x924)](-0x16, -0x16, 0x2c, 0x2c),
            (rq[xy(0x632)] = this[xy(0xa9f)](xy(0x8de))),
            rq[xy(0x80f)](),
            (rq[xy(0xd87)] = 0x6),
            (rq[xy(0x62f)] = xy(0x7cc)),
            (rq[xy(0x20a)] = this[xy(0xa9f)](xy(0x37b))),
            rq[xy(0xaaa)](),
            rq[xy(0x721)]();
          const rr = this[xy(0xa38)] ? 0x1 : 0x1 - Math[xy(0xa3a)](pz / 0x1f4),
            rs = rw(0x0, 0.25),
            rt = 0x1 - rw(0.25, 0.25),
            ru = rw(0.5, 0.25),
            rv = rw(0.75, 0.25);
          function rw(rx, ry) {
            const xz = xy;
            return Math[xz(0x9dc)](0x1, Math[xz(0x8ab)](0x0, (rr - rx) / ry));
          }
          rq[xy(0x488)]((rt * Math["PI"]) / 0x4);
          for (let rx = 0x0; rx < 0x2; rx++) {
            const ry = (rx * 0x2 - 0x1) * 0x7 * rv;
            for (let rz = 0x0; rz < 0x3; rz++) {
              let rA = rs * (-0xb + rz * 0xb);
              rq[xy(0x371)](rA, ry),
                rq[xy(0x1e0)](rA, ry, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rq[xy(0x632)] = this[xy(0xa9f)](xy(0x1d5))), rq[xy(0x80f)]();
        }
        [uf(0x536)](rq) {
          const xA = uf;
          rq[xA(0x96f)](),
            rq[xA(0x5df)](this["x"], this["y"]),
            this[xA(0x6cc)](rq),
            rq[xA(0x488)](this[xA(0xcaa)]),
            (rq[xA(0xd87)] = 0x8);
          const rr = (rw, rx) => {
              const xB = xA;
              (rt = this[xB(0xd48)] / 0x14),
                rq[xB(0x37a)](rt, rt),
                rq[xB(0x721)](),
                rq[xB(0x1e0)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xB(0x632)] = this[xB(0xa9f)](rw)),
                rq[xB(0x80f)](),
                (rq[xB(0x20a)] = this[xB(0xa9f)](rx)),
                rq[xB(0xaaa)]();
            },
            rs = (rw, rx, ry) => {
              const xC = xA;
              (rw = l8[rw]),
                rq[xC(0x37a)](this[xC(0xd48)], this[xC(0xd48)]),
                (rq[xC(0xd87)] /= this[xC(0xd48)]),
                (rq[xC(0x20a)] = this[xC(0xa9f)](ry)),
                rq[xC(0xaaa)](rw),
                (rq[xC(0x632)] = this[xC(0xa9f)](rx)),
                rq[xC(0x80f)](rw);
            };
          let rt, ru, rv;
          switch (this[xA(0x344)]) {
            case cS[xA(0x60f)]:
            case cS[xA(0x9db)]:
              this[xA(0x60f)](rq);
              break;
            case cS[xA(0x15e)]:
            case cS[xA(0x9ab)]:
              this[xA(0x15e)](rq);
              break;
            case cS[xA(0x7c1)]:
              (rq[xA(0x20a)] = xA(0x7eb)),
                (rq[xA(0xd87)] = 0x14),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x154))),
                rq[xA(0x5df)](-this[xA(0xd48)], 0x0),
                rq[xA(0x488)](-Math["PI"] / 0x2),
                rq[xA(0x3ad)](0.5),
                rq[xA(0x5df)](0x0, 0x46),
                this[xA(0xa84)](rq, this[xA(0xd48)] * 0x4);
              break;
            case cS[xA(0x2ff)]:
              this[xA(0x2ff)](rq);
              break;
            case cS[xA(0x177)]:
              this[xA(0x3ee)](rq);
              break;
            case cS[xA(0x3ee)]:
              this[xA(0x3ee)](rq);
              break;
            case cS[xA(0xb6f)]:
            case cS[xA(0xbdc)]:
              this[xA(0xb6f)](rq);
              break;
            case cS[xA(0xbab)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x1e), this[xA(0x8dc)](rq, !![]);
              break;
            case cS[xA(0x53b)]:
              this[xA(0x53b)](rq);
              break;
            case cS[xA(0x219)]:
              (rq[xA(0xd87)] *= 0.7),
                rs(xA(0x994), xA(0x148), xA(0xc6b)),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0xd2f))),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                (rq[xA(0x20a)] = xA(0x9d7)),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xa35)]:
              this[xA(0xa35)](rq);
              break;
            case cS[xA(0x900)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x16),
                rq[xA(0x488)](Math["PI"] / 0x2),
                rq[xA(0x721)]();
              for (let si = 0x0; si < 0x2; si++) {
                rq[xA(0x371)](-0xa, -0x1e),
                  rq[xA(0x13c)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rq[xA(0x37a)](0x1, -0x1);
              }
              (rq[xA(0xd87)] = 0x10),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xb9d))),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] -= 0x7),
                (rq[xA(0x20a)] = xA(0xd4b)),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xab9)]:
              this[xA(0xa66)](rq);
              break;
            case cS[xA(0x5a6)]:
              this[xA(0x172)](rq);
              break;
            case cS[xA(0x7ab)]:
              this[xA(0x7ab)](rq);
              break;
            case cS[xA(0x37d)]:
              this[xA(0x37d)](rq);
              break;
            case cS[xA(0x592)]:
              !this[xA(0xc74)] &&
                ((this[xA(0xc74)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xA(0x220)],
                  0x19
                )),
                (this[xA(0xc74)][xA(0x3dc)] = !![]),
                (this[xA(0xc74)][xA(0xcef)] = !![]),
                (this[xA(0xc74)][xA(0xd6c)] = 0x1),
                (this[xA(0xc74)][xA(0xd6f)] = !![]),
                (this[xA(0xc74)][xA(0x739)] = xA(0xce6)),
                (this[xA(0xc74)][xA(0x806)] = this[xA(0x806)]));
              rq[xA(0x488)](Math["PI"] / 0x2),
                (this[xA(0xc74)][xA(0x928)] = this[xA(0x928)]),
                (this[xA(0xc74)][xA(0xd48)] = this[xA(0xd48)]),
                this[xA(0xc74)][xA(0x536)](rq);
              break;
            case cS[xA(0x45e)]:
              this[xA(0x45e)](rq);
              break;
            case cS[xA(0xdb2)]:
              rq[xA(0x96f)](),
                rq[xA(0x3ad)](this[xA(0xd48)] / 0x64),
                rq[xA(0x488)]((Date[xA(0x160)]() / 0x190) % 6.28),
                this[xA(0x83d)](rq, 1.5),
                rq[xA(0x416)]();
              break;
            case cS[xA(0x125)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x14),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, -0x5),
                rq[xA(0x8f6)](-0x8, 0x0),
                rq[xA(0x8f6)](0x0, 0x5),
                rq[xA(0x8f6)](0x8, 0x0),
                rq[xA(0x925)](),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x20),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x61a))),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 0x14),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xb78))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xa74)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x14),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x5, -0x5),
                rq[xA(0x8f6)](-0x5, 0x5),
                rq[xA(0x8f6)](0x5, 0x0),
                rq[xA(0x925)](),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x20),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xd28))),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 0x14),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x2c5))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x3d7)]:
              this[xA(0x961)](rq, xA(0x529));
              break;
            case cS[xA(0xbf6)]:
              this[xA(0x961)](rq, xA(0x6c1));
              break;
            case cS[xA(0x461)]:
              this[xA(0x961)](rq, xA(0xbfb));
              break;
            case cS[xA(0x630)]:
              this[xA(0x630)](rq);
              break;
            case cS[xA(0x3b7)]:
              this[xA(0x3b7)](rq);
              break;
            case cS[xA(0x777)]:
              this[xA(0x777)](rq);
              break;
            case cS[xA(0x773)]:
              this[xA(0x777)](rq, !![]);
              break;
            case cS[xA(0x89e)]:
              this[xA(0x89e)](rq);
              break;
            case cS[xA(0x384)]:
              this[xA(0x384)](rq);
              break;
            case cS[xA(0x89b)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x19),
                lE(rq, 0x19),
                (rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x292))),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x191))),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xc30)]:
              rq[xA(0x5df)](-this[xA(0xd48)], 0x0);
              const rw = Date[xA(0x160)]() / 0x32,
                rx = this[xA(0xd48)] * 0x2;
              rq[xA(0x721)]();
              const ry = 0x32;
              for (let sj = 0x0; sj < ry; sj++) {
                const sk = sj / ry,
                  sl = sk * Math["PI"] * (this[xA(0xa38)] ? 7.75 : 0xa) - rw,
                  sm = sk * rx,
                  sn = sm * this[xA(0xc3e)];
                rq[xA(0x8f6)](sm, Math[xA(0xa3a)](sl) * sn);
              }
              (rq[xA(0x20a)] = xA(0x910)),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x4),
                (rq[xA(0x9f0)] = xA(0x6de)),
                (rq[xA(0x892)] = this[xA(0xa38)] ? 0xa : 0x14),
                rq[xA(0xaaa)](),
                rq[xA(0xaaa)](),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x1fe)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x37), this[xA(0xb48)](rq);
              break;
            case cS[xA(0x79d)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x14), rq[xA(0x721)]();
              for (let so = 0x0; so < 0x2; so++) {
                rq[xA(0x371)](-0x17, -0x5),
                  rq[xA(0xd95)](0x0, 5.5, 0x17, -0x5),
                  rq[xA(0x37a)](0x1, -0x1);
              }
              (rq[xA(0xd87)] = 0xf),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x37b))),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] -= 0x6),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x8de))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xc4d)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x23),
                rq[xA(0x721)](),
                rq[xA(0x9d3)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0xb69))),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                (rq[xA(0x20a)] = xA(0x9c0)),
                (rq[xA(0xd87)] = 0x12),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x1e, 0x0),
                rq[xA(0x13c)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rq[xA(0x13c)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rq[xA(0xd87)] = 0x3),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0x20a)] = rq[xA(0x632)] = xA(0x164)),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x9ed)]:
              if (this[xA(0x4b8)] !== this[xA(0x9ac)]) {
                this[xA(0x4b8)] = this[xA(0x9ac)];
                const sp = new Path2D(),
                  sq = Math[xA(0x7cc)](
                    this[xA(0x9ac)] * (this[xA(0x9ac)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sr = (Math["PI"] * 0x2) / sq,
                  ss = this[xA(0x9ac)] < 0x64 ? 0.3 : 0.1;
                for (let st = 0x0; st < sq; st++) {
                  const su = st * sr,
                    sv = su + Math[xA(0x50e)]() * sr,
                    sw = 0x1 - Math[xA(0x50e)]() * ss;
                  sp[xA(0x8f6)](
                    Math[xA(0x68a)](sv) * this[xA(0x9ac)] * sw,
                    Math[xA(0xa3a)](sv) * this[xA(0x9ac)] * sw
                  );
                }
                sp[xA(0x925)](), (this[xA(0xc38)] = sp);
              }
              (rt = this[xA(0xd48)] / this[xA(0x9ac)]), rq[xA(0x37a)](rt, rt);
              const rz = this[xA(0x64f)] ? lh : [xA(0x8b8), xA(0x8bf)];
              (rq[xA(0x20a)] = this[xA(0xa9f)](rz[0x1])),
                rq[xA(0xaaa)](this[xA(0xc38)]),
                (rq[xA(0x632)] = this[xA(0xa9f)](rz[0x0])),
                rq[xA(0x80f)](this[xA(0xc38)]);
              break;
            case cS[xA(0x217)]:
              if (this[xA(0x4b8)] !== this[xA(0x9ac)]) {
                this[xA(0x4b8)] = this[xA(0x9ac)];
                const sx = Math[xA(0x7cc)](
                    this[xA(0x9ac)] > 0xc8
                      ? this[xA(0x9ac)] * 0.18
                      : this[xA(0x9ac)] * 0.25
                  ),
                  sy = 0.5,
                  sz = 0.85;
                this[xA(0xc38)] = la(sx, this[xA(0x9ac)], sy, sz);
                if (this[xA(0x9ac)] < 0x12c) {
                  const sA = new Path2D(),
                    sB = sx * 0x2;
                  for (let sC = 0x0; sC < sB; sC++) {
                    const sD = ((sC + 0x1) / sB) * Math["PI"] * 0x2;
                    let sE = (sC % 0x2 === 0x0 ? 0.7 : 1.2) * this[xA(0x9ac)];
                    sA[xA(0x8f6)](
                      Math[xA(0x68a)](sD) * sE,
                      Math[xA(0xa3a)](sD) * sE
                    );
                  }
                  sA[xA(0x925)](), (this[xA(0x508)] = sA);
                } else this[xA(0x508)] = null;
              }
              (rt = this[xA(0xd48)] / this[xA(0x9ac)]), rq[xA(0x37a)](rt, rt);
              this[xA(0x508)] &&
                ((rq[xA(0x632)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0x80f)](this[xA(0x508)]));
              (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xc7e))),
                rq[xA(0xaaa)](this[xA(0xc38)]),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x71b))),
                rq[xA(0x80f)](this[xA(0xc38)]);
              break;
            case cS[xA(0x727)]:
              rq[xA(0x96f)](),
                (rt = this[xA(0xd48)] / 0x28),
                rq[xA(0x37a)](rt, rt),
                (rq[xA(0x632)] = rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc));
              for (let sF = 0x0; sF < 0x2; sF++) {
                const sG = sF === 0x0 ? 0x1 : -0x1;
                rq[xA(0x96f)](),
                  rq[xA(0x5df)](0x1c, sG * 0xd),
                  rq[xA(0x488)](
                    Math[xA(0xa3a)](this[xA(0xa90)] * 1.24) * 0.1 * sG
                  ),
                  rq[xA(0x721)](),
                  rq[xA(0x371)](0x0, sG * 0x6),
                  rq[xA(0x8f6)](0x14, sG * 0xb),
                  rq[xA(0x8f6)](0x28, 0x0),
                  rq[xA(0xd95)](0x14, sG * 0x5, 0x0, 0x0),
                  rq[xA(0x925)](),
                  rq[xA(0x80f)](),
                  rq[xA(0xaaa)](),
                  rq[xA(0x416)]();
              }
              (ru = this[xA(0x64f)] ? lh : [xA(0x7bd), xA(0x84e)]),
                (rq[xA(0x632)] = this[xA(0xa9f)](ru[0x0])),
                rq[xA(0x80f)](l5),
                (rq[xA(0xd87)] = 0x6),
                (rq[xA(0x632)] = rq[xA(0x20a)] = this[xA(0xa9f)](ru[0x1])),
                rq[xA(0xaaa)](l5),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x15, 0x0),
                rq[xA(0xd95)](0x0, -0x3, 0x15, 0x0),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x7),
                rq[xA(0xaaa)]();
              const rA = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rq[xA(0x721)]();
              for (let sH = 0x0; sH < 0x2; sH++) {
                const sI = sH === 0x1 ? 0x1 : -0x1;
                for (let sJ = 0x0; sJ < rA[xA(0x28c)]; sJ++) {
                  let [sK, sL] = rA[sJ];
                  (sL *= sI),
                    rq[xA(0x371)](sK, sL),
                    rq[xA(0x1e0)](sK, sL, 0x5, 0x0, l0);
                }
              }
              rq[xA(0x80f)](), rq[xA(0x80f)](), rq[xA(0x416)]();
              break;
            case cS[xA(0xc1a)]:
            case cS[xA(0x465)]:
              rq[xA(0x96f)](),
                (rt = this[xA(0xd48)] / 0x28),
                rq[xA(0x37a)](rt, rt);
              const rB = this[xA(0x344)] === cS[xA(0xc1a)];
              rB &&
                (rq[xA(0x96f)](),
                rq[xA(0x5df)](-0x2d, 0x0),
                rq[xA(0x488)](Math["PI"]),
                this[xA(0xde7)](rq, 0xf / 1.1),
                rq[xA(0x416)]());
              (ru = this[xA(0x64f)]
                ? lh
                : rB
                ? [xA(0x8ee), xA(0xb2e)]
                : [xA(0x98b), xA(0xbc3)]),
                rq[xA(0x721)](),
                rq[xA(0x9d3)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rq[xA(0xd87)] = 0xa),
                (rq[xA(0x20a)] = this[xA(0xa9f)](ru[0x1])),
                rq[xA(0xaaa)](),
                (rq[xA(0x632)] = this[xA(0xa9f)](ru[0x0])),
                rq[xA(0x80f)](),
                rq[xA(0x96f)](),
                rq[xA(0xc04)](),
                rq[xA(0x721)]();
              const rC = [-0x1e, -0x5, 0x16];
              for (let sM = 0x0; sM < rC[xA(0x28c)]; sM++) {
                const sN = rC[sM];
                rq[xA(0x371)](sN, -0x32),
                  rq[xA(0xd95)](sN - 0x14, 0x0, sN, 0x32);
              }
              (rq[xA(0xd87)] = 0xe),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0xaaa)](),
                rq[xA(0x416)]();
              rB ? this[xA(0x14a)](rq) : this[xA(0xb1b)](rq);
              rq[xA(0x416)]();
              break;
            case cS[xA(0x420)]:
              (rt = this[xA(0xd48)] / 0x32), rq[xA(0x37a)](rt, rt);
              const rD = 0x2f;
              rq[xA(0x721)]();
              for (let sO = 0x0; sO < 0x8; sO++) {
                let sP =
                  (0.25 + ((sO % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xA(0xa3a)](sO + this[xA(0xa90)] * 1.3) * 0.2;
                sO >= 0x4 && (sP *= -0x1),
                  rq[xA(0x371)](0x0, 0x0),
                  rq[xA(0x8f6)](
                    Math[xA(0x68a)](sP) * rD,
                    Math[xA(0xa3a)](sP) * rD
                  );
              }
              (rq[xA(0xd87)] = 0x7),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0xaaa)](),
                (rq[xA(0x632)] = rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x6);
              for (let sQ = 0x0; sQ < 0x2; sQ++) {
                const sR = sQ === 0x0 ? 0x1 : -0x1;
                rq[xA(0x96f)](),
                  rq[xA(0x5df)](0x16, sR * 0xa),
                  rq[xA(0x488)](
                    -(Math[xA(0xa3a)](this[xA(0xa90)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      sR
                  ),
                  rq[xA(0x721)](),
                  rq[xA(0x371)](0x0, sR * 0x6),
                  rq[xA(0xd95)](0x14, sR * 0xf, 0x28, 0x0),
                  rq[xA(0xd95)](0x14, sR * 0x5, 0x0, 0x0),
                  rq[xA(0x925)](),
                  rq[xA(0x80f)](),
                  rq[xA(0xaaa)](),
                  rq[xA(0x416)]();
              }
              (rq[xA(0xd87)] = 0x8),
                l9(
                  rq,
                  0x1,
                  0x8,
                  this[xA(0xa9f)](xA(0x135)),
                  this[xA(0xa9f)](xA(0xd7e))
                );
              let rE;
              (rE = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rq[xA(0x721)]();
              for (let sS = 0x0; sS < rE[xA(0x28c)]; sS++) {
                const [sT, sU] = rE[sS];
                rq[xA(0x371)](sT, -sU),
                  rq[xA(0xd95)](sT + Math[xA(0x70f)](sT) * 4.2, 0x0, sT, sU);
              }
              (rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0xaaa)](),
                rq[xA(0x5df)](-0x21, 0x0),
                l9(
                  rq,
                  0.45,
                  0x8,
                  this[xA(0xa9f)](xA(0xc54)),
                  this[xA(0xa9f)](xA(0x820))
                ),
                rq[xA(0x721)](),
                (rE = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let sV = 0x0; sV < rE[xA(0x28c)]; sV++) {
                const [sW, sX] = rE[sV];
                rq[xA(0x371)](sW, -sX), rq[xA(0xd95)](sW - 0x3, 0x0, sW, sX);
              }
              (rq[xA(0xd87)] = 0x5),
                (rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0xaaa)](),
                rq[xA(0x5df)](0x11, 0x0),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, -0x9),
                rq[xA(0x8f6)](0x0, 0x9),
                rq[xA(0x8f6)](0xb, 0x0),
                rq[xA(0x925)](),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x6),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x782))),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x1ba)]:
              this[xA(0x119)](rq, xA(0xb59), xA(0xb58), xA(0x419));
              break;
            case cS[xA(0xb2d)]:
              this[xA(0x119)](rq, xA(0x1cb), xA(0xb42), xA(0x7e8));
              break;
            case cS[xA(0x210)]:
              this[xA(0x119)](rq, xA(0xc17), xA(0x23e), xA(0x419));
              break;
            case cS[xA(0x4c3)]:
              (rt = this[xA(0xd48)] / 0x46),
                rq[xA(0x3ad)](rt),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0xafc))),
                rq[xA(0x80f)](lc),
                rq[xA(0xc04)](lc),
                (rq[xA(0xd87)] = 0xf),
                (rq[xA(0x20a)] = xA(0x26b)),
                rq[xA(0xaaa)](lc),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x7),
                (rq[xA(0x20a)] = xA(0x621)),
                rq[xA(0xaaa)](ld);
              break;
            case cS[xA(0xb83)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x28),
                this[xA(0x4d8)](rq, 0x32, 0x1e, 0x7);
              break;
            case cS[xA(0x67a)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x64),
                this[xA(0x4d8)](rq),
                (rq[xA(0x632)] = rq[xA(0x20a)]);
              const rF = 0x6,
                rG = 0x3;
              rq[xA(0x721)]();
              for (let sY = 0x0; sY < rF; sY++) {
                const sZ = (sY / rF) * Math["PI"] * 0x2;
                rq[xA(0x96f)](), rq[xA(0x488)](sZ);
                for (let t0 = 0x0; t0 < rG; t0++) {
                  const t1 = t0 / rG,
                    t2 = 0x12 + t1 * 0x44,
                    t3 = 0x7 + t1 * 0x6;
                  rq[xA(0x371)](t2, 0x0),
                    rq[xA(0x1e0)](t2, 0x0, t3, 0x0, Math["PI"] * 0x2);
                }
                rq[xA(0x416)]();
              }
              rq[xA(0x80f)]();
              break;
            case cS[xA(0xa1c)]:
              (rt = this[xA(0xd48)] / 0x31),
                rq[xA(0x3ad)](rt),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rv = this[xA(0xa90)] * 0x15e);
              const rH = (Math[xA(0xa3a)](rv * 0.01) * 0.5 + 0.5) * 0.1;
              (rq[xA(0x20a)] = rq[xA(0x632)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0xd87)] = 0x3);
              for (let t4 = 0x0; t4 < 0x2; t4++) {
                rq[xA(0x96f)]();
                const t5 = t4 * 0x2 - 0x1;
                rq[xA(0x37a)](0x1, t5),
                  rq[xA(0x5df)](0x1c, -0x27),
                  rq[xA(0x37a)](1.5, 1.5),
                  rq[xA(0x488)](rH),
                  rq[xA(0x721)](),
                  rq[xA(0x371)](0x0, 0x0),
                  rq[xA(0xd95)](0xc, -0x8, 0x14, 0x3),
                  rq[xA(0x8f6)](0xb, 0x1),
                  rq[xA(0x8f6)](0x11, 0x9),
                  rq[xA(0xd95)](0xc, 0x5, 0x0, 0x6),
                  rq[xA(0x925)](),
                  rq[xA(0xaaa)](),
                  rq[xA(0x80f)](),
                  rq[xA(0x416)]();
              }
              rq[xA(0x721)]();
              for (let t6 = 0x0; t6 < 0x2; t6++) {
                for (let t7 = 0x0; t7 < 0x4; t7++) {
                  const t8 = t6 * 0x2 - 0x1,
                    t9 =
                      (Math[xA(0xa3a)](rv * 0.005 + t6 + t7 * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rq[xA(0x96f)](),
                    rq[xA(0x37a)](0x1, t8),
                    rq[xA(0x5df)]((t7 / 0x3) * 0x1e - 0xf, 0x28);
                  const ta = t7 < 0x2 ? 0x1 : -0x1;
                  rq[xA(0x488)](t9 * ta),
                    rq[xA(0x371)](0x0, 0x0),
                    rq[xA(0x5df)](0x0, 0x19),
                    rq[xA(0x8f6)](0x0, 0x0),
                    rq[xA(0x488)](ta * 0.7 * (t9 + 0.3)),
                    rq[xA(0x8f6)](0x0, 0xa),
                    rq[xA(0x416)]();
                }
              }
              (rq[xA(0xd87)] = 0xa),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x2, 0x17),
                rq[xA(0xd95)](0x17, 0x0, 0x2, -0x17),
                rq[xA(0x8f6)](-0xa, -0xf),
                rq[xA(0x8f6)](-0xa, 0xf),
                rq[xA(0x925)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x423))),
                (rq[xA(0xd87)] = 0x44),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] -= 0x12),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xa79))),
                rq[xA(0xaaa)](),
                (rq[xA(0x20a)] = xA(0x7eb)),
                rq[xA(0x721)]();
              const rI = 0x12;
              for (let tb = 0x0; tb < 0x2; tb++) {
                rq[xA(0x371)](-0x12, rI),
                  rq[xA(0xd95)](0x0, -0x7 + rI, 0x12, rI),
                  rq[xA(0x37a)](0x1, -0x1);
              }
              (rq[xA(0xd87)] = 0x9), rq[xA(0xaaa)]();
              break;
            case cS[xA(0x55a)]:
              (rt = this[xA(0xd48)] / 0x50),
                rq[xA(0x3ad)](rt),
                rq[xA(0x488)](
                  ((Date[xA(0x160)]() / 0x7d0) % l0) + this[xA(0xa90)] * 0.4
                );
              const rJ = 0x5;
              !this[xA(0xbb7)] &&
                (this[xA(0xbb7)] = Array(rJ)[xA(0x80f)](0x64));
              const rK = this[xA(0xbb7)],
                rL = this[xA(0x3dc)]
                  ? 0x0
                  : Math[xA(0x61d)](this[xA(0x969)] * (rJ - 0x1));
              rq[xA(0x721)]();
              for (let tc = 0x0; tc < rJ; tc++) {
                const td = ((tc + 0.5) / rJ) * Math["PI"] * 0x2,
                  te = ((tc + 0x1) / rJ) * Math["PI"] * 0x2;
                rK[tc] += ((tc < rL ? 0x64 : 0x3c) - rK[tc]) * 0.2;
                const tf = rK[tc];
                if (tc === 0x0) rq[xA(0x371)](tf, 0x0);
                rq[xA(0xd95)](
                  Math[xA(0x68a)](td) * 0x5,
                  Math[xA(0xa3a)](td) * 0x5,
                  Math[xA(0x68a)](te) * tf,
                  Math[xA(0xa3a)](te) * tf
                );
              }
              rq[xA(0x925)](),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x1c + 0xa),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x204))),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 0x10 + 0xa),
                (rq[xA(0x20a)] = rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8cb))),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)](),
                rq[xA(0x721)]();
              for (let tg = 0x0; tg < rJ; tg++) {
                const th = (tg / rJ) * Math["PI"] * 0x2;
                rq[xA(0x96f)](), rq[xA(0x488)](th);
                const ti = rK[tg] / 0x64;
                let tj = 0x1a;
                const tk = 0x4;
                for (let tl = 0x0; tl < tk; tl++) {
                  const tm = (0x1 - (tl / tk) * 0.7) * 0xc * ti;
                  rq[xA(0x371)](tj, 0x0),
                    rq[xA(0x1e0)](tj, 0x0, tm, 0x0, Math["PI"] * 0x2),
                    (tj += tm * 0x2 + 3.5 * ti);
                }
                rq[xA(0x416)]();
              }
              (rq[xA(0x632)] = xA(0xddb)), rq[xA(0x80f)]();
              break;
            case cS[xA(0x3fe)]:
              (rt = this[xA(0xd48)] / 0x1e),
                rq[xA(0x3ad)](rt),
                rq[xA(0x5df)](-0x22, 0x0),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, -0x8),
                rq[xA(0xd95)](0x9b, 0x0, 0x0, 0x8),
                rq[xA(0x925)](),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x1a),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x204))),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 0x10),
                (rq[xA(0x20a)] = rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8cb))),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)](),
                rq[xA(0x721)]();
              let rM = 0xd;
              for (let tn = 0x0; tn < 0x4; tn++) {
                const to = (0x1 - (tn / 0x4) * 0.7) * 0xa;
                rq[xA(0x371)](rM, 0x0),
                  rq[xA(0x1e0)](rM, 0x0, to, 0x0, Math["PI"] * 0x2),
                  (rM += to * 0x2 + 0x4);
              }
              (rq[xA(0x632)] = xA(0xddb)), rq[xA(0x80f)]();
              break;
            case cS[xA(0x43e)]:
              (rt = this[xA(0xd48)] / 0x64),
                rq[xA(0x37a)](rt, rt),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0x20a)] = xA(0x3fd)),
                (rq[xA(0xd87)] = 0x14);
              const rN = [0x1, 0.63, 0.28],
                rO = this[xA(0x64f)] ? lo : [xA(0x178), xA(0x6f4), xA(0x3d0)],
                rP = (pz * 0.005) % l0;
              for (let tp = 0x0; tp < 0x3; tp++) {
                const tq = rN[tp],
                  tr = rO[tp];
                rq[xA(0x96f)](),
                  rq[xA(0x488)](rP * (tp % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rq[xA(0x721)]();
                const ts = 0x7 - tp;
                for (let tu = 0x0; tu < ts; tu++) {
                  const tv = (Math["PI"] * 0x2 * tu) / ts;
                  rq[xA(0x8f6)](
                    Math[xA(0x68a)](tv) * tq * 0x64,
                    Math[xA(0xa3a)](tv) * tq * 0x64
                  );
                }
                rq[xA(0x925)](),
                  (rq[xA(0x20a)] = rq[xA(0x632)] = this[xA(0xa9f)](tr)),
                  rq[xA(0x80f)](),
                  rq[xA(0xaaa)](),
                  rq[xA(0x416)]();
              }
              break;
            case cS[xA(0x80b)]:
              (rt = this[xA(0xd48)] / 0x41),
                rq[xA(0x37a)](rt, rt),
                (rv = this[xA(0xa90)] * 0x2),
                rq[xA(0x488)](Math["PI"] / 0x2);
              if (this[xA(0xca9)]) {
                const tw = 0x3;
                rq[xA(0x721)]();
                for (let tA = 0x0; tA < 0x2; tA++) {
                  for (let tB = 0x0; tB <= tw; tB++) {
                    const tC = (tB / tw) * 0x50 - 0x28;
                    rq[xA(0x96f)]();
                    const tD = tA * 0x2 - 0x1;
                    rq[xA(0x5df)](tD * -0x2d, tC);
                    const tE =
                      1.1 + Math[xA(0xa3a)]((tB / tw) * Math["PI"]) * 0.5;
                    rq[xA(0x37a)](tE * tD, tE),
                      rq[xA(0x488)](Math[xA(0xa3a)](rv + tB + tD) * 0.3 + 0.3),
                      rq[xA(0x371)](0x0, 0x0),
                      rq[xA(0xd95)](-0xf, -0x5, -0x14, 0xa),
                      rq[xA(0x416)]();
                  }
                }
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                  (rq[xA(0xd87)] = 0x8),
                  (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                  rq[xA(0xaaa)](),
                  (rq[xA(0xd87)] = 0xc);
                const tx = Date[xA(0x160)]() * 0.01,
                  ty = Math[xA(0xa3a)](tx * 0.5) * 0.5 + 0.5,
                  tz = ty * 0.1 + 0x1;
                rq[xA(0x721)](),
                  rq[xA(0x1e0)](-0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x1e0)](0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x371)](-0x16, -0x2b),
                  rq[xA(0x1e0)](0x0, -0x2b - ty, 0x16, 0x0, Math["PI"], !![]),
                  (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x4ee))),
                  rq[xA(0xaaa)](),
                  (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x7bd))),
                  rq[xA(0x80f)](),
                  rq[xA(0x96f)](),
                  rq[xA(0x488)]((Math["PI"] * 0x3) / 0x2),
                  this[xA(0xb1b)](rq, 0x1a - ty, 0x0),
                  rq[xA(0x416)]();
              }
              if (!this[xA(0x10c)]) {
                const tF = dI[d9[xA(0x4c8)]],
                  tG = Math[xA(0x8ab)](this["id"] % tF[xA(0x28c)], 0x0),
                  tH = new lN(-0x1, 0x0, 0x0, tF[tG]["id"]);
                (tH[xA(0x8a9)] = 0x1),
                  (tH[xA(0xcaa)] = 0x0),
                  (this[xA(0x10c)] = tH);
              }
              rq[xA(0x3ad)](1.3), this[xA(0x10c)][xA(0x536)](rq);
              break;
            case cS[xA(0x576)]:
              (rt = this[xA(0xd48)] / 0x14),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x11, 0x0),
                rq[xA(0x8f6)](0x0, 0x0),
                rq[xA(0x8f6)](0x11, 0x6),
                rq[xA(0x371)](0x0, 0x0),
                rq[xA(0x8f6)](0xb, -0x7),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xa11))),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0xc),
                rq[xA(0xaaa)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xd1e))),
                (rq[xA(0xd87)] = 0x6),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x628)]:
              (rt = this[xA(0xd48)] / 0x80),
                rq[xA(0x3ad)](rt),
                rq[xA(0x5df)](-0x80, -0x78),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x428))),
                rq[xA(0x80f)](f9[xA(0x6a1)]),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x7e5))),
                (rq[xA(0xd87)] = 0x14),
                rq[xA(0xaaa)](f9[xA(0x6a1)]);
              break;
            case cS[xA(0x5f3)]:
              (rt = this[xA(0xd48)] / 0x19),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x19, 0x0),
                rq[xA(0x8f6)](-0x2d, 0x0),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x14),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8de))),
                rq[xA(0x80f)](),
                (rq[xA(0xd87)] = 0x7),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x226))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x8fd)]:
              rq[xA(0x488)](-this[xA(0xcaa)]),
                rq[xA(0x3ad)](this[xA(0xd48)] / 0x14),
                this[xA(0x84f)](rq),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8de))),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                (rq[xA(0xd87)] = 0xc),
                (rq[xA(0x20a)] = xA(0x7eb)),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x71a)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x64), this[xA(0xc39)](rq);
              break;
            case cS[xA(0x5b3)]:
              this[xA(0x16b)](rq, !![]);
              break;
            case cS[xA(0x38a)]:
              this[xA(0x16b)](rq, ![]);
              break;
            case cS[xA(0xdac)]:
              (rt = this[xA(0xd48)] / 0xa),
                rq[xA(0x3ad)](rt),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, 0x8),
                rq[xA(0xd95)](2.5, 0x0, 0x0, -0x8),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0xa),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x226))),
                rq[xA(0xaaa)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x8de))),
                (rq[xA(0xd87)] = 0x6),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xd82)]:
              (rt = this[xA(0xd48)] / 0xa),
                rq[xA(0x3ad)](rt),
                rq[xA(0x5df)](0x7, 0x0),
                (rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x5, -0x5),
                rq[xA(0x13c)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rq[xA(0x13c)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0x80f)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x649))),
                (rq[xA(0xd87)] = 0x3),
                (rq[xA(0x62f)] = xA(0x7cc)),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x4f2)]:
              (rt = this[xA(0xd48)] / 0x32), rq[xA(0x3ad)](rt), rq[xA(0x721)]();
              for (let tI = 0x0; tI < 0x9; tI++) {
                const tJ = (tI / 0x9) * Math["PI"] * 0x2,
                  tK =
                    0x3c *
                    (0x1 +
                      Math[xA(0x68a)]((tI / 0x9) * Math["PI"] * 3.5) * 0.07);
                rq[xA(0x371)](0x0, 0x0),
                  rq[xA(0x8f6)](
                    Math[xA(0x68a)](tJ) * tK,
                    Math[xA(0xa3a)](tJ) * tK
                  );
              }
              (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x10),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8de))),
                rq[xA(0x80f)](),
                (rq[xA(0xd87)] = 0x6),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x226))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xd4e)]:
              rq[xA(0x96f)](),
                (rt = this[xA(0xd48)] / 0x28),
                rq[xA(0x37a)](rt, rt),
                this[xA(0xa4b)](rq),
                (rq[xA(0x632)] = this[xA(0xa9f)](
                  this[xA(0x64f)] ? lh[0x0] : xA(0xb39)
                )),
                (rq[xA(0x20a)] = xA(0xb20)),
                (rq[xA(0xd87)] = 0x10),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rq[xA(0x80f)](),
                rq[xA(0x96f)](),
                rq[xA(0xc04)](),
                rq[xA(0xaaa)](),
                rq[xA(0x416)](),
                rq[xA(0x416)]();
              break;
            case cS[xA(0xaa6)]:
            case cS[xA(0x8c6)]:
            case cS[xA(0x3d2)]:
            case cS[xA(0x73f)]:
            case cS[xA(0xcc4)]:
            case cS[xA(0x143)]:
            case cS[xA(0x48f)]:
            case cS[xA(0x6c4)]:
              (rt = this[xA(0xd48)] / 0x14), rq[xA(0x37a)](rt, rt);
              const rQ = Math[xA(0xa3a)](this[xA(0xa90)] * 1.6),
                rR = this[xA(0x853)][xA(0x904)](xA(0xaa6)),
                rS = this[xA(0x853)][xA(0x904)](xA(0xad2)),
                rT = this[xA(0x853)][xA(0x904)](xA(0x3d2)),
                rU = this[xA(0x853)][xA(0x904)](xA(0x3d2)) ? -0x4 : 0x0;
              (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x6);
              rS && rq[xA(0x5df)](0x8, 0x0);
              for (let tL = 0x0; tL < 0x2; tL++) {
                const tM = tL === 0x0 ? -0x1 : 0x1;
                rq[xA(0x96f)](), rq[xA(0x488)](tM * (rQ * 0.5 + 0.6) * 0.08);
                const tN = tM * 0x4;
                rq[xA(0x721)](),
                  rq[xA(0x371)](0x0, tN),
                  rq[xA(0xd95)](0xc, 0x6 * tM + tN, 0x18, tN),
                  rq[xA(0xaaa)](),
                  rq[xA(0x416)]();
              }
              if (this[xA(0x64f)])
                (rq[xA(0x632)] = this[xA(0xa9f)](lh[0x0])),
                  (rq[xA(0x20a)] = this[xA(0xa9f)](lh[0x1]));
              else
                this[xA(0x853)][xA(0x564)](xA(0x389))
                  ? ((rq[xA(0x632)] = this[xA(0xa9f)](xA(0x3f7))),
                    (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x50d))))
                  : ((rq[xA(0x632)] = this[xA(0xa9f)](xA(0x613))),
                    (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x413))));
              rq[xA(0xd87)] = rS ? 0x9 : 0xc;
              rS &&
                (rq[xA(0x96f)](),
                rq[xA(0x5df)](-0x18, 0x0),
                rq[xA(0x37a)](-0x1, 0x1),
                lF(rq, 0x15, rq[xA(0x632)], rq[xA(0x20a)], rq[xA(0xd87)]),
                rq[xA(0x416)]());
              !rT &&
                (rq[xA(0x96f)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](-0xa, 0x0, rS ? 0x12 : 0xc, 0x0, l0),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                rq[xA(0xaaa)](),
                rq[xA(0x416)]());
              if (rR || rS) {
                rq[xA(0x96f)](),
                  (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x154))),
                  (rq[xA(0xac6)] *= 0.5);
                const tO = (Math["PI"] / 0x7) * (rS ? 0.85 : 0x1) + rQ * 0.08;
                for (let tP = 0x0; tP < 0x2; tP++) {
                  const tQ = tP === 0x0 ? -0x1 : 0x1;
                  rq[xA(0x96f)](),
                    rq[xA(0x488)](tQ * tO),
                    rq[xA(0x5df)](
                      rS ? -0x13 : -0x9,
                      tQ * -0x3 * (rS ? 1.3 : 0x1)
                    ),
                    rq[xA(0x721)](),
                    rq[xA(0x9d3)](
                      0x0,
                      0x0,
                      rS ? 0x14 : 0xe,
                      rS ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rq[xA(0x80f)](),
                    rq[xA(0x416)]();
                }
                rq[xA(0x416)]();
              }
              rq[xA(0x96f)](),
                rq[xA(0x5df)](0x4 + rU, 0x0),
                lF(
                  rq,
                  rT ? 0x14 : 12.1,
                  rq[xA(0x632)],
                  rq[xA(0x20a)],
                  rq[xA(0xd87)]
                ),
                rq[xA(0x416)]();
              break;
            case cS[xA(0x8f4)]:
              this[xA(0xb9a)](rq, xA(0x1e3));
              break;
            case cS[xA(0x42c)]:
              this[xA(0xb9a)](rq, xA(0x709));
              break;
            case cS[xA(0xd43)]:
              this[xA(0xb9a)](rq, xA(0x782)),
                (rq[xA(0xac6)] *= 0.2),
                lJ(rq, this[xA(0xd48)] * 1.3, 0x4);
              break;
            case cS[xA(0x39a)]:
            case cS[xA(0xb53)]:
            case cS[xA(0xcaf)]:
            case cS[xA(0x952)]:
            case cS[xA(0x328)]:
            case cS[xA(0x3c8)]:
              rq[xA(0x96f)](),
                (rt = this[xA(0xd48)] / 0x28),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x721)]();
              for (let tR = 0x0; tR < 0x2; tR++) {
                rq[xA(0x96f)](),
                  rq[xA(0x37a)](0x1, tR * 0x2 - 0x1),
                  rq[xA(0x5df)](0x0, 0x23),
                  rq[xA(0x371)](0x9, 0x0),
                  rq[xA(0x8f6)](0x5, 0xa),
                  rq[xA(0x8f6)](-0x5, 0xa),
                  rq[xA(0x8f6)](-0x9, 0x0),
                  rq[xA(0x8f6)](0x9, 0x0),
                  rq[xA(0x416)]();
              }
              (rq[xA(0xd87)] = 0x12),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0x20a)] = rq[xA(0x632)] = this[xA(0xa9f)](xA(0x762))),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)]();
              let rV;
              if (this[xA(0x853)][xA(0x8f2)](xA(0xa9a)) > -0x1)
                rV = [xA(0x3f9), xA(0xc69)];
              else
                this[xA(0x853)][xA(0x8f2)](xA(0x4ab)) > -0x1
                  ? (rV = [xA(0x7bd), xA(0xa78)])
                  : (rV = [xA(0x70b), xA(0x91c)]);
              rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x28, 0x0, l0),
                (rq[xA(0x632)] = this[xA(0xa9f)](rV[0x0])),
                rq[xA(0x80f)](),
                (rq[xA(0xd87)] = 0x8),
                (rq[xA(0x20a)] = this[xA(0xa9f)](rV[0x1])),
                rq[xA(0xaaa)]();
              this[xA(0x853)][xA(0x8f2)](xA(0xf2)) > -0x1 &&
                this[xA(0xb1b)](rq, -0xf, 0x0, 1.25, 0x4);
              rq[xA(0x416)]();
              break;
            case cS[xA(0x2cd)]:
            case cS[xA(0xb79)]:
              (rv =
                Math[xA(0xa3a)](
                  Date[xA(0x160)]() / 0x3e8 + this[xA(0xa90)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rt = this[xA(0xd48)] / 0x50),
                rq[xA(0x37a)](rt, rt);
              const rW = this[xA(0x344)] === cS[xA(0xb79)];
              rW &&
                (rq[xA(0x96f)](),
                rq[xA(0x37a)](0x2, 0x2),
                this[xA(0xa4b)](rq),
                rq[xA(0x416)]());
              rq[xA(0x488)](-this[xA(0xcaa)]),
                (rq[xA(0xd87)] = 0xa),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (ru = this[xA(0x64f)]
                  ? lh
                  : rW
                  ? [xA(0xc88), xA(0x88b)]
                  : [xA(0x7c3), xA(0xbe1)]),
                (rq[xA(0x632)] = this[xA(0xa9f)](ru[0x0])),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](ru[0x1])),
                rq[xA(0xaaa)]();
              const rX = this[xA(0xa9f)](xA(0x8de)),
                rY = this[xA(0xa9f)](xA(0x419)),
                rZ = (tS = 0x1) => {
                  const xD = xA;
                  rq[xD(0x96f)](),
                    rq[xD(0x37a)](tS, 0x1),
                    rq[xD(0x5df)](0x13 - rv * 0x4, -0x1d + rv * 0x5),
                    rq[xD(0x721)](),
                    rq[xD(0x371)](0x0, 0x0),
                    rq[xD(0x13c)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rq[xD(0xd95)](0x19, 0x5 + rv * 0x2, 0x0, 0x0),
                    rq[xD(0x925)](),
                    (rq[xD(0xd87)] = 0x3),
                    rq[xD(0xaaa)](),
                    (rq[xD(0x632)] = rX),
                    rq[xD(0x80f)](),
                    rq[xD(0xc04)](),
                    rq[xD(0x721)](),
                    rq[xD(0x1e0)](
                      0x16 + tS * this[xD(0xbcf)] * 0x10,
                      -0x4 + this[xD(0x45c)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rq[xD(0x632)] = rY),
                    rq[xD(0x80f)](),
                    rq[xD(0x416)]();
                };
              rZ(0x1),
                rZ(-0x1),
                rq[xA(0x96f)](),
                rq[xA(0x5df)](0x0, 0xa),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x28 + rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0xd95)](0x0, +rv * 0x5, 0x2c - rv * 0xf, -0xe + rv * 0x5),
                rq[xA(0x13c)](
                  0x14,
                  0x28 - rv * 0x14,
                  -0x14,
                  0x28 - rv * 0x14,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                rq[xA(0x925)](),
                (rq[xA(0xd87)] = 0x5),
                rq[xA(0xaaa)](),
                (rq[xA(0x632)] = rY),
                rq[xA(0x80f)](),
                rq[xA(0xc04)]();
              const s0 = rv * 0x2,
                s1 = rv * -0xa;
              rq[xA(0x96f)](),
                rq[xA(0x5df)](0x0, s1),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x37, -0x8),
                rq[xA(0x13c)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rq[xA(0x20a)] = rX),
                (rq[xA(0xd87)] = 0xd),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 0x4),
                (rq[xA(0x20a)] = rY),
                rq[xA(0x721)]();
              for (let tS = 0x0; tS < 0x6; tS++) {
                const tT = (((tS + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rq[xA(0x371)](tT, 0xa), rq[xA(0x8f6)](tT, 0x46);
              }
              rq[xA(0xaaa)](),
                rq[xA(0x416)](),
                rq[xA(0x96f)](),
                rq[xA(0x5df)](0x0, s0),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x32, -0x14),
                rq[xA(0xd95)](0x0, 0x8, 0x32, -0x12),
                (rq[xA(0x20a)] = rX),
                (rq[xA(0xd87)] = 0xd),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 0x5),
                (rq[xA(0x20a)] = rY),
                rq[xA(0x721)]();
              for (let tU = 0x0; tU < 0x6; tU++) {
                let tV = (((tU + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rq[xA(0x371)](tV, -0x14), rq[xA(0x8f6)](tV, 0x2);
              }
              rq[xA(0xaaa)](), rq[xA(0x416)](), rq[xA(0x416)]();
              const s3 = 0x1 - rv;
              (rq[xA(0xac6)] *= Math[xA(0x8ab)](0x0, (s3 - 0.3) / 0.7)),
                rq[xA(0x721)]();
              for (let tW = 0x0; tW < 0x2; tW++) {
                rq[xA(0x96f)](),
                  tW === 0x1 && rq[xA(0x37a)](-0x1, 0x1),
                  rq[xA(0x5df)](
                    -0x33 + rv * (0xa + tW * 3.4) - tW * 3.4,
                    -0xf + rv * (0x5 - tW * 0x1)
                  ),
                  rq[xA(0x371)](0xa, 0x0),
                  rq[xA(0x1e0)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rq[xA(0x416)]();
              }
              rq[xA(0x5df)](0x0, 0x28),
                rq[xA(0x371)](0x28 - rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0x13c)](
                  0x14,
                  0x14 - rv * 0xa,
                  -0x14,
                  0x14 - rv * 0xa,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x2),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x2e0)]:
              (rt = this[xA(0xd48)] / 0x14), rq[xA(0x37a)](rt, rt);
              const s4 = rq[xA(0xac6)];
              (rq[xA(0x20a)] = rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8de))),
                (rq[xA(0xac6)] = 0.6 * s4),
                rq[xA(0x721)]();
              for (let tX = 0x0; tX < 0xa; tX++) {
                const tY = (tX / 0xa) * Math["PI"] * 0x2;
                rq[xA(0x96f)](),
                  rq[xA(0x488)](tY),
                  rq[xA(0x5df)](17.5, 0x0),
                  rq[xA(0x371)](0x0, 0x0);
                const tZ = Math[xA(0xa3a)](tY + Date[xA(0x160)]() / 0x1f4);
                rq[xA(0x488)](tZ * 0.5),
                  rq[xA(0xd95)](0x4, -0x2 * tZ, 0xe, 0x0),
                  rq[xA(0x416)]();
              }
              (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 2.3),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0xac6)] = 0.5 * s4),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                (rq[xA(0xd87)] = 0x3),
                rq[xA(0xaaa)](),
                (rq[xA(0xd87)] = 1.2),
                (rq[xA(0xac6)] = 0.6 * s4),
                rq[xA(0x721)](),
                (rq[xA(0xa23)] = xA(0x7cc));
              for (let u0 = 0x0; u0 < 0x4; u0++) {
                rq[xA(0x96f)](),
                  rq[xA(0x488)]((u0 / 0x4) * Math["PI"] * 0x2),
                  rq[xA(0x5df)](0x4, 0x0),
                  rq[xA(0x371)](0x0, -0x2),
                  rq[xA(0x13c)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rq[xA(0x416)]();
              }
              rq[xA(0xaaa)]();
              break;
            case cS[xA(0x664)]:
              this[xA(0x664)](rq);
              break;
            case cS[xA(0x5dd)]:
              this[xA(0x664)](rq, !![]);
              break;
            case cS[xA(0xcfe)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x32),
                (rq[xA(0xd87)] = 0x19),
                (rq[xA(0x62f)] = xA(0x7cc));
              const s5 = this[xA(0xa38)]
                ? 0.6
                : (Date[xA(0x160)]() / 0x4b0) % 6.28;
              for (let u1 = 0x0; u1 < 0xa; u1++) {
                const u2 = 0x1 - u1 / 0xa,
                  u3 =
                    u2 *
                    0x50 *
                    (0x1 +
                      (Math[xA(0xa3a)](s5 * 0x3 + u1 * 0.5 + this[xA(0xa90)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rq[xA(0x488)](s5),
                  (rq[xA(0x20a)] = this[xA(0xa9f)](lg[u1])),
                  rq[xA(0x3ce)](-u3 / 0x2, -u3 / 0x2, u3, u3);
              }
              break;
            case cS[xA(0xd79)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x12),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x19, -0xa),
                rq[xA(0xd95)](0x0, -0x2, 0x19, -0xa),
                rq[xA(0xd95)](0x1e, 0x0, 0x19, 0xa),
                rq[xA(0xd95)](0x0, 0x2, -0x19, 0xa),
                rq[xA(0xd95)](-0x1e, 0x0, -0x19, -0xa),
                rq[xA(0x925)](),
                (rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0x4),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x655))),
                rq[xA(0xaaa)](),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x2d5))),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x19, -0xa),
                rq[xA(0xd95)](0x14, 0x0, 0x19, 0xa),
                rq[xA(0x8f6)](0x28, 0xa),
                rq[xA(0x8f6)](0x28, -0xa),
                (rq[xA(0x632)] = xA(0xb20)),
                rq[xA(0x80f)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, -0xa),
                rq[xA(0xd95)](-0x5, 0x0, 0x0, 0xa),
                (rq[xA(0xd87)] = 0xa),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x9f8))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xb44)]:
              (rt = this[xA(0xd48)] / 0xc),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x488)](-Math["PI"] / 0x6),
                rq[xA(0x5df)](-0xc, 0x0),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x5, 0x0),
                rq[xA(0x8f6)](0x0, 0x0),
                (rq[xA(0xd87)] = 0x4),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xc8c))),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, 0x0),
                rq[xA(0xd95)](0xa, -0x14, 0x1e, 0x0),
                rq[xA(0xd95)](0xa, 0x14, 0x0, 0x0),
                (rq[xA(0xd87)] = 0x6),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x46d))),
                rq[xA(0xaaa)](),
                rq[xA(0x80f)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x6, 0x0),
                rq[xA(0xd95)](0xe, -0x2, 0x16, 0x0),
                (rq[xA(0xd87)] = 3.5),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x1ef)]:
              rs(xA(0x1ef), xA(0x8b8), xA(0x8bf));
              break;
            case cS[xA(0xd15)]:
              rs(xA(0xd15), xA(0x8c4), xA(0xd2a));
              break;
            case cS[xA(0x123)]:
              rs(xA(0x123), xA(0x8de), xA(0x226));
              break;
            case cS[xA(0xc3a)]:
              rs(xA(0xc3a), xA(0x8de), xA(0x226));
              break;
            case cS[xA(0x96a)]:
              rs(xA(0xc3a), xA(0x186), xA(0x2f6));
              break;
            case cS[xA(0x4dd)]:
              const s6 = this[xA(0xa38)] ? 0x3c : this[xA(0xd48)] * 0x2;
              rq[xA(0x5df)](-this[xA(0xd48)] - 0xa, 0x0),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, 0x0),
                rq[xA(0x8f6)](s6, 0x0),
                (rq[xA(0xd87)] = 0x6),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x649))),
                rq[xA(0x80f)](),
                rq[xA(0x5df)](s6, 0x0),
                rq[xA(0x721)](),
                rq[xA(0x371)](0xd, 0x0),
                rq[xA(0x8f6)](0x0, -3.5),
                rq[xA(0x8f6)](0x0, 3.5),
                rq[xA(0x925)](),
                (rq[xA(0x20a)] = rq[xA(0x632)]),
                rq[xA(0x80f)](),
                (rq[xA(0xd87)] = 0x3),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x5ee)]:
              const s7 = this[xA(0xd48)] * 0x2,
                s8 = 0xa;
              rq[xA(0x5df)](-this[xA(0xd48)], 0x0),
                (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0x9f0)] = xA(0x6de)),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, 0x0),
                rq[xA(0x8f6)](-s8 * 1.8, 0x0),
                (rq[xA(0x20a)] = xA(0xd42)),
                (rq[xA(0xd87)] = s8 * 1.4),
                rq[xA(0xaaa)](),
                (rq[xA(0x20a)] = xA(0xd2c)),
                (rq[xA(0xd87)] *= 0.7),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, 0x0),
                rq[xA(0x8f6)](-s8 * 0.45, 0x0),
                (rq[xA(0x20a)] = xA(0xd42)),
                (rq[xA(0xd87)] = s8 * 0x2 + 3.5),
                rq[xA(0xaaa)](),
                (rq[xA(0x20a)] = xA(0x81e)),
                (rq[xA(0xd87)] = s8 * 0x2),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, s8, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = xA(0x2fe)),
                rq[xA(0x80f)](),
                (rq[xA(0x20a)] = xA(0x910)),
                rq[xA(0x721)]();
              const s9 = (Date[xA(0x160)]() * 0.001) % 0x1,
                sa = s9 * s7,
                sb = s7 * 0.2;
              rq[xA(0x371)](Math[xA(0x8ab)](sa - sb, 0x0), 0x0),
                rq[xA(0x8f6)](Math[xA(0x9dc)](sa + sb, s7), 0x0);
              const sc = Math[xA(0xa3a)](s9 * Math["PI"]);
              (rq[xA(0x892)] = s8 * 0x3 * sc),
                (rq[xA(0xd87)] = s8),
                rq[xA(0xaaa)](),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x0, 0x0),
                rq[xA(0x8f6)](s7, 0x0),
                (rq[xA(0xd87)] = s8),
                (rq[xA(0x892)] = s8),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x918)]:
            case cS[xA(0x339)]:
            case cS[xA(0xcd9)]:
            case cS[xA(0xa9b)]:
            case cS[xA(0x34a)]:
            case cS[xA(0x7ec)]:
              (rt = this[xA(0xd48)] / 0x23), rq[xA(0x3ad)](rt), rq[xA(0x721)]();
              this[xA(0x344)] !== cS[xA(0x339)] &&
              this[xA(0x344)] !== cS[xA(0x34a)]
                ? rq[xA(0x9d3)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rq[xA(0x1e0)](0x0, 0x0, 0x23, 0x0, l0);
              (ru = lr[this[xA(0x344)]] || [xA(0x288), xA(0x1c9)]),
                (rq[xA(0x632)] = this[xA(0xa9f)](ru[0x0])),
                rq[xA(0x80f)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](ru[0x1])),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0xd0f)]:
              (rq[xA(0xd87)] = 0x4),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0xdc7)),
                rs(xA(0xd0f), xA(0xa6f), xA(0x8fe));
              break;
            case cS[xA(0x965)]:
              rs(xA(0x965), xA(0x8de), xA(0x226));
              break;
            case cS[xA(0x49a)]:
              (rt = this[xA(0xd48)] / 0x14), rq[xA(0x37a)](rt, rt);
              !this[xA(0xa38)] && rq[xA(0x488)]((pz / 0x64) % 6.28);
              rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rq[xA(0xd95)](0x0, 0xc, 0x14, 0x0),
                rq[xA(0x925)](),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] *= 0.7),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x8de))),
                rq[xA(0x80f)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x226))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x994)]:
              (rq[xA(0xd87)] *= 0.7),
                rs(xA(0x994), xA(0x25c), xA(0x3e0)),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x632)] = xA(0x257)),
                rq[xA(0x80f)]();
              break;
            case cS[xA(0x6b9)]:
              (rq[xA(0xd87)] *= 0.8), rs(xA(0x6b9), xA(0x6f4), xA(0x162));
              break;
            case cS[xA(0xae0)]:
              (rt = this[xA(0xd48)] / 0xa), rq[xA(0x37a)](rt, rt);
              if (!this[xA(0x54d)] || pz - this[xA(0xc0c)] > 0x14) {
                this[xA(0xc0c)] = pz;
                const u4 = new Path2D();
                for (let u5 = 0x0; u5 < 0xa; u5++) {
                  const u6 = (Math[xA(0x50e)]() * 0x2 - 0x1) * 0x7,
                    u7 = (Math[xA(0x50e)]() * 0x2 - 0x1) * 0x7;
                  u4[xA(0x371)](u6, u7), u4[xA(0x1e0)](u6, u7, 0x5, 0x0, l0);
                }
                this[xA(0x54d)] = u4;
              }
              (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x154))),
                rq[xA(0x80f)](this[xA(0x54d)]);
              break;
            case cS[xA(0x66b)]:
            case cS[xA(0x5ce)]:
              (rt = this[xA(0xd48)] / 0x1e),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x721)]();
              const sd = 0x1 / 0x3;
              for (let u8 = 0x0; u8 < 0x3; u8++) {
                const u9 = (u8 / 0x3) * Math["PI"] * 0x2;
                rq[xA(0x371)](0x0, 0x0),
                  rq[xA(0x1e0)](0x0, 0x0, 0x1e, u9, u9 + Math["PI"] / 0x3);
              }
              (rq[xA(0xa23)] = xA(0x7cc)),
                (rq[xA(0xd87)] = 0xa),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](
                  this[xA(0x344)] === cS[xA(0x66b)] ? xA(0xc64) : xA(0xc24)
                )),
                rq[xA(0x80f)](),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x91d)]:
              rr(xA(0x98b), xA(0x3d8));
              break;
            case cS[xA(0x57e)]:
              rr(xA(0x350), xA(0x2d9));
              break;
            case cS[xA(0x348)]:
            case cS[xA(0x38e)]:
              rr(xA(0x8de), xA(0x226));
              break;
            case cS[xA(0xd44)]:
              (rt = this[xA(0xd48)] / 0x14),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x488)](-Math["PI"] / 0x4);
              const se = rq[xA(0xd87)];
              (rq[xA(0xd87)] *= 1.5),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x14, -0x14 - se),
                rq[xA(0x8f6)](-0x14, 0x0),
                rq[xA(0x8f6)](0x14, 0x0),
                rq[xA(0x8f6)](0x14, 0x14 + se),
                rq[xA(0x488)](Math["PI"] / 0x2),
                rq[xA(0x371)](-0x14, -0x14 - se),
                rq[xA(0x8f6)](-0x14, 0x0),
                rq[xA(0x8f6)](0x14, 0x0),
                rq[xA(0x8f6)](0x14, 0x14 + se),
                (rq[xA(0xa23)] = rq[xA(0xa23)] = xA(0xdc7)),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x246)]:
              rr(xA(0xc71), xA(0xa17));
              break;
            case cS[xA(0x237)]:
              rr(xA(0x940), xA(0xca3));
              break;
            case cS[xA(0x63f)]:
              rr(xA(0x173), xA(0xce8));
              break;
            case cS[xA(0xc90)]:
              (rt = this[xA(0xd48)] / 0x14),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x32c))),
                rq[xA(0x80f)](),
                rq[xA(0xc04)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x649))),
                rq[xA(0xaaa)](),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x37b))),
                rq[xA(0x80f)]();
              break;
            case cS[xA(0x7ee)]:
              (rt = this[xA(0xd48)] / 0x14), rq[xA(0x37a)](rt, rt);
              const sf = (ua, ub, uc = ![]) => {
                  const xE = xA;
                  (rq[xE(0xa23)] = xE(0x7cc)),
                    (rq[xE(0x20a)] = this[xE(0xa9f)](ub)),
                    (rq[xE(0x632)] = this[xE(0xa9f)](ua)),
                    rq[xE(0x721)](),
                    rq[xE(0x1e0)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rq[xE(0xaaa)](),
                    rq[xE(0x80f)]();
                },
                sg = (ua, ub) => {
                  const xF = xA;
                  rq[xF(0x96f)](),
                    rq[xF(0xc04)](),
                    (rq[xF(0xa23)] = xF(0x7cc)),
                    (rq[xF(0x632)] = this[xF(0xa9f)](ua)),
                    (rq[xF(0x20a)] = this[xF(0xa9f)](ub)),
                    rq[xF(0x80f)](),
                    rq[xF(0xaaa)](),
                    rq[xF(0x416)]();
                };
              (rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sg(xA(0x32c), xA(0x649)),
                rq[xA(0x488)](Math["PI"]),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rq[xA(0x1e0)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rq[xA(0x1e0)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sg(xA(0x8de), xA(0x226)),
                rq[xA(0x488)](-Math["PI"]),
                rq[xA(0x721)](),
                rq[xA(0x1e0)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sg(xA(0x32c), xA(0x649));
              break;
            case cS[xA(0x7bc)]:
              this[xA(0xde7)](rq, this[xA(0xd48)]);
              break;
            case cS[xA(0xb35)]:
              (rt = this[xA(0xd48)] / 0x28),
                rq[xA(0x37a)](rt, rt),
                rq[xA(0x721)](),
                rq[xA(0x371)](-0x1e, -0x1e),
                rq[xA(0x8f6)](0x14, 0x0),
                rq[xA(0x8f6)](-0x1e, 0x1e),
                rq[xA(0x925)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x32c))),
                (rq[xA(0x632)] = this[xA(0xa9f)](xA(0x782))),
                rq[xA(0x80f)](),
                (rq[xA(0xd87)] = 0x16),
                (rq[xA(0xa23)] = rq[xA(0x62f)] = xA(0x7cc)),
                rq[xA(0xaaa)]();
              break;
            case cS[xA(0x7d1)]:
              rq[xA(0x3ad)](this[xA(0xd48)] / 0x41),
                rq[xA(0x5df)](-0xa, 0xa),
                (rq[xA(0x62f)] = rq[xA(0xa23)] = xA(0x7cc)),
                rq[xA(0x96f)](),
                rq[xA(0x721)](),
                rq[xA(0x371)](0x1e, 0x0),
                rq[xA(0x5df)](
                  0x46 -
                    (Math[xA(0xa3a)](
                      Date[xA(0x160)]() / 0x190 + 0.8 * this[xA(0xa90)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rq[xA(0x8f6)](0x0, 0x0),
                (rq[xA(0xd87)] = 0x2a),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0x394))),
                rq[xA(0xaaa)](),
                (rq[xA(0x20a)] = this[xA(0xa9f)](xA(0xdd8))),
                (rq[xA(0xd87)] -= 0xc),
                rq[xA(0xaaa)](),
                rq[xA(0x721)]();
              for (let ua = 0x0; ua < 0x2; ua++) {
                rq[xA(0x371)](0x9, 0x7),
                  rq[xA(0x8f6)](0x28, 0x14),
                  rq[xA(0x8f6)](0x7, 0x9),
                  rq[xA(0x8f6)](0x9, 0x7),
                  rq[xA(0x37a)](0x1, -0x1);
              }
              (rq[xA(0xd87)] = 0x3),
                (rq[xA(0x632)] = rq[xA(0x20a)] = xA(0x6cf)),
                rq[xA(0xaaa)](),
                rq[xA(0x80f)](),
                rq[xA(0x416)](),
                this[xA(0xb48)](rq);
              break;
            case cS[xA(0x1df)]:
              (rt = this[xA(0xd48)] / 0x14), rq[xA(0x37a)](rt, rt);
              const sh = (ub = 0x1, uc, ud) => {
                const xG = xA;
                rq[xG(0x96f)](),
                  rq[xG(0x37a)](0x1, ub),
                  rq[xG(0x721)](),
                  rq[xG(0x924)](-0x64, 0x0, 0x12c, -0x12c),
                  rq[xG(0xc04)](),
                  rq[xG(0x721)](),
                  rq[xG(0x371)](-0x14, 0x0),
                  rq[xG(0xd95)](-0x12, -0x19, 0x11, -0xf),
                  (rq[xG(0xa23)] = xG(0x7cc)),
                  (rq[xG(0xd87)] = 0x16),
                  (rq[xG(0x20a)] = this[xG(0xa9f)](ud)),
                  rq[xG(0xaaa)](),
                  (rq[xG(0xd87)] = 0xe),
                  (rq[xG(0x20a)] = this[xG(0xa9f)](uc)),
                  rq[xG(0xaaa)](),
                  rq[xG(0x416)]();
              };
              sh(0x1, xA(0xbd2), xA(0x9aa)), sh(-0x1, xA(0x792), xA(0x26e));
              break;
            default:
              rq[xA(0x721)](),
                rq[xA(0x1e0)](0x0, 0x0, this[xA(0xd48)], 0x0, Math["PI"] * 0x2),
                (rq[xA(0x632)] = xA(0x1fa)),
                rq[xA(0x80f)](),
                pt(rq, this[xA(0x853)], 0x14, xA(0x910), 0x3);
          }
          rq[xA(0x416)](), (this[xA(0x9b9)] = null);
        }
        [uf(0x84f)](rq, rr) {
          const xH = uf;
          rr = rr || pz / 0x12c + this[xH(0xa90)] * 0.3;
          const rs = Math[xH(0xa3a)](rr) * 0.5 + 0.5;
          rq[xH(0xa23)] = xH(0x7cc);
          const rt = 0x4;
          for (let ru = 0x0; ru < 0x2; ru++) {
            rq[xH(0x96f)]();
            if (ru === 0x0) rq[xH(0x721)]();
            for (let rv = 0x0; rv < 0x2; rv++) {
              for (let rw = 0x0; rw < rt; rw++) {
                rq[xH(0x96f)](), ru > 0x0 && rq[xH(0x721)]();
                const rx = -0.19 - (rw / rt) * Math["PI"] * 0.25;
                rq[xH(0x488)](rx + rs * 0.05), rq[xH(0x371)](0x0, 0x0);
                const ry = Math[xH(0xa3a)](rr + rw);
                rq[xH(0x5df)](0x1c - (ry * 0.5 + 0.5), 0x0),
                  rq[xH(0x488)](ry * 0.08),
                  rq[xH(0x8f6)](0x0, 0x0),
                  rq[xH(0xd95)](0x0, 0x7, 5.5, 0xe),
                  ru > 0x0 &&
                    ((rq[xH(0xd87)] = 6.5),
                    (rq[xH(0x20a)] =
                      xH(0x9bc) + (0x2f + (rw / rt) * 0x14) + "%)"),
                    rq[xH(0xaaa)]()),
                  rq[xH(0x416)]();
              }
              rq[xH(0x37a)](-0x1, 0x1);
            }
            ru === 0x0 &&
              ((rq[xH(0xd87)] = 0x9),
              (rq[xH(0x20a)] = xH(0x966)),
              rq[xH(0xaaa)]()),
              rq[xH(0x416)]();
          }
          rq[xH(0x721)](),
            rq[xH(0x9d3)](
              0x0,
              -0x1e + Math[xH(0xa3a)](rr * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xH(0x20a)] = xH(0x966)),
            (rq[xH(0xd87)] = 5.5),
            rq[xH(0xaaa)](),
            (rq[xH(0x892)] = 0x5 + rs * 0x8),
            (rq[xH(0x9f0)] = xH(0x4be)),
            (rq[xH(0x20a)] = rq[xH(0x9f0)]),
            (rq[xH(0xd87)] = 3.5),
            rq[xH(0xaaa)](),
            (rq[xH(0x892)] = 0x0);
        }
        [uf(0xc39)](rq) {
          const xI = uf,
            rr = this[xI(0x64f)] ? ll[xI(0x8a3)] : ll[xI(0x858)],
            rs = Date[xI(0x160)]() / 0x1f4 + this[xI(0xa90)],
            rt = Math[xI(0xa3a)](rs) - 0.5;
          rq[xI(0xa23)] = rq[xI(0x62f)] = xI(0x7cc);
          const ru = 0x46;
          rq[xI(0x96f)](), rq[xI(0x721)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xI(0x96f)]();
            const rw = rv * 0x2 - 0x1;
            rq[xI(0x37a)](0x1, rw),
              rq[xI(0x5df)](0x14, ru),
              rq[xI(0x488)](rt * 0.1),
              rq[xI(0x371)](0x0, 0x0),
              rq[xI(0x8f6)](-0xa, 0x32),
              rq[xI(0xd95)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0xd95)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0xd95)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
              rq[xI(0xd95)](
                -0xa + rt * 0xf,
                0x6e - rt * 0xa,
                -0x28,
                0x50 - rt * 0xa
              ),
              rq[xI(0xd95)](
                -0xa + rt * 0xa,
                0x3c + rt * 0x5,
                -0x3c,
                0x32 - Math[xI(0x8ab)](0x0, rt) * 0xa
              ),
              rq[xI(0xd95)](-0xa, 0x14 - rt * 0xa, -0x46, rt * 0xa),
              rq[xI(0x416)]();
          }
          (rq[xI(0x632)] = this[xI(0xa9f)](rr[xI(0xc81)])),
            rq[xI(0x80f)](),
            (rq[xI(0xd87)] = 0x12),
            (rq[xI(0x20a)] = xI(0x7eb)),
            rq[xI(0xc04)](),
            rq[xI(0xaaa)](),
            rq[xI(0x416)](),
            rq[xI(0x96f)](),
            rq[xI(0x5df)](0x50, 0x0),
            rq[xI(0x37a)](0x2, 0x2),
            rq[xI(0x721)]();
          for (let rx = 0x0; rx < 0x2; rx++) {
            rq[xI(0x37a)](0x1, -0x1),
              rq[xI(0x96f)](),
              rq[xI(0x5df)](0x0, 0xf),
              rq[xI(0x488)]((Math[xI(0xa3a)](rs * 0x2) * 0.5 + 0.5) * 0.08),
              rq[xI(0x371)](0x0, -0x4),
              rq[xI(0xd95)](0xa, 0x0, 0x14, -0x6),
              rq[xI(0xd95)](0xf, 0x3, 0x0, 0x5),
              rq[xI(0x416)]();
          }
          (rq[xI(0x632)] = rq[xI(0x20a)] = xI(0x6cf)),
            rq[xI(0x80f)](),
            (rq[xI(0xd87)] = 0x6),
            rq[xI(0xaaa)](),
            rq[xI(0x416)]();
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = ry === 0x0;
            rz && rq[xI(0x721)]();
            for (let rA = 0x4; rA >= 0x0; rA--) {
              const rB = rA / 0x5,
                rC = 0x32 - 0x2d * rB;
              !rz && rq[xI(0x721)](),
                rq[xI(0x924)](
                  -0x50 - rB * 0x50 - rC / 0x2,
                  -rC / 0x2 +
                    Math[xI(0xa3a)](rB * Math["PI"] * 0x2 + rs * 0x3) *
                      0x8 *
                      rB,
                  rC,
                  rC
                ),
                !rz &&
                  ((rq[xI(0xd87)] = 0x14),
                  (rq[xI(0x632)] = rq[xI(0x20a)] =
                    this[xI(0xa9f)](rr[xI(0x26d)][rA])),
                  rq[xI(0xaaa)](),
                  rq[xI(0x80f)]());
            }
            rz &&
              ((rq[xI(0xd87)] = 0x22),
              (rq[xI(0x20a)] = this[xI(0xa9f)](rr[xI(0xbdf)])),
              rq[xI(0xaaa)]());
          }
          rq[xI(0x721)](),
            rq[xI(0x1e0)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xI(0x632)] = this[xI(0xa9f)](rr[xI(0xde9)])),
            rq[xI(0x80f)](),
            (rq[xI(0xd87)] = 0x24),
            (rq[xI(0x20a)] = xI(0x9c0)),
            rq[xI(0x96f)](),
            rq[xI(0xc04)](),
            rq[xI(0xaaa)](),
            rq[xI(0x416)](),
            rq[xI(0x96f)]();
          for (let rD = 0x0; rD < 0x2; rD++) {
            rq[xI(0x721)]();
            for (let rE = 0x0; rE < 0x2; rE++) {
              rq[xI(0x96f)]();
              const rF = rE * 0x2 - 0x1;
              rq[xI(0x37a)](0x1, rF),
                rq[xI(0x5df)](0x14, ru),
                rq[xI(0x488)](rt * 0.1),
                rq[xI(0x371)](0x0, 0xa),
                rq[xI(0x8f6)](-0xa, 0x32),
                rq[xI(0xd95)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0xd95)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0xd95)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
                rq[xI(0x371)](0x64, 0x1e),
                rq[xI(0xd95)](0x23, 0x5a, -0x28, 0x50 - rt * 0xa),
                rq[xI(0x371)](-0xa, 0x32),
                rq[xI(0xd95)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xI(0x8ab)](0x0, rt) * 0xa
                ),
                rq[xI(0x416)]();
            }
            rD === 0x0
              ? ((rq[xI(0xd87)] = 0x10),
                (rq[xI(0x20a)] = this[xI(0xa9f)](rr[xI(0xc8f)])))
              : ((rq[xI(0xd87)] = 0xa),
                (rq[xI(0x20a)] = this[xI(0xa9f)](rr[xI(0x598)]))),
              rq[xI(0xaaa)]();
          }
          rq[xI(0x416)]();
        }
        [uf(0x119)](rq, rr, rs, rt) {
          const xJ = uf;
          rq[xJ(0x96f)]();
          const ru = this[xJ(0xd48)] / 0x28;
          rq[xJ(0x37a)](ru, ru),
            (rr = this[xJ(0xa9f)](rr)),
            (rs = this[xJ(0xa9f)](rs)),
            (rt = this[xJ(0xa9f)](rt));
          const rv = Math["PI"] / 0x5;
          rq[xJ(0xa23)] = rq[xJ(0x62f)] = xJ(0x7cc);
          const rw = Math[xJ(0xa3a)](
              Date[xJ(0x160)]() / 0x12c + this[xJ(0xa90)] * 0.2
            ),
            rx = rw * 0.3 + 0.7;
          rq[xJ(0x721)](),
            rq[xJ(0x1e0)](0x16, 0x0, 0x17, 0x0, l0),
            rq[xJ(0x371)](0x0, 0x0),
            rq[xJ(0x1e0)](-0x5, 0x0, 0x21, 0x0, l0),
            (rq[xJ(0x632)] = this[xJ(0xa9f)](xJ(0x419))),
            rq[xJ(0x80f)](),
            rq[xJ(0x96f)](),
            rq[xJ(0x5df)](0x12, 0x0);
          for (let rA = 0x0; rA < 0x2; rA++) {
            rq[xJ(0x96f)](),
              rq[xJ(0x37a)](0x1, rA * 0x2 - 0x1),
              rq[xJ(0x488)](Math["PI"] * 0.08 * rx),
              rq[xJ(0x5df)](-0x12, 0x0),
              rq[xJ(0x721)](),
              rq[xJ(0x1e0)](0x0, 0x0, 0x28, Math["PI"], -rv),
              rq[xJ(0xd95)](0x14 - rx * 0x3, -0xf, 0x14, 0x0),
              rq[xJ(0x925)](),
              (rq[xJ(0x632)] = rr),
              rq[xJ(0x80f)]();
            const rB = xJ(0x388) + rA;
            if (!this[rB]) {
              const rC = new Path2D();
              for (let rD = 0x0; rD < 0x2; rD++) {
                const rE = (Math[xJ(0x50e)]() * 0x2 - 0x1) * 0x28,
                  rF = Math[xJ(0x50e)]() * -0x28,
                  rG = Math[xJ(0x50e)]() * 0x9 + 0x8;
                rC[xJ(0x371)](rE, rF), rC[xJ(0x1e0)](rE, rF, rG, 0x0, l0);
              }
              this[rB] = rC;
            }
            rq[xJ(0xc04)](),
              (rq[xJ(0x632)] = rt),
              rq[xJ(0x80f)](this[rB]),
              rq[xJ(0x416)](),
              (rq[xJ(0xd87)] = 0x7),
              (rq[xJ(0x20a)] = rs),
              rq[xJ(0xaaa)]();
          }
          rq[xJ(0x416)](), rq[xJ(0x96f)]();
          let ry = 0x9;
          rq[xJ(0x5df)](0x2a, 0x0);
          const rz = Math["PI"] * 0x3 - rw;
          rq[xJ(0x721)]();
          for (let rH = 0x0; rH < 0x2; rH++) {
            let rI = 0x0,
              rJ = 0x8;
            rq[xJ(0x371)](rI, rJ);
            for (let rK = 0x0; rK < ry; rK++) {
              const rL = rK / ry,
                rM = rL * rz,
                rN = 0xf * (0x1 - rL),
                rO = Math[xJ(0x68a)](rM) * rN,
                rP = Math[xJ(0xa3a)](rM) * rN,
                rQ = rI + rO,
                rR = rJ + rP;
              rq[xJ(0xd95)](
                rI + rO * 0.5 + rP * 0.25,
                rJ + rP * 0.5 - rO * 0.25,
                rQ,
                rR
              ),
                (rI = rQ),
                (rJ = rR);
            }
            rq[xJ(0x37a)](0x1, -0x1);
          }
          (rq[xJ(0xa23)] = rq[xJ(0x62f)] = xJ(0x7cc)),
            (rq[xJ(0xd87)] = 0x2),
            (rq[xJ(0x20a)] = rq[xJ(0x632)]),
            rq[xJ(0xaaa)](),
            rq[xJ(0x416)](),
            rq[xJ(0x416)]();
        }
        [uf(0x4d8)](rq, rr = 0x64, rs = 0x50, rt = 0x12, ru = 0x8) {
          const xK = uf;
          rq[xK(0x721)]();
          const rv = (0x1 / rt) * Math["PI"] * 0x2;
          rq[xK(0x371)](rs, 0x0);
          for (let rw = 0x0; rw < rt; rw++) {
            const rx = rw * rv,
              ry = (rw + 0x1) * rv;
            rq[xK(0x13c)](
              Math[xK(0x68a)](rx) * rr,
              Math[xK(0xa3a)](rx) * rr,
              Math[xK(0x68a)](ry) * rr,
              Math[xK(0xa3a)](ry) * rr,
              Math[xK(0x68a)](ry) * rs,
              Math[xK(0xa3a)](ry) * rs
            );
          }
          (rq[xK(0x632)] = this[xK(0xa9f)](xK(0x1c1))),
            rq[xK(0x80f)](),
            (rq[xK(0xd87)] = ru),
            (rq[xK(0xa23)] = rq[xK(0x62f)] = xK(0x7cc)),
            (rq[xK(0x20a)] = this[xK(0xa9f)](xK(0x248))),
            rq[xK(0xaaa)]();
        }
        [uf(0xa9f)](rq) {
          const xL = uf,
            rr = 0x1 - this[xL(0x928)];
          if (
            rr >= 0x1 &&
            this[xL(0x1eb)] === 0x0 &&
            !this[xL(0x84d)] &&
            !this[xL(0x806)]
          )
            return rq;
          rq = hA(rq);
          this[xL(0x84d)] &&
            (rq = hy(
              rq,
              [0xff, 0xff, 0xff],
              0.85 + Math[xL(0xa3a)](pz / 0x32) * 0.15
            ));
          this[xL(0x1eb)] > 0x0 &&
            (rq = hy(rq, [0x8f, 0x5d, 0xb0], 0x1 - this[xL(0x1eb)] * 0.75));
          rq = hy(rq, [0xff, 0x0, 0x0], rr * 0.25 + 0.75);
          if (this[xL(0x806)]) {
            if (!this[xL(0x9b9)]) {
              let rs = pz / 0x4;
              if (!isNaN(this["id"])) rs += this["id"];
              this[xL(0x9b9)] = lH(rs % 0x168, 0x64, 0x32);
            }
            rq = hy(rq, this[xL(0x9b9)], 0.75);
          }
          return pL(rq);
        }
        [uf(0x6cc)](rq) {
          const xM = uf;
          this[xM(0x9b9)] = null;
          if (this[xM(0x3dc)]) {
            const rr = Math[xM(0xa3a)]((this[xM(0x2e4)] * Math["PI"]) / 0x2);
            if (!this[xM(0xc3e)]) {
              const rs = 0x1 + rr * 0x1;
              rq[xM(0x37a)](rs, rs);
            }
            rq[xM(0xac6)] *= 0x1 - rr;
          }
        }
        [uf(0x14a)](rq, rr = !![], rs = 0x1) {
          const xN = uf;
          rq[xN(0x721)](),
            (rs = 0x8 * rs),
            rq[xN(0x371)](0x23, -rs),
            rq[xN(0xd95)](0x33, -0x2 - rs, 0x3c, -0xc - rs),
            rq[xN(0x8f6)](0x23, -rs),
            rq[xN(0x371)](0x23, rs),
            rq[xN(0xd95)](0x33, 0x2 + rs, 0x3c, 0xc + rs),
            rq[xN(0x8f6)](0x23, rs);
          const rt = xN(0x32c);
          (rq[xN(0x632)] = rq[xN(0x20a)] =
            rr ? this[xN(0xa9f)](rt) : xN(0x32c)),
            rq[xN(0x80f)](),
            (rq[xN(0xa23)] = rq[xN(0x62f)] = xN(0x7cc)),
            (rq[xN(0xd87)] = 0x4),
            rq[xN(0xaaa)]();
        }
        [uf(0xde7)](rq, rr, rs = 0x1) {
          const xO = uf,
            rt = (rr / 0x1e) * 1.1;
          rq[xO(0x37a)](rt, rt),
            rq[xO(0x721)](),
            rq[xO(0x371)](-0x1e, -0x11),
            rq[xO(0x8f6)](0x1e, 0x0),
            rq[xO(0x8f6)](-0x1e, 0x11),
            rq[xO(0x925)](),
            (rq[xO(0x632)] = rq[xO(0x20a)] = this[xO(0xa9f)](xO(0x32c))),
            rq[xO(0x80f)](),
            (rq[xO(0xd87)] = 0x14 * rs),
            (rq[xO(0xa23)] = rq[xO(0x62f)] = xO(0x7cc)),
            rq[xO(0xaaa)]();
        }
        [uf(0xb1b)](rq, rr = 0x0, rs = 0x0, rt = 0x1, ru = 0x5) {
          const xP = uf;
          rq[xP(0x96f)](),
            rq[xP(0x5df)](rr, rs),
            rq[xP(0x37a)](rt, rt),
            rq[xP(0x721)](),
            rq[xP(0x371)](0x23, -0x8),
            rq[xP(0xd95)](0x34, -5.5, 0x3c, -0x14),
            rq[xP(0x371)](0x23, 0x8),
            rq[xP(0xd95)](0x34, 5.5, 0x3c, 0x14),
            (rq[xP(0x632)] = rq[xP(0x20a)] = this[xP(0xa9f)](xP(0x32c))),
            (rq[xP(0xa23)] = rq[xP(0x62f)] = xP(0x7cc)),
            (rq[xP(0xd87)] = ru),
            rq[xP(0xaaa)](),
            rq[xP(0x721)]();
          const rv = Math["PI"] * 0.165;
          rq[xP(0x9d3)](0x3c, -0x14, 0x7, 0x9, rv, 0x0, l0),
            rq[xP(0x9d3)](0x3c, 0x14, 0x7, 0x9, -rv, 0x0, l0),
            rq[xP(0x80f)](),
            rq[xP(0x416)]();
        }
      },
      lH = (rq, rr, rs) => {
        const xQ = uf;
        (rr /= 0x64), (rs /= 0x64);
        const rt = (rw) => (rw + rq / 0x1e) % 0xc,
          ru = rr * Math[xQ(0x9dc)](rs, 0x1 - rs),
          rv = (rw) =>
            rs -
            ru *
              Math[xQ(0x8ab)](
                -0x1,
                Math[xQ(0x9dc)](
                  rt(rw) - 0x3,
                  Math[xQ(0x9dc)](0x9 - rt(rw), 0x1)
                )
              );
        return [0xff * rv(0x0), 0xff * rv(0x8), 0xff * rv(0x4)];
      };
    function lI(rq) {
      const xR = uf;
      return -(Math[xR(0x68a)](Math["PI"] * rq) - 0x1) / 0x2;
    }
    function lJ(rq, rr, rs = 0x6, rt = uf(0x910)) {
      const xS = uf,
        ru = rr / 0x64;
      rq[xS(0x37a)](ru, ru), rq[xS(0x721)]();
      for (let rv = 0x0; rv < 0xc; rv++) {
        rq[xS(0x371)](0x0, 0x0);
        const rw = (rv / 0xc) * Math["PI"] * 0x2;
        rq[xS(0x8f6)](Math[xS(0x68a)](rw) * 0x64, Math[xS(0xa3a)](rw) * 0x64);
      }
      (rq[xS(0xd87)] = rs),
        (rq[xS(0x632)] = rq[xS(0x20a)] = rt),
        (rq[xS(0xa23)] = rq[xS(0x62f)] = xS(0x7cc));
      for (let rx = 0x0; rx < 0x5; rx++) {
        const ry = (rx / 0x5) * 0x64 + 0xa;
        lb(rq, 0xc, ry, 0.5, 0.85);
      }
      rq[xS(0xaaa)]();
    }
    var lK = class {
        constructor(rq, rr, rs, rt, ru) {
          const xT = uf;
          (this[xT(0x344)] = rq),
            (this["id"] = rr),
            (this["x"] = rs),
            (this["y"] = rt),
            (this[xT(0xd48)] = ru),
            (this[xT(0xcaa)] = Math[xT(0x50e)]() * l0),
            (this[xT(0x238)] = -0x1),
            (this[xT(0x3dc)] = ![]),
            (this[xT(0x8a9)] = 0x0),
            (this[xT(0x2e4)] = 0x0),
            (this[xT(0xd4d)] = !![]),
            (this[xT(0x935)] = 0x0),
            (this[xT(0x558)] = !![]);
        }
        [uf(0x364)]() {
          const xU = uf;
          if (this[xU(0x8a9)] < 0x1) {
            this[xU(0x8a9)] += pA / 0xc8;
            if (this[xU(0x8a9)] > 0x1) this[xU(0x8a9)] = 0x1;
          }
          this[xU(0x3dc)] && (this[xU(0x2e4)] += pA / 0xc8);
        }
        [uf(0x536)](rq) {
          const xV = uf;
          rq[xV(0x96f)](), rq[xV(0x5df)](this["x"], this["y"]);
          if (this[xV(0x344)] === cS[xV(0x584)]) {
            rq[xV(0x488)](this[xV(0xcaa)]);
            const rr = this[xV(0xd48)],
              rs = pq(
                rq,
                xV(0xd22) + this[xV(0xd48)],
                rr * 2.2,
                rr * 2.2,
                (ru) => {
                  const xW = xV;
                  ru[xW(0x5df)](rr * 1.1, rr * 1.1), lJ(ru, rr);
                },
                !![]
              ),
              rt = this[xV(0x8a9)] + this[xV(0x2e4)] * 0.5;
            (rq[xV(0xac6)] = (0x1 - this[xV(0x2e4)]) * 0.3),
              rq[xV(0x37a)](rt, rt),
              rq[xV(0x277)](
                rs,
                -rs[xV(0x841)] / 0x2,
                -rs[xV(0x2f0)] / 0x2,
                rs[xV(0x841)],
                rs[xV(0x2f0)]
              );
          } else {
            if (this[xV(0x344)] === cS[xV(0x6e5)]) {
              let ru = this[xV(0x8a9)] + this[xV(0x2e4)] * 0.5;
              (rq[xV(0xac6)] = 0x1 - this[xV(0x2e4)]), (rq[xV(0xac6)] *= 0.9);
              const rv =
                0.93 +
                0.07 *
                  (Math[xV(0xa3a)](
                    Date[xV(0x160)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              ru *= rv;
              const rw = this[xV(0xd48)],
                rx = pq(
                  rq,
                  xV(0x249) + this[xV(0xd48)],
                  rw * 2.2,
                  rw * 2.2,
                  (ry) => {
                    const xX = xV;
                    ry[xX(0x5df)](rw * 1.1, rw * 1.1);
                    const rz = rw / 0x64;
                    ry[xX(0x37a)](rz, rz),
                      lE(ry, 0x5c),
                      (ry[xX(0x62f)] = ry[xX(0xa23)] = xX(0x7cc)),
                      (ry[xX(0xd87)] = 0x28),
                      (ry[xX(0x20a)] = xX(0x3b2)),
                      ry[xX(0xaaa)](),
                      (ry[xX(0x632)] = xX(0xbf3)),
                      (ry[xX(0x20a)] = xX(0x4b1)),
                      (ry[xX(0xd87)] = 0xe),
                      ry[xX(0x80f)](),
                      ry[xX(0xaaa)]();
                  },
                  !![]
                );
              rq[xV(0x37a)](ru, ru),
                rq[xV(0x277)](
                  rx,
                  -rx[xV(0x841)] / 0x2,
                  -rx[xV(0x2f0)] / 0x2,
                  rx[xV(0x841)],
                  rx[xV(0x2f0)]
                );
            } else {
              if (this[xV(0x344)] === cS[xV(0x5a3)]) {
                rq[xV(0x3ad)](this[xV(0xd48)] / 0x32),
                  (rq[xV(0x62f)] = xV(0x7cc)),
                  rq[xV(0x96f)](),
                  (this[xV(0x935)] +=
                    ((this[xV(0x238)] >= 0x0 ? 0x1 : -0x1) * pA) / 0x12c),
                  (this[xV(0x935)] = Math[xV(0x9dc)](
                    0x1,
                    Math[xV(0x8ab)](0x0, this[xV(0x935)])
                  ));
                if (this[xV(0x935)] > 0x0) {
                  rq[xV(0x3ad)](this[xV(0x935)]),
                    (rq[xV(0xac6)] *= this[xV(0x935)]),
                    (rq[xV(0xd87)] = 0.1),
                    (rq[xV(0x20a)] = rq[xV(0x632)] = xV(0xd4b)),
                    (rq[xV(0x974)] = xV(0x25f)),
                    (rq[xV(0xb4e)] = xV(0x6c5) + iA);
                  const rz = xV(0xb29) + (this[xV(0x238)] + 0x1);
                  lR(
                    rq,
                    rz,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rz[xV(0x28c)] * 0.09),
                    !![]
                  );
                }
                rq[xV(0x416)]();
                const ry = this[xV(0xa38)]
                  ? 0.6
                  : ((this["id"] + Date[xV(0x160)]()) / 0x4b0) % 6.28;
                rq[xV(0x96f)]();
                for (let rA = 0x0; rA < 0x8; rA++) {
                  const rB = 0x1 - rA / 0x8,
                    rC = rB * 0x50;
                  rq[xV(0x488)](ry),
                    (rq[xV(0x20a)] = xV(0x32f)),
                    rq[xV(0x721)](),
                    rq[xV(0x924)](-rC / 0x2, -rC / 0x2, rC, rC),
                    rq[xV(0x925)](),
                    (rq[xV(0xd87)] = 0x28),
                    rq[xV(0xaaa)](),
                    (rq[xV(0xd87)] = 0x14),
                    rq[xV(0xaaa)]();
                }
                rq[xV(0x416)]();
                if (!this[xV(0x575)]) {
                  this[xV(0x575)] = [];
                  for (let rD = 0x0; rD < 0x1e; rD++) {
                    this[xV(0x575)][xV(0x462)]({
                      x: Math[xV(0x50e)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rE = 0x0; rE < this[xV(0x575)][xV(0x28c)]; rE++) {
                  const rF = this[xV(0x575)][rE];
                  (rF["x"] += rF["v"]),
                    rF["x"] > 0x1 &&
                      ((rF["x"] %= 0x1),
                      (rF[xV(0xcaa)] = Math[xV(0x50e)]() * 6.28),
                      (rF["v"] = Math[xV(0x50e)]() * 0.005 + 0.008),
                      (rF["s"] = Math[xV(0x50e)]() * 0.025 + 0.008)),
                    rq[xV(0x96f)](),
                    (rq[xV(0xac6)] =
                      rF["x"] < 0.2
                        ? rF["x"] / 0.2
                        : rF["x"] > 0.8
                        ? 0x1 - (rF["x"] - 0.8) / 0.2
                        : 0x1),
                    rq[xV(0x37a)](0x5a, 0x5a),
                    rq[xV(0x488)](rF[xV(0xcaa)]),
                    rq[xV(0x5df)](rF["x"], 0x0),
                    rq[xV(0x721)](),
                    rq[xV(0x1e0)](0x0, 0x0, rF["s"], 0x0, Math["PI"] * 0x2),
                    (rq[xV(0x632)] = xV(0xd4b)),
                    rq[xV(0x80f)](),
                    rq[xV(0x416)]();
                }
              }
            }
          }
          rq[xV(0x416)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rq, rr, rs, rt) {
          const xY = uf;
          super(cS[xY(0x4fd)], rq, rr, rs, 0x46),
            (this[xY(0xcaa)] = (Math[xY(0x50e)]() * 0x2 - 0x1) * 0.2),
            (this[xY(0xb1a)] = dC[rt]);
        }
        [uf(0x364)]() {
          const xZ = uf;
          if (this[xZ(0x8a9)] < 0x2 || pz - lL < 0x9c4) {
            this[xZ(0x8a9)] += pA / 0x12c;
            return;
          }
          this[xZ(0x3dc)] && (this[xZ(0x2e4)] += pA / 0xc8),
            this[xZ(0xdef)] &&
              ((this["x"] = pg(this["x"], this[xZ(0xdef)]["x"], 0xc8)),
              (this["y"] = pg(this["y"], this[xZ(0xdef)]["y"], 0xc8)));
        }
        [uf(0x536)](rq) {
          const y0 = uf;
          if (this[y0(0x8a9)] === 0x0) return;
          rq[y0(0x96f)](), rq[y0(0x5df)](this["x"], this["y"]);
          const rr = y0(0x72e) + this[y0(0xb1a)]["id"];
          let rs =
            (this[y0(0x6ef)] || lM < 0x3) &&
            pq(
              rq,
              rr,
              0x78,
              0x78,
              (rv) => {
                const y1 = y0;
                (this[y1(0x6ef)] = !![]),
                  lM++,
                  rv[y1(0x5df)](0x3c, 0x3c),
                  (rv[y1(0xa23)] = rv[y1(0x62f)] = y1(0x7cc)),
                  rv[y1(0x721)](),
                  rv[y1(0x924)](-0x32, -0x32, 0x64, 0x64),
                  (rv[y1(0xd87)] = 0x12),
                  (rv[y1(0x20a)] = y1(0x544)),
                  rv[y1(0xaaa)](),
                  (rv[y1(0xd87)] = 0x8),
                  (rv[y1(0x632)] = hQ[this[y1(0xb1a)][y1(0x24f)]]),
                  rv[y1(0x80f)](),
                  (rv[y1(0x20a)] = hR[this[y1(0xb1a)][y1(0x24f)]]),
                  rv[y1(0xaaa)]();
                const rw = pt(
                  rv,
                  this[y1(0xb1a)][y1(0x789)],
                  0x12,
                  y1(0x910),
                  0x3,
                  !![]
                );
                rv[y1(0x277)](
                  rw,
                  -rw[y1(0x841)] / 0x2,
                  0x32 - 0xd / 0x2 - rw[y1(0x2f0)],
                  rw[y1(0x841)],
                  rw[y1(0x2f0)]
                ),
                  rv[y1(0x96f)](),
                  rv[y1(0x5df)](
                    0x0 + this[y1(0xb1a)][y1(0x6db)],
                    -0x5 + this[y1(0xb1a)][y1(0x2d2)]
                  ),
                  this[y1(0xb1a)][y1(0x30b)](rv),
                  rv[y1(0x416)]();
              },
              !![]
            );
          if (!rs) rs = pp[rr];
          rq[y0(0x488)](this[y0(0xcaa)]);
          const rt = Math[y0(0x9dc)](this[y0(0x8a9)], 0x1),
            ru =
              (this[y0(0xd48)] / 0x64) *
              (0x1 +
                Math[y0(0xa3a)](Date[y0(0x160)]() / 0xfa + this["id"]) * 0.05) *
              rt *
              (0x1 - this[y0(0x2e4)]);
          rq[y0(0x37a)](ru, ru),
            rq[y0(0x488)](Math["PI"] * lI(0x1 - rt)),
            rs
              ? rq[y0(0x277)](
                  rs,
                  -rs[y0(0x841)] / 0x2,
                  -rs[y0(0x2f0)] / 0x2,
                  rs[y0(0x841)],
                  rs[y0(0x2f0)]
                )
              : (rq[y0(0x721)](),
                rq[y0(0x924)](-0x3c, -0x3c, 0x78, 0x78),
                (rq[y0(0x632)] = hQ[this[y0(0xb1a)][y0(0x24f)]]),
                rq[y0(0x80f)]()),
            rq[y0(0x416)]();
        }
      };
    function lO(rq) {
      const y2 = uf;
      rq[y2(0x721)](),
        rq[y2(0x371)](0x0, 4.5),
        rq[y2(0xd95)](3.75, 0x0, 0x0, -4.5),
        rq[y2(0xd95)](-3.75, 0x0, 0x0, 4.5),
        rq[y2(0x925)](),
        (rq[y2(0xa23)] = rq[y2(0x62f)] = y2(0x7cc)),
        (rq[y2(0x632)] = rq[y2(0x20a)] = y2(0x6cf)),
        (rq[y2(0xd87)] = 0x1),
        rq[y2(0xaaa)](),
        rq[y2(0x80f)](),
        rq[y2(0xc04)](),
        rq[y2(0x721)](),
        rq[y2(0x1e0)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rq[y2(0x632)] = y2(0x2fe)),
        rq[y2(0x80f)]();
    }
    function lP(rq, rr = ![]) {
      const y3 = uf;
      lQ(rq, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rq, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rr) {
        const rs = Math["PI"] / 0x7;
        rq[y3(0x721)](),
          rq[y3(0x1e0)](0x0, 0x0, 23.5, Math["PI"] + rs, Math["PI"] * 0x2 - rs),
          (rq[y3(0x20a)] = y3(0x3fd)),
          (rq[y3(0xd87)] = 0x4),
          (rq[y3(0xa23)] = y3(0x7cc)),
          rq[y3(0xaaa)]();
      }
    }
    function lQ(rq, rr, rs) {
      const y4 = uf;
      rq[y4(0x96f)](),
        rq[y4(0x488)](rr),
        rq[y4(0x5df)](0x0, -23.6),
        rq[y4(0x488)](rs),
        rq[y4(0x721)](),
        rq[y4(0x371)](-6.5, 0x1),
        rq[y4(0x8f6)](0x0, -0xf),
        rq[y4(0x8f6)](6.5, 0x1),
        (rq[y4(0x632)] = y4(0xcac)),
        (rq[y4(0xd87)] = 3.5),
        rq[y4(0x80f)](),
        (rq[y4(0x62f)] = y4(0x7cc)),
        (rq[y4(0x20a)] = y4(0x3fd)),
        rq[y4(0xaaa)](),
        rq[y4(0x416)]();
    }
    function lR(rq, rr, rs, rt, ru, rv, rw = ![]) {
      const y5 = uf;
      var rx = rr[y5(0x28c)],
        ry;
      rq[y5(0x96f)](),
        rq[y5(0x5df)](rs, rt),
        rq[y5(0x488)]((0x1 * rv) / 0x2),
        rq[y5(0x488)]((0x1 * (rv / rx)) / 0x2),
        (rq[y5(0x78d)] = y5(0x525));
      for (var rz = 0x0; rz < rx; rz++) {
        rq[y5(0x488)](-rv / rx),
          rq[y5(0x96f)](),
          rq[y5(0x5df)](0x0, ru),
          (ry = rr[rz]),
          rw && rq[y5(0x5d1)](ry, 0x0, 0x0),
          rq[y5(0x437)](ry, 0x0, 0x0),
          rq[y5(0x416)]();
      }
      rq[y5(0x416)]();
    }
    function lS(rq, rr = 0x1) {
      const y6 = uf,
        rs = 0xf;
      rq[y6(0x721)]();
      const rt = 0x6;
      for (let ry = 0x0; ry < rt; ry++) {
        const rz = (ry / rt) * Math["PI"] * 0x2;
        rq[y6(0x8f6)](Math[y6(0x68a)](rz) * rs, Math[y6(0xa3a)](rz) * rs);
      }
      rq[y6(0x925)](),
        (rq[y6(0xd87)] = 0x4),
        (rq[y6(0x20a)] = y6(0x2d8)),
        rq[y6(0xaaa)](),
        (rq[y6(0x632)] = y6(0x760)),
        rq[y6(0x80f)]();
      const ru = (Math["PI"] * 0x2) / rt,
        rv = Math[y6(0x68a)](ru) * rs,
        rw = Math[y6(0xa3a)](ru) * rs;
      for (let rA = 0x0; rA < rt; rA++) {
        rq[y6(0x721)](),
          rq[y6(0x371)](0x0, 0x0),
          rq[y6(0x8f6)](rs, 0x0),
          rq[y6(0x8f6)](rv, rw),
          rq[y6(0x925)](),
          (rq[y6(0x632)] =
            y6(0x767) + (0.2 + (((rA + 0x4) % rt) / rt) * 0.35) + ")"),
          rq[y6(0x80f)](),
          rq[y6(0x488)](ru);
      }
      rq[y6(0x721)]();
      const rx = rs * 0.65;
      for (let rB = 0x0; rB < rt; rB++) {
        const rC = (rB / rt) * Math["PI"] * 0x2;
        rq[y6(0x8f6)](Math[y6(0x68a)](rC) * rx, Math[y6(0xa3a)](rC) * rx);
      }
      (rq[y6(0x892)] = 0x23 + rr * 0xf),
        (rq[y6(0x9f0)] = rq[y6(0x632)] = y6(0xcd7)),
        rq[y6(0x80f)](),
        rq[y6(0x80f)](),
        rq[y6(0x80f)]();
    }
    var lT = class extends lG {
        constructor(rq, rr, rs, rt, ru, rv, rw) {
          const y7 = uf;
          super(rq, cS[y7(0xa98)], rr, rs, rt, rw, ru),
            (this[y7(0x33b)] = rv),
            (this[y7(0xba7)] = 0x0),
            (this[y7(0xd6c)] = 0x0),
            (this[y7(0xbcf)] = 0x0),
            (this[y7(0x45c)] = 0x0),
            (this[y7(0x739)] = ""),
            (this[y7(0x263)] = 0x0),
            (this[y7(0x567)] = !![]),
            (this[y7(0x320)] = ![]),
            (this[y7(0x673)] = ![]),
            (this[y7(0xbec)] = ![]),
            (this[y7(0x1a6)] = ![]),
            (this[y7(0x5f1)] = ![]),
            (this[y7(0x3ae)] = !![]),
            (this[y7(0xa6c)] = 0x0),
            (this[y7(0x93b)] = 0x0);
        }
        [uf(0x364)]() {
          const y8 = uf;
          super[y8(0x364)]();
          if (this[y8(0x3dc)]) (this[y8(0xd6c)] = 0x1), (this[y8(0xba7)] = 0x0);
          else {
            const rq = pA / 0xc8;
            let rr = this[y8(0x33b)];
            if (this[y8(0x320)] && rr === cY[y8(0x220)]) rr = cY[y8(0xc72)];
            (this[y8(0xba7)] = Math[y8(0x9dc)](
              0x1,
              Math[y8(0x8ab)](
                0x0,
                this[y8(0xba7)] + (rr === cY[y8(0xc52)] ? rq : -rq)
              )
            )),
              (this[y8(0xd6c)] = Math[y8(0x9dc)](
                0x1,
                Math[y8(0x8ab)](
                  0x0,
                  this[y8(0xd6c)] + (rr === cY[y8(0xc72)] ? rq : -rq)
                )
              )),
              (this[y8(0xa6c)] = pg(this[y8(0xa6c)], this[y8(0x93b)], 0x64));
          }
        }
        [uf(0x536)](rq) {
          const y9 = uf;
          rq[y9(0x96f)](), rq[y9(0x5df)](this["x"], this["y"]);
          let rr = this[y9(0xd48)] / kZ;
          this[y9(0x3dc)] &&
            rq[y9(0x488)]((this[y9(0x2e4)] * Math["PI"]) / 0x4);
          rq[y9(0x37a)](rr, rr), this[y9(0x6cc)](rq);
          this[y9(0xcfb)] &&
            (rq[y9(0x96f)](),
            rq[y9(0x488)](this[y9(0xcaa)]),
            rq[y9(0x3ad)](this[y9(0xd48)] / 0x28 / rr),
            this[y9(0xa4b)](rq),
            rq[y9(0x416)]());
          this[y9(0x65c)] &&
            (rq[y9(0x96f)](),
            rq[y9(0x3ad)](kZ / 0x12),
            this[y9(0x84f)](rq, pz / 0x12c),
            rq[y9(0x416)]());
          const rs = y9(0x3fd);
          if (this[y9(0x3e6)]) {
            const rC = Date[y9(0x160)](),
              rD = (Math[y9(0xa3a)](rC / 0x12c) * 0.5 + 0.5) * 0x2;
            rq[y9(0x721)](),
              rq[y9(0x371)](0x5, -0x22),
              rq[y9(0x13c)](0x2f, -0x19, 0x14, 0x5, 0x2b - rD, 0x19),
              rq[y9(0xd95)](0x0, 0x28 + rD * 0.6, -0x2b + rD, 0x19),
              rq[y9(0x13c)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rq[y9(0xd95)](0x0, -0x23, 0x5, -0x22),
              (rq[y9(0x632)] = rs),
              rq[y9(0x80f)]();
          }
          this[y9(0x5f1)] && lP(rq);
          const rt = this[y9(0x1a6)]
            ? [y9(0x419), y9(0x32c)]
            : this[y9(0xcef)]
            ? [y9(0xa95), y9(0x197)]
            : [y9(0x98b), y9(0x3d8)];
          (rt[0x0] = this[y9(0xa9f)](rt[0x0])),
            (rt[0x1] = this[y9(0xa9f)](rt[0x1]));
          let ru = 2.75;
          !this[y9(0xcef)] && (ru /= rr);
          (rq[y9(0x632)] = rt[0x0]),
            (rq[y9(0xd87)] = ru),
            (rq[y9(0x20a)] = rt[0x1]);
          this[y9(0xcef)] &&
            (rq[y9(0x721)](),
            rq[y9(0x371)](0x0, 0x0),
            rq[y9(0xd95)](-0x1e, 0xf, -0x1e, 0x1e),
            rq[y9(0xd95)](0x0, 0x37, 0x1e, 0x1e),
            rq[y9(0xd95)](0x1e, 0xf, 0x0, 0x0),
            rq[y9(0x80f)](),
            rq[y9(0xaaa)](),
            rq[y9(0x96f)](),
            (rq[y9(0x632)] = rq[y9(0x20a)]),
            (rq[y9(0x974)] = y9(0x25f)),
            (rq[y9(0xb4e)] = y9(0xad7) + iA),
            lR(rq, y9(0xa44), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rq[y9(0x416)]());
          rq[y9(0x721)]();
          this[y9(0x1be)]
            ? !this[y9(0x3e6)]
              ? rq[y9(0x924)](-0x19, -0x19, 0x32, 0x32)
              : (rq[y9(0x371)](0x19, 0x19),
                rq[y9(0x8f6)](-0x19, 0x19),
                rq[y9(0x8f6)](-0x19, -0xa),
                rq[y9(0x8f6)](-0xa, -0x19),
                rq[y9(0x8f6)](0xa, -0x19),
                rq[y9(0x8f6)](0x19, -0xa),
                rq[y9(0x925)]())
            : rq[y9(0x1e0)](0x0, 0x0, kZ, 0x0, l0);
          rq[y9(0x80f)](), rq[y9(0xaaa)]();
          this[y9(0x2bf)] &&
            (rq[y9(0x96f)](),
            rq[y9(0xc04)](),
            rq[y9(0x721)](),
            !this[y9(0x3e6)] &&
              (rq[y9(0x371)](-0x8, -0x1e),
              rq[y9(0x8f6)](0xf, -0x7),
              rq[y9(0x8f6)](0x1e, -0x14),
              rq[y9(0x8f6)](0x1e, -0x32)),
            rq[y9(0x5df)](
              0x0,
              0x2 * (0x1 - (this[y9(0xd6c)] + this[y9(0xba7)]))
            ),
            rq[y9(0x371)](-0x2, 0x0),
            rq[y9(0x8f6)](-0x3, 4.5),
            rq[y9(0x8f6)](0x3, 4.5),
            rq[y9(0x8f6)](0x2, 0x0),
            (rq[y9(0x632)] = y9(0x6cf)),
            rq[y9(0x80f)](),
            rq[y9(0x416)]());
          this[y9(0x3e6)] &&
            (rq[y9(0x721)](),
            rq[y9(0x371)](0x0, -0x17),
            rq[y9(0xd95)](0x4, -0xd, 0x1b, -0x8),
            rq[y9(0x8f6)](0x14, -0x1c),
            rq[y9(0x8f6)](-0x14, -0x1c),
            rq[y9(0x8f6)](-0x1b, -0x8),
            rq[y9(0xd95)](-0x4, -0xd, 0x0, -0x17),
            (rq[y9(0x632)] = rs),
            rq[y9(0x80f)]());
          if (this[y9(0x534)]) {
            (rq[y9(0x20a)] = y9(0x74d)),
              (rq[y9(0xd87)] = 1.4),
              rq[y9(0x721)](),
              (rq[y9(0xa23)] = y9(0x7cc));
            const rE = 4.5;
            for (let rF = 0x0; rF < 0x2; rF++) {
              const rG = -0x12 + rF * 0x1d;
              for (let rH = 0x0; rH < 0x3; rH++) {
                const rI = rG + rH * 0x3;
                rq[y9(0x371)](rI, rE + -1.5), rq[y9(0x8f6)](rI + 1.6, rE + 1.6);
              }
            }
            rq[y9(0xaaa)]();
          }
          if (this[y9(0xc4b)]) {
            rq[y9(0x721)](),
              rq[y9(0x1e0)](0x0, 2.5, 3.3, 0x0, l0),
              (rq[y9(0x632)] = y9(0xaed)),
              rq[y9(0x80f)](),
              rq[y9(0x721)](),
              rq[y9(0x1e0)](0xd, 2.8, 5.5, 0x0, l0),
              rq[y9(0x1e0)](-0xd, 2.8, 5.5, 0x0, l0),
              (rq[y9(0x632)] = y9(0x862)),
              rq[y9(0x80f)](),
              rq[y9(0x96f)](),
              rq[y9(0x488)](-Math["PI"] / 0x4),
              rq[y9(0x721)]();
            const rJ = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[y9(0x1be)] &&
              rJ[y9(0x96e)]((rK) => {
                (rK[0x0] *= 1.1), (rK[0x1] *= 1.1);
              });
            for (let rK = 0x0; rK < 0x2; rK++) {
              for (let rL = 0x0; rL < rJ[y9(0x28c)]; rL++) {
                const rM = rJ[rL];
                rq[y9(0x371)](rM[0x0], rM[0x1]), rq[y9(0x1e0)](...rM, 0x0, l0);
              }
              rq[y9(0x488)](-Math["PI"] / 0x2);
            }
            (rq[y9(0x632)] = y9(0x975)), rq[y9(0x80f)](), rq[y9(0x416)]();
          }
          const rv = this[y9(0xba7)],
            rw = this[y9(0xd6c)],
            rx = 0x6 * rv,
            ry = 0x4 * rw;
          function rz(rN, rO) {
            const ya = y9;
            rq[ya(0x721)]();
            const rP = 3.25;
            rq[ya(0x371)](rN - rP, rO - rP),
              rq[ya(0x8f6)](rN + rP, rO + rP),
              rq[ya(0x371)](rN + rP, rO - rP),
              rq[ya(0x8f6)](rN - rP, rO + rP),
              (rq[ya(0xd87)] = 0x2),
              (rq[ya(0xa23)] = ya(0x7cc)),
              (rq[ya(0x20a)] = ya(0x6cf)),
              rq[ya(0xaaa)](),
              rq[ya(0x925)]();
          }
          function rA(rN, rO) {
            const yb = y9;
            rq[yb(0x96f)](),
              rq[yb(0x5df)](rN, rO),
              rq[yb(0x721)](),
              rq[yb(0x371)](-0x4, 0x0),
              rq[yb(0xd95)](0x0, 0x6, 0x4, 0x0),
              (rq[yb(0xd87)] = 0x2),
              (rq[yb(0xa23)] = yb(0x7cc)),
              (rq[yb(0x20a)] = yb(0x6cf)),
              rq[yb(0xaaa)](),
              rq[yb(0x416)]();
          }
          if (this[y9(0x3dc)]) rz(0x7, -0x5), rz(-0x7, -0x5);
          else {
            if (this[y9(0x8a5)]) rA(0x7, -0x5), rA(-0x7, -0x5);
            else {
              let rN = function (rP, rQ, rR, rS, rT = 0x0) {
                  const yc = y9,
                    rU = rT ^ 0x1;
                  rq[yc(0x371)](rP - rR, rQ - rS + rT * rx + rU * ry),
                    rq[yc(0x8f6)](rP + rR, rQ - rS + rU * rx + rT * ry),
                    rq[yc(0x8f6)](rP + rR, rQ + rS),
                    rq[yc(0x8f6)](rP - rR, rQ + rS),
                    rq[yc(0x8f6)](rP - rR, rQ - rS);
                },
                rO = function (rP = 0x0) {
                  const yd = y9;
                  rq[yd(0x721)](),
                    rq[yd(0x9d3)](0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    rq[yd(0x371)](-0x7, -0x5),
                    rq[yd(0x9d3)](-0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    (rq[yd(0x20a)] = rq[yd(0x632)] = yd(0x6cf)),
                    rq[yd(0x80f)]();
                };
              rq[y9(0x96f)](),
                rq[y9(0x721)](),
                rN(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                rN(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rq[y9(0xc04)](),
                rO(0.7),
                rO(0x0),
                rq[y9(0xc04)](),
                rq[y9(0x721)](),
                rq[y9(0x1e0)](
                  0x7 + this[y9(0xbcf)] * 0x2,
                  -0x5 + this[y9(0x45c)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rq[y9(0x371)](-0x7, -0x5),
                rq[y9(0x1e0)](
                  -0x7 + this[y9(0xbcf)] * 0x2,
                  -0x5 + this[y9(0x45c)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rq[y9(0x632)] = y9(0x2fe)),
                rq[y9(0x80f)](),
                rq[y9(0x416)]();
            }
          }
          if (this[y9(0xbec)]) {
            rq[y9(0x96f)](), rq[y9(0x5df)](0x0, -0xc);
            if (this[y9(0x3dc)]) rq[y9(0x37a)](0.7, 0.7), rz(0x0, -0x3);
            else
              this[y9(0x8a5)]
                ? (rq[y9(0x37a)](0.7, 0.7), rA(0x0, -0x3))
                : lO(rq);
            rq[y9(0x416)]();
          }
          this[y9(0x673)] &&
            (rq[y9(0x96f)](),
            rq[y9(0x5df)](0x0, 0xa),
            rq[y9(0x488)](-Math["PI"] / 0x2),
            rq[y9(0x37a)](0.82, 0.82),
            this[y9(0x14a)](rq, ![], 0.85),
            rq[y9(0x416)]());
          const rB = rv * (-0x5 - 5.5) + rw * (-0x5 - 0x4);
          rq[y9(0x96f)](),
            rq[y9(0x721)](),
            rq[y9(0x5df)](0x0, 9.5),
            rq[y9(0x371)](-5.6, 0x0),
            rq[y9(0xd95)](0x0, 0x5 + rB, 5.6, 0x0),
            (rq[y9(0xa23)] = y9(0x7cc));
          this[y9(0xc4b)]
            ? ((rq[y9(0xd87)] = 0x7),
              (rq[y9(0x20a)] = y9(0xaed)),
              rq[y9(0xaaa)](),
              (rq[y9(0x20a)] = y9(0x34d)))
            : (rq[y9(0x20a)] = y9(0x6cf));
          (rq[y9(0xd87)] = 1.75), rq[y9(0xaaa)](), rq[y9(0x416)]();
          if (this[y9(0xd6f)]) {
            const rP = this[y9(0xba7)],
              rQ = 0x28,
              rR = Date[y9(0x160)]() / 0x12c,
              rS = this[y9(0xcef)] ? 0x0 : Math[y9(0xa3a)](rR) * 0.5 + 0.5,
              rT = rS * 0x4,
              rU = 0x28 - rS * 0x4,
              rV = rU - (this[y9(0xcef)] ? 0x1 : jf(rP)) * 0x50,
              rW = this[y9(0x2bf)];
            (rq[y9(0xd87)] = 0x9 + ru * 0x2),
              (rq[y9(0x62f)] = y9(0x7cc)),
              (rq[y9(0xa23)] = y9(0x7cc));
            for (let rX = 0x0; rX < 0x2; rX++) {
              rq[y9(0x721)](), rq[y9(0x96f)]();
              for (let rY = 0x0; rY < 0x2; rY++) {
                rq[y9(0x371)](0x19, 0x0);
                let rZ = rV;
                rW && rY === 0x0 && (rZ = rU),
                  rq[y9(0xd95)](0x2d + rT, rZ * 0.5, 0xb, rZ),
                  rq[y9(0x37a)](-0x1, 0x1);
              }
              rq[y9(0x416)](),
                (rq[y9(0x20a)] = rt[0x1 - rX]),
                rq[y9(0xaaa)](),
                (rq[y9(0xd87)] = 0x9);
            }
            rq[y9(0x96f)](),
              rq[y9(0x5df)](0x0, rV),
              lS(rq, rS),
              rq[y9(0x416)]();
          }
          rq[y9(0x416)]();
        }
        [uf(0x4f8)](rq, rr) {}
        [uf(0xd11)](rq, rr = 0x1) {
          const ye = uf,
            rs = n4[this["id"]];
          if (!rs) return;
          for (let rt = 0x0; rt < rs[ye(0x28c)]; rt++) {
            const ru = rs[rt];
            if (ru["t"] > lV + lW) continue;
            !ru["x"] &&
              ((ru["x"] = this["x"]),
              (ru["y"] = this["y"] - this[ye(0xd48)] - 0x44),
              (ru[ye(0x698)] = this["x"]),
              (ru[ye(0x1d3)] = this["y"]));
            const rv = ru["t"] > lV ? 0x1 - (ru["t"] - lV) / lW : 0x1,
              rw = rv * rv * rv;
            (ru["x"] += (this["x"] - ru[ye(0x698)]) * rw),
              (ru["y"] += (this["y"] - ru[ye(0x1d3)]) * rw),
              (ru[ye(0x698)] = this["x"]),
              (ru[ye(0x1d3)] = this["y"]);
            const rx = Math[ye(0x9dc)](0x1, ru["t"] / 0x64);
            rq[ye(0x96f)](),
              (rq[ye(0xac6)] = (rv < 0.7 ? rv / 0.7 : 0x1) * rx * 0.9),
              rq[ye(0x5df)](ru["x"], ru["y"] - (ru["t"] / lV) * 0x14),
              rq[ye(0x3ad)](rr);
            const ry = pt(rq, ru[ye(0x54f)], 0x10, ye(0x20d), 0x0, !![], ![]);
            rq[ye(0x3ad)](rx), rq[ye(0x721)]();
            const rz = ry[ye(0x841)] + 0xa,
              rA = ry[ye(0x2f0)] + 0xf;
            rq[ye(0xa8b)]
              ? rq[ye(0xa8b)](-rz / 0x2, -rA / 0x2, rz, rA, 0x5)
              : rq[ye(0x924)](-rz / 0x2, -rA / 0x2, rz, rA),
              (rq[ye(0x632)] = ru[ye(0xd4a)]),
              rq[ye(0x80f)](),
              (rq[ye(0x20a)] = ye(0x20d)),
              (rq[ye(0xd87)] = 1.5),
              rq[ye(0xaaa)](),
              rq[ye(0x277)](
                ry,
                -ry[ye(0x841)] / 0x2,
                -ry[ye(0x2f0)] / 0x2,
                ry[ye(0x841)],
                ry[ye(0x2f0)]
              ),
              rq[ye(0x416)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rq, rr, rs = 0x1) {
      const yf = uf;
      if (rq[yf(0x3dc)]) return;
      rr[yf(0x96f)](),
        rr[yf(0x5df)](rq["x"], rq["y"]),
        lZ(rq, rr),
        rr[yf(0x5df)](0x0, -rq[yf(0xd48)] - 0x19),
        rr[yf(0x96f)](),
        rr[yf(0x3ad)](rs),
        rq[yf(0x5ef)] &&
          (pt(rr, "@" + rq[yf(0x5ef)], 0xb, yf(0xaa0), 0x3),
          rr[yf(0x5df)](0x0, -0x10)),
        rq[yf(0x739)] &&
          (pt(rr, rq[yf(0x739)], 0x12, yf(0x910), 0x3),
          rr[yf(0x5df)](0x0, -0x5)),
        rr[yf(0x416)](),
        !rq[yf(0x3ae)] &&
          rq[yf(0x359)] > 0.001 &&
          ((rr[yf(0xac6)] = rq[yf(0x359)]),
          rr[yf(0x37a)](rq[yf(0x359)] * 0x3, rq[yf(0x359)] * 0x3),
          rr[yf(0x721)](),
          rr[yf(0x1e0)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x632)] = yf(0x6cf)),
          rr[yf(0x80f)](),
          nm(rr, 0.8),
          rr[yf(0x721)](),
          rr[yf(0x1e0)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x632)] = yf(0xdf4)),
          rr[yf(0x80f)](),
          rr[yf(0x721)](),
          rr[yf(0x371)](0x0, 0x0),
          rr[yf(0x1e0)](0x0, 0x0, 0x10, 0x0, l0 * rq[yf(0x1a3)]),
          rr[yf(0x8f6)](0x0, 0x0),
          rr[yf(0xc04)](),
          nm(rr, 0.8)),
        rr[yf(0x416)]();
    }
    function lZ(rq, rr, rs = ![]) {
      const yg = uf;
      if (rq[yg(0x7f9)] <= 0x0) return;
      rr[yg(0x96f)](),
        (rr[yg(0xac6)] = rq[yg(0x7f9)]),
        (rr[yg(0x20a)] = yg(0x3fd)),
        rr[yg(0x721)]();
      const rt = rs ? 0x8c : rq[yg(0x3ae)] ? 0x4b : 0x64,
        ru = rs ? 0x1a : 0x9;
      if (rs) rr[yg(0x5df)](rq[yg(0xd48)] + 0x11, 0x0);
      else {
        const rw = Math[yg(0x8ab)](0x1, rq[yg(0xd48)] / 0x64);
        rr[yg(0x37a)](rw, rw),
          rr[yg(0x5df)](-rt / 0x2, rq[yg(0xd48)] / rw + 0x1b);
      }
      rr[yg(0x721)](),
        rr[yg(0x371)](rs ? -0x14 : 0x0, 0x0),
        rr[yg(0x8f6)](rt, 0x0),
        (rr[yg(0xa23)] = yg(0x7cc)),
        (rr[yg(0xd87)] = ru),
        (rr[yg(0x20a)] = yg(0x3fd)),
        rr[yg(0xaaa)]();
      function rv(rx) {
        const yh = yg;
        rr[yh(0xac6)] = rx < 0.05 ? rx / 0.05 : 0x1;
      }
      rq[yg(0x5f5)] > 0x0 &&
        (rv(rq[yg(0x5f5)]),
        rr[yg(0x721)](),
        rr[yg(0x371)](0x0, 0x0),
        rr[yg(0x8f6)](rq[yg(0x5f5)] * rt, 0x0),
        (rr[yg(0xd87)] = ru * (rs ? 0.55 : 0.44)),
        (rr[yg(0x20a)] = yg(0x5f7)),
        rr[yg(0xaaa)]());
      rq[yg(0x81b)] > 0x0 &&
        (rv(rq[yg(0x81b)]),
        rr[yg(0x721)](),
        rr[yg(0x371)](0x0, 0x0),
        rr[yg(0x8f6)](rq[yg(0x81b)] * rt, 0x0),
        (rr[yg(0xd87)] = ru * (rs ? 0.7 : 0.66)),
        (rr[yg(0x20a)] = yg(0x85c)),
        rr[yg(0xaaa)]());
      rq[yg(0xa6c)] &&
        (rv(rq[yg(0xa6c)]),
        rr[yg(0x721)](),
        rr[yg(0x371)](0x0, 0x0),
        rr[yg(0x8f6)](rq[yg(0xa6c)] * rt, 0x0),
        (rr[yg(0xd87)] = ru * (rs ? 0.45 : 0.35)),
        (rr[yg(0x20a)] = yg(0x8de)),
        rr[yg(0xaaa)]());
      if (rq[yg(0x3ae)]) {
        rr[yg(0xac6)] = 0x1;
        const rx = pt(
          rr,
          yg(0x286) + (rq[yg(0x263)] + 0x1),
          rs ? 0xc : 0xe,
          yg(0x910),
          0x3,
          !![]
        );
        rr[yg(0x277)](
          rx,
          rt + ru / 0x2 - rx[yg(0x841)],
          ru / 0x2,
          rx[yg(0x841)],
          rx[yg(0x2f0)]
        );
        if (rs) {
          const ry = pt(rr, "@" + rq[yg(0x5ef)], 0xc, yg(0xaa0), 0x3, !![]);
          rr[yg(0x277)](
            ry,
            -ru / 0x2,
            -ru / 0x2 - ry[yg(0x2f0)],
            ry[yg(0x841)],
            ry[yg(0x2f0)]
          );
        }
      } else {
        rr[yg(0xac6)] = 0x1;
        const rz = kc[rq[yg(0x344)]],
          rA = pt(rr, rz, 0xe, yg(0x910), 0x3, !![], rq[yg(0x6b8)]);
        rr[yg(0x96f)](), rr[yg(0x5df)](0x0, -ru / 0x2 - rA[yg(0x2f0)]);
        rA[yg(0x841)] > rt + ru
          ? rr[yg(0x277)](
              rA,
              rt / 0x2 - rA[yg(0x841)] / 0x2,
              0x0,
              rA[yg(0x841)],
              rA[yg(0x2f0)]
            )
          : rr[yg(0x277)](rA, -ru / 0x2, 0x0, rA[yg(0x841)], rA[yg(0x2f0)]);
        rr[yg(0x416)]();
        const rB = pt(rr, rq[yg(0x6b8)], 0xe, hP[rq[yg(0x6b8)]], 0x3, !![]);
        rr[yg(0x277)](
          rB,
          rt + ru / 0x2 - rB[yg(0x841)],
          ru / 0x2,
          rB[yg(0x841)],
          rB[yg(0x2f0)]
        );
        var genCanvas = pt; // xxx 为一个7个参数的方法，参考上方drawImage第一个参数
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
        rq[yg(0x739)] &&
        ((rr[yg(0xac6)] = 0x1),
        rr[yg(0x5df)](rt / 0x2, 0x0),
        pt(rr, rq[yg(0x739)], 0x11, yg(0x910), 0x3)),
        rr[yg(0x416)]();
    }
    function m0(rq) {
      const yi = uf;
      for (let rr in op) {
        op[rr][yi(0x6df)](rq);
      }
      oI();
    }
    var m1 = {},
      m2 = document[uf(0xbda)](uf(0x481));
    mr(uf(0xce0), uf(0x396), uf(0xad6)),
      mr(uf(0x9ad), uf(0x481), uf(0xa10)),
      mr(uf(0x63e), uf(0x984), uf(0x504), () => {
        const yj = uf;
        (hv = ![]), (hD[yj(0x504)] = fc);
      }),
      mr(uf(0x213), uf(0x3cc), uf(0x17c)),
      mr(uf(0x2c7), uf(0xbb3), uf(0x7a5)),
      mr(uf(0x6e6), uf(0xbcd), uf(0xd68)),
      mr(uf(0xa58), uf(0xdb6), uf(0x4b4)),
      mr(uf(0x76d), uf(0x6ad), uf(0x7ca)),
      mr(uf(0x357), uf(0xcdf), uf(0x3c6)),
      mr(uf(0x67e), uf(0xce7), "lb"),
      mr(uf(0xc75), uf(0x507), uf(0x905)),
      mr(uf(0x134), uf(0xa1b), uf(0x40c), () => {
        const yk = uf;
        (m4[yk(0xdd7)][yk(0xd71)] = yk(0x18e)), (hD[yk(0x40c)] = m3);
      }),
      mr(uf(0x2c4), uf(0x9d8), uf(0xb9b), () => {
        const yl = uf;
        if (!hW) return;
        il(new Uint8Array([cI[yl(0xafe)]]));
      });
    var m3 = 0xb,
      m4 = document[uf(0xbda)](uf(0x141));
    hD[uf(0x40c)] == m3 && (m4[uf(0xdd7)][uf(0xd71)] = uf(0x18e));
    var m5 = document[uf(0xbda)](uf(0x4b0));
    m5[uf(0xdd7)][uf(0xd71)] = uf(0x18e);
    var m6 = document[uf(0xbda)](uf(0x352)),
      m7 = document[uf(0xbda)](uf(0xa1d)),
      m8 = document[uf(0xbda)](uf(0x533));
    m8[uf(0x4a5)] = function () {
      const ym = uf;
      m5[ym(0xdd7)][ym(0xd71)] = ym(0x18e);
    };
    var m9 = ![];
    m7[uf(0x4a5)] = ng(function (rq) {
      const yn = uf;
      if (!hW || m9 || jy) return;
      const rr = m6[yn(0x6f1)][yn(0x55e)]();
      if (!rr || !eV(rr)) {
        m6[yn(0x3d4)][yn(0x86e)](yn(0xbb6)),
          void m6[yn(0x11e)],
          m6[yn(0x3d4)][yn(0xa29)](yn(0xbb6));
        return;
      }
      (m5[yn(0xdd7)][yn(0xd71)] = ""),
        (m5[yn(0x729)] = yn(0x51c)),
        il(
          new Uint8Array([cI[yn(0x689)], ...new TextEncoder()[yn(0x1d1)](rr)])
        ),
        (m9 = !![]);
    });
    function ma(rq, rr) {
      const yo = uf;
      if (rq === yo(0xc03)) {
        const rs = {};
        (rs[yo(0xdca)] = yo(0x509)),
          (rs[yo(0x1d7)] = yo(0xa82)),
          (rs[yo(0xd47)] = yo(0xa82)),
          (rr = new Date(
            rr === 0x0 ? Date[yo(0x160)]() : rr * 0x3e8 * 0x3c * 0x3c
          )[yo(0x5ab)]("en", rs));
      } else
        rq === yo(0x35f) || rq === yo(0x3af)
          ? (rr = ka(rr * 0x3e8 * 0x3c, !![]))
          : (rr = k9(rr));
      return rr;
    }
    var mb = f2(),
      mc = {},
      md = document[uf(0xbda)](uf(0xbe8));
    md[uf(0x729)] = "";
    for (let rq in mb) {
      const rr = me(rq);
      rr[uf(0x12d)](0x0), md[uf(0x771)](rr), (mc[rq] = rr);
    }
    function me(rs) {
      const yp = uf,
        rt = nA(yp(0xba3) + kd(rs) + yp(0x151)),
        ru = rt[yp(0xbda)](yp(0x303));
      return (
        (rt[yp(0x12d)] = function (rv) {
          k8(ru, ma(rs, rv));
        }),
        rt
      );
    }
    var mf;
    function mg(rs, rt, ru, rv, rw, rx, ry) {
      const yq = uf;
      mf && (mf[yq(0x878)](), (mf = null));
      const rz = rx[yq(0x28c)] / 0x2,
        rA = yq(0xc0d)[yq(0x68e)](rz),
        rB = nA(
          yq(0x4e9) +
            rs +
            yq(0x82e) +
            rA +
            yq(0x1bd) +
            rA +
            yq(0xae3) +
            yq(0xc0e)[yq(0x68e)](eL * dH) +
            yq(0xace) +
            (ru[yq(0x28c)] === 0x0 ? yq(0xa75) : "") +
            yq(0x222)
        );
      ry && rB[yq(0x771)](nA(yq(0x7ce)));
      mf = rB;
      const rC = rB[yq(0xbda)](yq(0xca7)),
        rD = rB[yq(0xbda)](yq(0xbf4));
      for (let rP = 0x0; rP < rx[yq(0x28c)]; rP++) {
        const rQ = rx[rP];
        if (!rQ) continue;
        const rR = nZ(rQ);
        rR[yq(0x3d4)][yq(0x86e)](yq(0x417)),
          (rR[yq(0x921)] = !![]),
          rR[yq(0x7e2)][yq(0x86e)](),
          (rR[yq(0x7e2)] = null),
          rP < rz
            ? rC[yq(0x600)][rP][yq(0x771)](rR)
            : rD[yq(0x600)][rP - rz][yq(0x771)](rR);
      }
      (rB[yq(0x878)] = function () {
        const yr = yq;
        (rB[yr(0xdd7)][yr(0x8aa)] = yr(0x9c9)),
          (rB[yr(0xdd7)][yr(0xd71)] = yr(0x18e)),
          void rB[yr(0x11e)],
          (rB[yr(0xdd7)][yr(0xd71)] = ""),
          setTimeout(function () {
            const ys = yr;
            rB[ys(0x86e)]();
          }, 0x3e8);
      }),
        (rB[yq(0xbda)](yq(0x5c4))[yq(0x4a5)] = function () {
          const yt = yq;
          rB[yt(0x878)]();
        });
      const rE = d4(rw),
        rF = rE[0x0],
        rG = rE[0x1],
        rH = d2(rF + 0x1),
        rI = rw - rG,
        rJ = rB[yq(0xbda)](yq(0x276));
      k8(
        rJ,
        yq(0x2b8) + (rF + 0x1) + yq(0x9ef) + iJ(rI) + "/" + iJ(rH) + yq(0x1de)
      );
      const rK = Math[yq(0x9dc)](0x1, rI / rH),
        rL = rB[yq(0xbda)](yq(0xda3));
      rL[yq(0xdd7)][yq(0x662)] = rK * 0x64 + "%";
      const rM = rB[yq(0xbda)](yq(0xbe8));
      for (let rS in mb) {
        const rT = me(rS);
        rT[yq(0x12d)](rt[rS]), rM[yq(0x771)](rT);
      }
      const rN = rB[yq(0xbda)](yq(0x74e));
      ru[yq(0x582)]((rU, rV) => nY(rU[0x0], rV[0x0]));
      for (let rU = 0x0; rU < ru[yq(0x28c)]; rU++) {
        const [rV, rW] = ru[rU],
          rX = nZ(rV);
        jY(rX),
          rX[yq(0x3d4)][yq(0x86e)](yq(0x417)),
          (rX[yq(0x921)] = !![]),
          oP(rX[yq(0x7e2)], rW),
          rN[yq(0x771)](rX);
      }
      if (ru[yq(0x28c)] > 0x0) {
        const rY = nA(yq(0x74c)),
          rZ = {};
        for (let s0 = 0x0; s0 < ru[yq(0x28c)]; s0++) {
          const [s1, s2] = ru[s0];
          rZ[s1[yq(0x24f)]] = (rZ[s1[yq(0x24f)]] || 0x0) + s2;
        }
        oo(rY, rZ), rB[yq(0xbda)](yq(0xbcd))[yq(0x771)](rY);
      }
      const rO = rB[yq(0xbda)](yq(0x559));
      for (let s3 = 0x0; s3 < rv[yq(0x28c)]; s3++) {
        const s4 = rv[s3],
          s5 = nF(s4, !![]);
        s5[yq(0x3d4)][yq(0x86e)](yq(0x417)), (s5[yq(0x921)] = !![]);
        const s6 = rO[yq(0x600)][s4[yq(0x959)] * dH + s4[yq(0x24f)]];
        rO[yq(0xc50)](s5, s6), s6[yq(0x86e)]();
      }
      rB[yq(0x3d4)][yq(0xa29)](yq(0x7ff)),
        setTimeout(function () {
          const yu = yq;
          rB[yu(0x3d4)][yu(0x86e)](yu(0x7ff));
        }, 0x0),
        kl[yq(0x771)](rB);
    }
    var mh = document[uf(0xbda)](uf(0xaa3));
    document[uf(0xbda)](uf(0x41c))[uf(0x4a5)] = ng(function (rs) {
      const yv = uf,
        rt = mh[yv(0x6f1)][yv(0x55e)]();
      nf(rt);
    });
    function mi(rs) {
      const yw = uf,
        rt = new Uint8Array([
          cI[yw(0x418)],
          ...new TextEncoder()[yw(0x1d1)](rs),
        ]);
      il(rt);
    }
    var mj = document[uf(0xbda)](uf(0x6ad)),
      mk = document[uf(0xbda)](uf(0xce7)),
      ml = mk[uf(0xbda)](uf(0xdfd)),
      mm = 0x0,
      mn = 0x0;
    setInterval(function () {
      const yx = uf;
      hW &&
        (pz - mn > 0x7530 &&
          mj[yx(0x3d4)][yx(0x755)](yx(0x230)) &&
          (il(new Uint8Array([cI[yx(0xee)]])), (mn = pz)),
        pz - mm > 0xea60 &&
          mk[yx(0x3d4)][yx(0x755)](yx(0x230)) &&
          (il(new Uint8Array([cI[yx(0xa87)]])), (mm = pz)));
    }, 0x3e8);
    var mo = ![];
    function mp(rs) {
      const yy = uf;
      for (let rt in m1) {
        if (rs === rt) continue;
        m1[rt][yy(0x878)]();
      }
      mo = ![];
    }
    window[uf(0x4a5)] = function (rs) {
      const yz = uf;
      if ([kk, kn, ki][yz(0x9ae)](rs[yz(0xdef)])) mp();
    };
    function mq() {
      const yA = uf;
      iy && !oV[yA(0x6ab)] && im(0x0, 0x0);
    }
    function mr(rs, rt, ru, rv) {
      const yB = uf,
        rw = document[yB(0xbda)](rt),
        rx = rw[yB(0xbda)](yB(0xdfd)),
        ry = document[yB(0xbda)](rs);
      let rz = null,
        rA = rw[yB(0xbda)](yB(0x1f5));
      rA &&
        (rA[yB(0x4a5)] = function () {
          const yC = yB;
          rw[yC(0x3d4)][yC(0x466)](yC(0xbe9));
        });
      (rx[yB(0xdd7)][yB(0xd71)] = yB(0x18e)),
        rw[yB(0x3d4)][yB(0x86e)](yB(0x230)),
        (ry[yB(0x4a5)] = function () {
          const yD = yB;
          rB[yD(0x466)]();
        }),
        (rw[yB(0xbda)](yB(0x5c4))[yB(0x4a5)] = function () {
          mp();
        });
      const rB = [ry, rw];
      (rB[yB(0x878)] = function () {
        const yE = yB;
        ry[yE(0x3d4)][yE(0x86e)](yE(0xd77)),
          rw[yE(0x3d4)][yE(0x86e)](yE(0x230)),
          !rz &&
            (rz = setTimeout(function () {
              const yF = yE;
              (rx[yF(0xdd7)][yF(0xd71)] = yF(0x18e)), (rz = null);
            }, 0x3e8));
      }),
        (rB[yB(0x466)] = function () {
          const yG = yB;
          mp(ru),
            rw[yG(0x3d4)][yG(0x755)](yG(0x230))
              ? rB[yG(0x878)]()
              : rB[yG(0x230)]();
        }),
        (rB[yB(0x230)] = function () {
          const yH = yB;
          rv && rv(),
            clearTimeout(rz),
            (rz = null),
            (rx[yH(0xdd7)][yH(0xd71)] = ""),
            ry[yH(0x3d4)][yH(0xa29)](yH(0xd77)),
            rw[yH(0x3d4)][yH(0xa29)](yH(0x230)),
            (mo = !![]),
            mq();
        }),
        (m1[ru] = rB);
    }
    var ms = [],
      mt,
      mu = 0x0,
      mv = ![],
      mw = document[uf(0xbda)](uf(0x6e6)),
      mz = {
        tagName: uf(0x796),
        getBoundingClientRect() {
          const yI = uf,
            rs = mw[yI(0x832)](),
            rt = {};
          return (
            (rt["x"] = rs["x"] + rs[yI(0x662)] / 0x2),
            (rt["y"] = rs["y"] + rs[yI(0x645)] / 0x2),
            rt
          );
        },
        appendChild(rs) {
          const yJ = uf;
          rs[yJ(0x86e)]();
        },
      };
    function mA(rs) {
      const yK = uf;
      if (!hW) return;
      const rt = rs[yK(0xdef)];
      if (rt[yK(0x233)]) mt = mU(rt, rs);
      else {
        if (rt[yK(0x9f7)]) {
          mp();
          const ru = rt[yK(0x2de)]();
          (ru[yK(0xb1a)] = rt[yK(0xb1a)]),
            nz(ru, rt[yK(0xb1a)]),
            (ru[yK(0x84c)] = 0x1),
            (ru[yK(0x9f7)] = !![]),
            (ru[yK(0x3e7)] = mz),
            ru[yK(0x3d4)][yK(0xa29)](yK(0x7bf));
          const rv = rt[yK(0x832)]();
          (ru[yK(0xdd7)][yK(0x59b)] = rv["x"] / kR + "px"),
            (ru[yK(0xdd7)][yK(0x525)] = rv["y"] / kR + "px"),
            kH[yK(0x771)](ru),
            (mt = mU(ru, rs)),
            (mu = 0x0),
            (mo = !![]);
        } else return ![];
      }
      return (mu = Date[yK(0x160)]()), (mv = !![]), !![];
    }
    function mB(rs) {
      const yL = uf;
      for (let rt = 0x0; rt < rs[yL(0x600)][yL(0x28c)]; rt++) {
        const ru = rs[yL(0x600)][rt];
        if (ru[yL(0x3d4)][yL(0x755)](yL(0xb1a)) && !mT(ru)) return ru;
      }
    }
    function mC() {
      const yM = uf;
      if (mt) {
        if (mv && Date[yM(0x160)]() - mu < 0x1f4) {
          if (mt[yM(0x233)]) {
            const rs = mt[yM(0xdd5)][yM(0x8cd)];
            mt[yM(0xdf2)](
              rs >= iN ? nk[yM(0x600)][rs - iN + 0x1] : nl[yM(0x600)][rs]
            );
          } else {
            if (mt[yM(0x9f7)]) {
              let rt = mB(nk) || mB(nl);
              rt && mt[yM(0xdf2)](rt);
            }
          }
        }
        mt[yM(0x499)]();
        if (mt[yM(0x9f7)]) {
          (mt[yM(0x9f7)] = ![]),
            (mt[yM(0x233)] = !![]),
            m1[yM(0xd68)][yM(0x230)]();
          if (mt[yM(0x3e7)] !== mz) {
            const ru = mt[yM(0x5e4)];
            ru
              ? ((mt[yM(0x224)] = ru[yM(0x224)]), mQ(ru[yM(0xb1a)]["id"], 0x1))
              : (mt[yM(0x224)] = iR[yM(0xbb0)]());
            (iQ[mt[yM(0x224)]] = mt), mQ(mt[yM(0xb1a)]["id"], -0x1);
            const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rv[yM(0x549)](0x0, cI[yM(0x324)]),
              rv[yM(0x616)](0x1, mt[yM(0xb1a)]["id"]),
              rv[yM(0x549)](0x3, mt[yM(0x3e7)][yM(0x8cd)]),
              il(rv);
          }
        } else
          mt[yM(0x3e7)] === mz
            ? (iR[yM(0x462)](mt[yM(0x224)]),
              mQ(mt[yM(0xb1a)]["id"], 0x1),
              il(new Uint8Array([cI[yM(0x8b4)], mt[yM(0xdd5)][yM(0x8cd)]])))
            : mS(mt[yM(0xdd5)][yM(0x8cd)], mt[yM(0x3e7)][yM(0x8cd)]);
        mt = null;
      }
    }
    function mD(rs) {
      const yN = uf;
      mt && (mt[yN(0x61c)](rs), (mv = ![]));
    }
    var mE = document[uf(0xbda)](uf(0x52b));
    function mF() {
      const yO = uf;
      mE[yO(0xdd7)][yO(0xd71)] = yO(0x18e);
      const rs = mE[yO(0xbda)](yO(0x49d));
      let rt,
        ru,
        rv = null;
      (mE[yO(0x815)] = function (rx) {
        const yP = yO;
        rv === null &&
          ((rs[yP(0xdd7)][yP(0x662)] = rs[yP(0xdd7)][yP(0x81c)] = "0"),
          (mE[yP(0xdd7)][yP(0xd71)] = ""),
          ([rt, ru] = mG(rx)),
          rw(),
          (rv = rx[yP(0x2f7)]));
      }),
        (mE[yO(0x757)] = function (rx) {
          const yQ = yO;
          if (rx[yQ(0x2f7)] === rv) {
            const [ry, rz] = mG(rx),
              rA = ry - rt,
              rB = rz - ru,
              rC = mE[yQ(0x832)]();
            let rD = Math[yQ(0x5b5)](rA, rB);
            const rE = rC[yQ(0x662)] / 0x2 / kR;
            rD > rE && (rD = rE);
            const rF = Math[yQ(0x22b)](rB, rA);
            return (
              (rs[yQ(0xdd7)][yQ(0x81c)] = yQ(0x4c7) + rF + yQ(0xc8d)),
              (rs[yQ(0xdd7)][yQ(0x662)] = rD + "px"),
              im(rF, rD / rE),
              !![]
            );
          }
        }),
        (mE[yO(0x7d5)] = function (rx) {
          const yR = yO;
          rx[yR(0x2f7)] === rv &&
            ((mE[yR(0xdd7)][yR(0xd71)] = yR(0x18e)), (rv = null), im(0x0, 0x0));
        });
      function rw() {
        const yS = yO;
        (mE[yS(0xdd7)][yS(0x59b)] = rt + "px"),
          (mE[yS(0xdd7)][yS(0x525)] = ru + "px");
      }
    }
    mF();
    function mG(rs) {
      const yT = uf;
      return [rs[yT(0xd5a)] / kR, rs[yT(0x400)] / kR];
    }
    var mH = document[uf(0xbda)](uf(0xa77)),
      mI = document[uf(0xbda)](uf(0x447)),
      mJ = document[uf(0xbda)](uf(0x434)),
      mK = {},
      mL = {};
    if (kL) {
      document[uf(0xde9)][uf(0x3d4)][uf(0xa29)](uf(0x49c)),
        (window[uf(0x65a)] = function (rt) {
          const yU = uf;
          for (let ru = 0x0; ru < rt[yU(0x8cf)][yU(0x28c)]; ru++) {
            const rv = rt[yU(0x8cf)][ru],
              rw = rv[yU(0xdef)];
            if (rw === ki) {
              mE[yU(0x815)](rv);
              continue;
            } else {
              if (rw === mI)
                pa(yU(0x338), !![]),
                  (mK[rv[yU(0x2f7)]] = function () {
                    const yV = yU;
                    pa(yV(0x338), ![]);
                  });
              else {
                if (rw === mH)
                  pa(yU(0x778), !![]),
                    (mK[rv[yU(0x2f7)]] = function () {
                      const yW = yU;
                      pa(yW(0x778), ![]);
                    });
                else
                  rw === mJ &&
                    (pa(yU(0xdd2), !![]),
                    (mK[rv[yU(0x2f7)]] = function () {
                      const yX = yU;
                      pa(yX(0xdd2), ![]);
                    }));
              }
            }
            if (mt) continue;
            if (rw[yU(0xb1a)]) {
              const rx = mO(rw);
              mA(rv),
                mt && (mL[rv[yU(0x2f7)]] = mD),
                (mK[rv[yU(0x2f7)]] = function () {
                  const yY = yU;
                  mt && mC(), (rx[yY(0x169)] = ![]);
                });
            }
          }
        });
      const rs = {};
      (rs[uf(0x3d5)] = ![]),
        document[uf(0x392)](
          uf(0xc85),
          function (rt) {
            const yZ = uf;
            for (let ru = 0x0; ru < rt[yZ(0x8cf)][yZ(0x28c)]; ru++) {
              const rv = rt[yZ(0x8cf)][ru];
              mE[yZ(0x757)](rv) && rt[yZ(0xaa4)]();
              if (mL[rv[yZ(0x2f7)]]) mL[rv[yZ(0x2f7)]](rv), rt[yZ(0xaa4)]();
              else mt && rt[yZ(0xaa4)]();
            }
          },
          rs
        ),
        (window[uf(0x5b9)] = function (rt) {
          const z0 = uf;
          for (let ru = 0x0; ru < rt[z0(0x8cf)][z0(0x28c)]; ru++) {
            const rv = rt[z0(0x8cf)][ru];
            mE[z0(0x7d5)](rv),
              mK[rv[z0(0x2f7)]] &&
                (mK[rv[z0(0x2f7)]](),
                delete mK[rv[z0(0x2f7)]],
                delete mL[rv[z0(0x2f7)]]);
          }
        });
    } else {
      document[uf(0xde9)][uf(0x3d4)][uf(0xa29)](uf(0x652));
      let rt = ![];
      (window[uf(0x9e5)] = function (ru) {
        const z1 = uf;
        ru[z1(0x2dc)] === 0x0 && ((rt = !![]), mA(ru));
      }),
        (document[uf(0x99f)] = function (ru) {
          const z2 = uf;
          mD(ru);
          const rv = ru[z2(0xdef)];
          if (rv[z2(0xb1a)] && !rt) {
            const rw = mO(rv);
            rv[z2(0x6c6)] = rv[z2(0x9e5)] = function () {
              const z3 = z2;
              rw[z3(0x169)] = ![];
            };
          }
        }),
        (document[uf(0x31f)] = function (ru) {
          const z4 = uf;
          ru[z4(0x2dc)] === 0x0 && ((rt = ![]), mC());
        }),
        (km[uf(0x99f)] = ki[uf(0x99f)] =
          function (ru) {
            const z5 = uf;
            (mY = ru[z5(0xd5a)] - kU() / 0x2),
              (mZ = ru[z5(0x400)] - kV() / 0x2);
            if (!oV[z5(0x6ab)] && iy && !mo) {
              const rv = Math[z5(0x5b5)](mY, mZ),
                rw = Math[z5(0x22b)](mZ, mY);
              im(rw, rv < 0x32 ? rv / 0x64 : 0x1);
            }
          });
    }
    function mM(ru, rv, rw) {
      const z6 = uf;
      return Math[z6(0x8ab)](rv, Math[z6(0x9dc)](ru, rw));
    }
    var mN = [];
    function mO(ru) {
      const z7 = uf;
      let rv = mN[z7(0xc9c)]((rw) => rw["el"] === ru);
      if (rv) return (rv[z7(0x169)] = !![]), rv;
      (rv =
        typeof ru[z7(0xb1a)] === z7(0x970)
          ? ru[z7(0xb1a)]()
          : nu(ru[z7(0xb1a)], ru[z7(0xaa2)])),
        (rv[z7(0x169)] = !![]),
        (rv[z7(0xb02)] = 0x0),
        (rv[z7(0xdd7)][z7(0x251)] = z7(0x6c2)),
        (rv[z7(0xdd7)][z7(0x81c)] = z7(0x18e)),
        kH[z7(0x771)](rv);
      if (kL)
        (rv[z7(0xdd7)][z7(0x29d)] = z7(0x92d)),
          (rv[z7(0xdd7)][z7(0x525)] = z7(0x92d)),
          (rv[z7(0xdd7)][z7(0x871)] = z7(0x9a0)),
          (rv[z7(0xdd7)][z7(0x59b)] = z7(0x9a0));
      else {
        const rw = ru[z7(0x832)](),
          rx = rv[z7(0x832)]();
        (rv[z7(0xdd7)][z7(0x525)] =
          mM(
            ru[z7(0xd1b)]
              ? (rw[z7(0x525)] + rw[z7(0x645)]) / kR + 0xa
              : (rw[z7(0x525)] - rx[z7(0x645)]) / kR - 0xa,
            0xa,
            window[z7(0xb7f)] / kR - 0xa
          ) + "px"),
          (rv[z7(0xdd7)][z7(0x59b)] =
            mM(
              (rw[z7(0x59b)] + rw[z7(0x662)] / 0x2 - rx[z7(0x662)] / 0x2) / kR,
              0xa,
              window[z7(0x1d4)] / kR - 0xa - rx[z7(0x662)] / kR
            ) + "px"),
          (rv[z7(0xdd7)][z7(0x871)] = z7(0x9a0)),
          (rv[z7(0xdd7)][z7(0x29d)] = z7(0x9a0));
      }
      return (
        (rv[z7(0xdd7)][z7(0x443)] = z7(0x18e)),
        (rv[z7(0xdd7)][z7(0x663)] = 0x0),
        (rv["el"] = ru),
        mN[z7(0x462)](rv),
        rv
      );
    }
    var mP = document[uf(0xbda)](uf(0xb24));
    function mQ(ru, rv = 0x1) {
      const z8 = uf;
      !iS[ru] && ((iS[ru] = 0x0), oU(ru), nW()),
        (iS[ru] += rv),
        nU[ru][z8(0x717)](iS[ru]),
        iS[ru] <= 0x0 && (delete iS[ru], nU[ru][z8(0x6df)](), nW()),
        mR();
    }
    function mR() {
      const z9 = uf;
      mP[z9(0x729)] = "";
      Object[z9(0xdd1)](iS)[z9(0x28c)] === 0x0
        ? (mP[z9(0xdd7)][z9(0xd71)] = z9(0x18e))
        : (mP[z9(0xdd7)][z9(0xd71)] = "");
      const ru = {};
      for (const rv in iS) {
        const rw = dC[rv],
          rx = iS[rv];
        ru[rw[z9(0x24f)]] = (ru[rw[z9(0x24f)]] || 0x0) + rx;
      }
      oo(mP, ru);
      for (const ry in oa) {
        const rz = oa[ry];
        rz[z9(0x3d4)][ru[ry] ? z9(0x86e) : z9(0xa29)](z9(0x63d));
      }
    }
    function mS(ru, rv) {
      const za = uf;
      if (ru === rv) return;
      il(new Uint8Array([cI[za(0x1a8)], ru, rv]));
    }
    function mT(ru) {
      const zb = uf;
      return ru[zb(0xcc1)] || ru[zb(0xbda)](zb(0x13d));
    }
    function mU(ru, rv, rw = !![]) {
      const zc = uf,
        rx = ms[zc(0xc9c)]((rH) => rH === ru);
      if (rx) return rx[zc(0x33e)](rv), rx;
      let ry,
        rz,
        rA,
        rB,
        rC = 0x0,
        rD = 0x0,
        rE = 0x0,
        rF;
      (ru[zc(0x33e)] = function (rH, rI) {
        const zd = zc;
        (rF = ru[zd(0x3e7)] || ru[zd(0x516)]),
          (rF[zd(0xcc1)] = ru),
          (ru[zd(0xdd5)] = rF),
          (ru[zd(0x535)] = ![]),
          (ru[zd(0xb3c)] = ![]);
        const rJ = ru[zd(0x832)]();
        rH[zd(0x883)] === void 0x0
          ? ((rC = rH[zd(0xd5a)] - rJ["x"]),
            (rD = rH[zd(0x400)] - rJ["y"]),
            ru[zd(0x61c)](rH),
            (ry = rA),
            (rz = rB))
          : ((ry = rJ["x"]),
            (rz = rJ["y"]),
            ru[zd(0xdf2)](rH),
            ru[zd(0x499)](rI)),
          rG();
      }),
        (ru[zc(0x499)] = function (rH = !![]) {
          const ze = zc;
          ru[ze(0xb3c)] = !![];
          rF[ze(0xcc1)] === ru && (rF[ze(0xcc1)] = null);
          if (!ru[ze(0x3e7)])
            ru[ze(0xdf2)](rF),
              Math[ze(0x5b5)](rA - ry, rB - rz) > 0x32 * kR &&
                ru[ze(0xdf2)](mz);
          else {
            if (rH) {
              const rI = mT(ru[ze(0x3e7)]);
              (ru[ze(0x5e4)] = rI), rI && mU(rI, rF, ![]);
            }
          }
          ru[ze(0x3e7)] !== rF && (ru[ze(0x84c)] = 0x0),
            (ru[ze(0x3e7)][ze(0xcc1)] = ru);
        }),
        (ru[zc(0xdf2)] = function (rH) {
          const zf = zc;
          ru[zf(0x3e7)] = rH;
          const rI = rH[zf(0x832)]();
          (rA = rI["x"]),
            (rB = rI["y"]),
            (ru[zf(0xdd7)][zf(0xb6c)] =
              rH === mz ? zf(0x386) : getComputedStyle(rH)[zf(0xb6c)]);
        }),
        (ru[zc(0x61c)] = function (rH) {
          const zg = zc;
          (rA = rH[zg(0xd5a)] - rC),
            (rB = rH[zg(0x400)] - rD),
            (ru[zg(0x3e7)] = null);
          let rI = Infinity,
            rJ = null;
          const rK = ko[zg(0xddf)](zg(0x2c1));
          for (let rL = 0x0; rL < rK[zg(0x28c)]; rL++) {
            const rM = rK[rL],
              rN = rM[zg(0x832)](),
              rO = Math[zg(0x5b5)](
                rN["x"] + rN[zg(0x662)] / 0x2 - rH[zg(0xd5a)],
                rN["y"] + rN[zg(0x645)] / 0x2 - rH[zg(0x400)]
              );
            rO < 0x1e * kR && rO < rI && ((rJ = rM), (rI = rO));
          }
          rJ && rJ !== rF && ru[zg(0xdf2)](rJ);
        }),
        ru[zc(0x33e)](rv, rw),
        ru[zc(0x3d4)][zc(0xa29)](zc(0x7bf)),
        kH[zc(0x771)](ru);
      function rG() {
        const zh = zc;
        (ru[zh(0xdd7)][zh(0x59b)] = ry / kR + "px"),
          (ru[zh(0xdd7)][zh(0x525)] = rz / kR + "px");
      }
      return (
        (ru[zc(0x976)] = function () {
          const zi = zc;
          ru[zi(0x3e7)] && ru[zi(0xdf2)](ru[zi(0x3e7)]);
        }),
        (ru[zc(0x364)] = function () {
          const zj = zc;
          (ry = pg(ry, rA, 0x64)), (rz = pg(rz, rB, 0x64)), rG();
          let rH = 0x0,
            rI = Infinity;
          ru[zj(0x3e7)]
            ? ((rI = Math[zj(0x5b5)](rA - ry, rB - rz)),
              (rH = rI > 0x5 ? 0x1 : 0x0))
            : (rH = 0x1),
            (rE = pg(rE, rH, 0x64)),
            (ru[zj(0xdd7)][zj(0x81c)] =
              zj(0x725) +
              (0x1 + 0.3 * rE) +
              zj(0xb93) +
              rE * Math[zj(0xa3a)](Date[zj(0x160)]() / 0x96) * 0xa +
              zj(0x81f)),
            ru[zj(0xb3c)] &&
              rE < 0.05 &&
              rI < 0x5 &&
              (ru[zj(0x3d4)][zj(0x86e)](zj(0x7bf)),
              (ru[zj(0xdd7)][zj(0x59b)] =
                ru[zj(0xdd7)][zj(0x525)] =
                ru[zj(0xdd7)][zj(0x81c)] =
                ru[zj(0xdd7)][zj(0xb6c)] =
                ru[zj(0xdd7)][zj(0x376)] =
                  ""),
              (ru[zj(0x535)] = !![]),
              ru[zj(0x3e7)][zj(0x771)](ru),
              (ru[zj(0x3e7)][zj(0xcc1)] = null),
              (ru[zj(0x3e7)] = null));
        }),
        ms[zc(0x462)](ru),
        ru
      );
    }
    var mV = cY[uf(0x220)];
    document[uf(0x2fd)] = function () {
      return ![];
    };
    var mW = 0x0,
      mX = 0x0,
      mY = 0x0,
      mZ = 0x0,
      n0 = 0x1,
      n1 = 0x1;
    document[uf(0xab5)] = function (ru) {
      const zk = uf;
      ru[zk(0xdef)] === ki &&
        ((n0 *= ru[zk(0xd54)] < 0x0 ? 1.1 : 0.9),
        (n0 = Math[zk(0x9dc)](0x3, Math[zk(0x8ab)](0x1, n0))));
    };
    const n2 = {};
    (n2[uf(0xd7c)] = uf(0xbbe)),
      (n2["me"] = uf(0x114)),
      (n2[uf(0xd86)] = uf(0x8a2));
    var n3 = n2,
      n4 = {};
    function n5(ru, rv) {
      n6(ru, null, null, null, jx(rv));
    }
    function n6(ru, rv, rw, rx = n3[uf(0xd7c)], ry) {
      const zl = uf,
        rz = nA(zl(0x893));
      if (!ry) {
        if (rv) {
          const rB = nA(zl(0x707));
          k8(rB, rv + ":"), rz[zl(0x771)](rB);
        }
        const rA = nA(zl(0xdf7));
        k8(rA, rw),
          rz[zl(0x771)](rA),
          (rz[zl(0x600)][0x0][zl(0xdd7)][zl(0x7f2)] = rx),
          rv && rz[zl(0x702)](nA(zl(0xbc1)));
      } else rz[zl(0x729)] = ry;
      p3[zl(0x771)](rz);
      while (p3[zl(0x600)][zl(0x28c)] > 0x3c) {
        p3[zl(0x600)][0x0][zl(0x86e)]();
      }
      return (
        (p3[zl(0x53d)] = p3[zl(0x3a6)]),
        (rz[zl(0x54f)] = rw),
        (rz[zl(0xd4a)] = rx),
        n7(ru, rz),
        rz
      );
    }
    function n7(ru, rv) {
      const zm = uf;
      (rv["t"] = 0x0), (rv[zm(0x8a9)] = 0x0);
      if (!n4[ru]) n4[ru] = [];
      n4[ru][zm(0x462)](rv);
    }
    var n8 = {};
    ki[uf(0x9e5)] = window[uf(0x31f)] = ng(function (ru) {
      const zn = uf,
        rv = zn(0x7be) + ru[zn(0x2dc)];
      pa(rv, ru[zn(0x344)] === zn(0x44b));
    });
    var n9 = 0x0;
    function na(ru) {
      const zo = uf,
        rv = 0x200,
        rw = rv / 0x64,
        rx = document[zo(0x9bf)](zo(0x297));
      rx[zo(0x662)] = rx[zo(0x645)] = rv;
      const ry = rx[zo(0xd84)]("2d");
      ry[zo(0x5df)](rv / 0x2, rv / 0x2), ry[zo(0x3ad)](rw), ru[zo(0x30b)](ry);
      const rz = (ru[zo(0x558)] ? zo(0x87a) : zo(0x10e)) + ru[zo(0x789)];
      nb(rx, rz);
    }
    function nb(ru, rv) {
      const zp = uf,
        rw = document[zp(0x9bf)]("a");
      (rw[zp(0x90f)] = rv),
        (rw[zp(0x87c)] = typeof ru === zp(0x467) ? ru : ru[zp(0x2ec)]()),
        rw[zp(0x58b)](),
        hK(rv + zp(0x387), hP[zp(0x16d)]);
    }
    var nc = 0x0;
    setInterval(function () {
      nc = 0x0;
    }, 0x1770),
      setInterval(function () {
        const zq = uf;
        nh[zq(0x28c)] = 0x0;
      }, 0x2710);
    var nd = ![],
      ne = ![];
    function nf(ru) {
      const zr = uf;
      ru = ru[zr(0x55e)]();
      if (!ru) hK(zr(0x21f)), hc(zr(0x21f));
      else
        ru[zr(0x28c)] < cN || ru[zr(0x28c)] > cM
          ? (hK(zr(0x13b)), hc(zr(0x13b)))
          : (hK(zr(0x402) + ru + zr(0x5d8), hP[zr(0x3f4)]),
            hc(zr(0x402) + ru + zr(0x5d8)),
            mi(ru));
    }
    document[uf(0xcc5)] = document[uf(0xa32)] = ng(function (ru) {
      const zs = uf;
      ru[zs(0x2ab)] && ru[zs(0xaa4)]();
      (nd = ru[zs(0x2ab)]), (ne = ru[zs(0x601)]);
      if (ru[zs(0xd8b)] === 0x9) {
        ru[zs(0xaa4)]();
        return;
      }
      if (document[zs(0x41d)] && document[zs(0x41d)][zs(0x883)] === zs(0x4de)) {
        if (ru[zs(0x344)] === zs(0x1d8) && ru[zs(0xd8b)] === 0xd) {
          if (document[zs(0x41d)] === hF) hG[zs(0x58b)]();
          else {
            if (document[zs(0x41d)] === p2) {
              let rv = p2[zs(0x6f1)][zs(0x55e)]()[zs(0x471)](0x0, cL);
              if (rv && hW) {
                if (pz - n9 > 0x3e8) {
                  const rw = rv[zs(0x904)](zs(0x3ba));
                  if (rw || rv[zs(0x904)](zs(0x94f))) {
                    const rx = rv[zs(0x471)](rw ? 0x7 : 0x9);
                    if (!rx) hK(zs(0x557));
                    else {
                      if (rw) {
                        const ry = eM[rx];
                        !ry ? hK(zs(0x2af) + rx + "!") : na(ry);
                      } else {
                        const rz = dF[rx];
                        !rz ? hK(zs(0x3d9) + rx + "!") : na(rz);
                      }
                    }
                  } else {
                    if (rv[zs(0x904)](zs(0x653))) nb(qh, zs(0x47d));
                    else {
                      
                      var inputChat = rv;
                      if(inputChat.startsWith('/toggle')){
                        hack.command2Arg('toggle', inputChat);
                      }else if(inputChat.startsWith('/list')){
                        hack.addChat('List of module and configs:');
                        hack.list();
                      }else if(inputChat.startsWith('/help')){
                        hack.getHelp();
                      }else if(inputChat.startsWith('/server')){
                        hack.getServer();
                      }else if(inputChat.startsWith('/wave')){
                        hack.getWave();
                      }else if (rv[zs(0x904)](zs(0xd0a))) {
                        const rA = rv[zs(0x471)](0x9);
                        nf(rA);
                      } else {
                        let rB = 0x0;
                        for (let rC = 0x0; rC < nh[zs(0x28c)]; rC++) {
                          ni(rv, nh[rC]) > 0.95 && rB++;
                        }
                        rB >= 0x3 && (nc += 0xa);
                        nc++;
                        if (nc > 0x3) hK(zs(0xad4)), (n9 = pz + 0xea60);
                        else {
                          nh[zs(0x462)](rv);
                          if (nh[zs(0x28c)] > 0xa) nh[zs(0x200)]();
                          (rv = decodeURIComponent(
                            encodeURIComponent(rv)
                              [zs(0x5fe)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [zs(0x5fe)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[zs(0xe00)],
                                ...new TextEncoder()[zs(0x1d1)](rv),
                              ])
                            ),
                            (n9 = pz);
                        }
                      }
                    }
                  }
                } else n6(-0x1, null, zs(0x55b), n3[zs(0xd86)]);
              }
              (p2[zs(0x6f1)] = ""), p2[zs(0x36b)]();
            }
          }
        }
        return;
      }
      pa(ru[zs(0xd05)], ru[zs(0x344)] === zs(0xaeb));
    });
    function ng(ru) {
      return function (rv) {
        const zt = b;
        rv instanceof Event && rv[zt(0xbd0)] && !rv[zt(0x68e)] && ru(rv);
      };
    }
    var nh = [];
    function ni(ru, rv) {
      const zu = uf;
      var rw = ru,
        rx = rv;
      ru[zu(0x28c)] < rv[zu(0x28c)] && ((rw = rv), (rx = ru));
      var ry = rw[zu(0x28c)];
      if (ry == 0x0) return 0x1;
      return (ry - nj(rw, rx)) / parseFloat(ry);
    }
    function nj(ru, rv) {
      const zv = uf;
      (ru = ru[zv(0x13e)]()), (rv = rv[zv(0x13e)]());
      var rw = new Array();
      for (var rx = 0x0; rx <= ru[zv(0x28c)]; rx++) {
        var ry = rx;
        for (var rz = 0x0; rz <= rv[zv(0x28c)]; rz++) {
          if (rx == 0x0) rw[rz] = rz;
          else {
            if (rz > 0x0) {
              var rA = rw[rz - 0x1];
              if (ru[zv(0x7e0)](rx - 0x1) != rv[zv(0x7e0)](rz - 0x1))
                rA = Math[zv(0x9dc)](Math[zv(0x9dc)](rA, ry), rw[rz]) + 0x1;
              (rw[rz - 0x1] = ry), (ry = rA);
            }
          }
        }
        if (rx > 0x0) rw[rv[zv(0x28c)]] = ry;
      }
      return rw[rv[zv(0x28c)]];
    }
    var nk = document[uf(0xbda)](uf(0xca7)),
      nl = document[uf(0xbda)](uf(0xbf4));
    function nm(ru, rv = 0x1) {
      const zw = uf;
      ru[zw(0x96f)](),
        ru[zw(0x37a)](0.25 * rv, 0.25 * rv),
        ru[zw(0x5df)](-0x4b, -0x4b),
        ru[zw(0x721)](),
        ru[zw(0x371)](0x4b, 0x28),
        ru[zw(0x13c)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        ru[zw(0x13c)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        ru[zw(0x13c)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        ru[zw(0x13c)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        ru[zw(0x13c)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        ru[zw(0x13c)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (ru[zw(0x632)] = zw(0x74d)),
        ru[zw(0x80f)](),
        (ru[zw(0x62f)] = ru[zw(0xa23)] = zw(0x7cc)),
        (ru[zw(0x20a)] = zw(0x633)),
        (ru[zw(0xd87)] = 0xc),
        ru[zw(0xaaa)](),
        ru[zw(0x416)]();
    }
    for (let ru = 0x0; ru < dC[uf(0x28c)]; ru++) {
      const rv = dC[ru];
      if (rv[uf(0xabe)] !== void 0x0)
        switch (rv[uf(0xabe)]) {
          case df[uf(0x41e)]:
            rv[uf(0x30b)] = function (rw) {
              const zx = uf;
              rw[zx(0x37a)](2.5, 2.5), lO(rw);
            };
            break;
          case df[uf(0x4fe)]:
            rv[uf(0x30b)] = function (rw) {
              const zy = uf;
              rw[zy(0x3ad)](0.9);
              const rx = pF();
              (rx[zy(0x3e6)] = !![]), rx[zy(0x536)](rw);
            };
            break;
          case df[uf(0x31b)]:
            rv[uf(0x30b)] = function (rw) {
              const zz = uf;
              rw[zz(0x488)](-Math["PI"] / 0x2),
                rw[zz(0x5df)](-0x30, 0x0),
                pE[zz(0x14a)](rw, ![]);
            };
            break;
          case df[uf(0x72a)]:
            rv[uf(0x30b)] = function (rw) {
              const zA = uf;
              rw[zA(0x488)](Math["PI"] / 0xa),
                rw[zA(0x5df)](0x3, 0x15),
                lP(rw, !![]);
            };
            break;
          case df[uf(0xa76)]:
            rv[uf(0x30b)] = function (rw) {
              nm(rw);
            };
            break;
          case df[uf(0x920)]:
            rv[uf(0x30b)] = function (rw) {
              const zB = uf;
              rw[zB(0x5df)](0x0, 0x3),
                rw[zB(0x488)](-Math["PI"] / 0x4),
                rw[zB(0x3ad)](0.4),
                pE[zB(0xa4b)](rw),
                rw[zB(0x721)](),
                rw[zB(0x1e0)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rw[zB(0xd87)] = 0x8),
                (rw[zB(0x20a)] = zB(0x6cf)),
                rw[zB(0xaaa)]();
            };
            break;
          case df[uf(0xb91)]:
            rv[uf(0x30b)] = function (rw) {
              const zC = uf;
              rw[zC(0x5df)](0x0, 0x7),
                rw[zC(0x3ad)](0.8),
                pE[zC(0x84f)](rw, 0.5);
            };
            break;
          case df[uf(0xcfd)]:
            rv[uf(0x30b)] = function (rw) {
              const zD = uf;
              rw[zD(0x3ad)](1.3), lS(rw);
            };
            break;
          default:
            rv[uf(0x30b)] = function (rw) {};
        }
      else {
        const rw = new lG(
          -0x1,
          rv[uf(0x344)],
          0x0,
          0x0,
          rv[uf(0x76e)],
          rv[uf(0x11f)] ? 0x10 : rv[uf(0xd48)] * 1.1,
          0x0
        );
        (rw[uf(0xa38)] = !![]),
          rv[uf(0x91b)] === 0x1
            ? (rv[uf(0x30b)] = function (rx) {
                const zE = uf;
                rw[zE(0x536)](rx);
              })
            : (rv[uf(0x30b)] = function (rx) {
                const zF = uf;
                for (let ry = 0x0; ry < rv[zF(0x91b)]; ry++) {
                  rx[zF(0x96f)]();
                  const rz = (ry / rv[zF(0x91b)]) * Math["PI"] * 0x2;
                  rv[zF(0x62e)]
                    ? rx[zF(0x5df)](...le(rv[zF(0x8ae)], 0x0, rz))
                    : (rx[zF(0x488)](rz), rx[zF(0x5df)](rv[zF(0x8ae)], 0x0)),
                    rx[zF(0x488)](rv[zF(0xbe3)]),
                    rw[zF(0x536)](rx),
                    rx[zF(0x416)]();
                }
              });
      }
    }
    const nn = {};
    (nn[uf(0x1fa)] = uf(0xd45)),
      (nn[uf(0xb88)] = uf(0x4d2)),
      (nn[uf(0x180)] = uf(0xa42)),
      (nn[uf(0x512)] = uf(0xdaa)),
      (nn[uf(0xb36)] = uf(0x791)),
      (nn[uf(0x5f6)] = uf(0xc9e)),
      (nn[uf(0xdf6)] = uf(0x378));
    var no = nn;
    function np() {
      const zG = uf,
        rx = document[zG(0xbda)](zG(0xba2));
      let ry = zG(0x493);
      for (let rz = 0x0; rz < 0xc8; rz++) {
        const rA = d6(rz),
          rB = 0xc8 * rA,
          rC = 0x19 * rA,
          rD = d5(rz);
        ry +=
          zG(0x688) +
          (rz + 0x1) +
          zG(0x5d0) +
          k9(Math[zG(0x7cc)](rB)) +
          zG(0x5d0) +
          k9(Math[zG(0x7cc)](rC)) +
          zG(0x5d0) +
          rD +
          zG(0x5d5);
      }
      (ry += zG(0xbea)), (ry += zG(0x963)), (rx[zG(0x729)] = ry);
    }
    np();
    function nq(rx, ry) {
      const zH = uf,
        rz = eM[rx],
        rA = rz[zH(0x789)],
        rB = rz[zH(0x24f)];
      return (
        "x" +
        ry[zH(0x91b)] * ry[zH(0xc55)] +
        ("\x20" + rA + zH(0x7fe) + hQ[rB] + zH(0xc26) + hN[rB] + ")")
      );
    }
    function nr(rx) {
      const zI = uf;
      return rx[zI(0x24a)](0x2)[zI(0x5fe)](/\.?0+$/, "");
    }
    var ns = [
        [uf(0x8df), uf(0x9ec), no[uf(0x1fa)]],
        [uf(0x81b), uf(0x944), no[uf(0xb88)]],
        [uf(0x763), uf(0x265), no[uf(0x180)]],
        [uf(0x407), uf(0x4ab), no[uf(0x512)]],
        [uf(0x184), uf(0xa69), no[uf(0x5f6)]],
        [uf(0xbcb), uf(0x609), no[uf(0xb36)]],
        [uf(0x109), uf(0x570), no[uf(0xdf6)]],
        [uf(0x7f4), uf(0x697), no[uf(0xdf6)], (rx) => "+" + k9(rx)],
        [uf(0x2fb), uf(0x17d), no[uf(0xdf6)], (rx) => "+" + k9(rx)],
        [uf(0x103), uf(0xf0), no[uf(0xdf6)]],
        [
          uf(0x206),
          uf(0x749),
          no[uf(0xdf6)],
          (rx) => Math[uf(0x7cc)](rx * 0x64) + "%",
        ],
        [uf(0x672), uf(0x7f0), no[uf(0xdf6)], (rx) => "+" + nr(rx) + uf(0xc4c)],
        [uf(0xc37), uf(0xb1d), no[uf(0x180)], (rx) => k9(rx) + "/s"],
        [uf(0xa92), uf(0xb1d), no[uf(0x180)], (rx) => k9(rx) + uf(0xd40)],
        [
          uf(0x170),
          uf(0x2ca),
          no[uf(0xdf6)],
          (rx) => (rx > 0x0 ? "+" : "") + rx,
        ],
        [uf(0xba5), uf(0x14b), no[uf(0xb36)], (rx) => "+" + rx + "%"],
        [
          uf(0x876),
          uf(0x5aa),
          no[uf(0xb36)],
          (rx) => "+" + parseInt(rx * 0x64) + "%",
        ],
        [uf(0x2a8), uf(0x9cf), no[uf(0xdf6)], (rx) => "-" + rx + "%"],
        [uf(0x3c4), uf(0x2b5), no[uf(0xdf6)], nq],
        [uf(0x934), uf(0x5ca), no[uf(0xb36)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x856), uf(0xda0), no[uf(0xb36)], (rx) => rx + "s"],
        [uf(0xa6c), uf(0xa8e), no[uf(0xb36)], (rx) => k9(rx) + uf(0x7f1)],
        [uf(0xc10), uf(0x9de), no[uf(0xb36)], (rx) => rx + "s"],
        [uf(0x115), uf(0x9f3), no[uf(0xb36)], (rx) => rx / 0x3e8 + "s"],
        [uf(0xcfa), uf(0xcb8), no[uf(0xb36)]],
        [uf(0x590), uf(0xcb1), no[uf(0xb36)]],
        [uf(0x43a), uf(0xa16), no[uf(0xb36)], (rx) => rx + uf(0x852)],
        [uf(0x29e), uf(0x787), no[uf(0xb36)], (rx) => rx + uf(0x852)],
        [uf(0x189), uf(0x58c), no[uf(0xb36)]],
        [uf(0x4d4), uf(0x5f8), no[uf(0xdf6)]],
        [uf(0x1c8), uf(0x85e), no[uf(0xb36)], (rx) => rx / 0x3e8 + "s"],
        [uf(0xbeb), uf(0x61f), no[uf(0x180)], (rx) => k9(rx) + "/s"],
        [uf(0x452), uf(0x840), no[uf(0xb36)]],
        [uf(0x753), uf(0x608), no[uf(0xdf6)]],
        [
          uf(0x16e),
          uf(0xd00),
          no[uf(0xb36)],
          (rx, ry) => nr(rx * ry[uf(0xd48)]),
        ],
        [uf(0xce5), uf(0x4e3), no[uf(0xb36)]],
        [uf(0xdb7), uf(0x980), no[uf(0xdf6)]],
        [uf(0xcdd), uf(0x23d), no[uf(0xb36)]],
        [uf(0x42a), uf(0x53f), no[uf(0xb36)]],
        [uf(0x53e), uf(0x548), no[uf(0xb36)]],
        [
          uf(0x4d9),
          uf(0xd0e),
          no[uf(0xb36)],
          (rx) => "+" + nr(rx * 0x64) + "%",
        ],
        [uf(0x5e6), uf(0x118), no[uf(0x5f6)]],
        [uf(0x6a2), uf(0x7f6), no[uf(0xb36)]],
        [uf(0x923), uf(0x562), no[uf(0x180)]],
        [uf(0x1c4), uf(0xda0), no[uf(0xb36)], (rx) => rx + "s"],
        [uf(0x4b7), uf(0xab0), no[uf(0xb36)]],
        [uf(0x30e), uf(0xd65), no[uf(0xdf6)], (rx) => rx / 0x3e8 + "s"],
      ],
      nt = [
        [uf(0x561), uf(0xcb9), no[uf(0xb36)]],
        [uf(0x305), uf(0xa63), no[uf(0xdf6)], (rx) => k9(rx * 0x64) + "%"],
        [uf(0x88a), uf(0x9be), no[uf(0xdf6)]],
        [uf(0x2c6), uf(0x52c), no[uf(0xb36)]],
        [uf(0x446), uf(0xc41), no[uf(0xdf6)]],
        [uf(0xba5), uf(0x14b), no[uf(0xb36)], (rx) => "+" + rx + "%"],
        [uf(0xb47), uf(0x996), no[uf(0xb36)], (rx) => k9(rx) + "/s"],
        [uf(0xd5f), uf(0x4a7), no[uf(0x1fa)], (rx) => rx * 0x64 + uf(0x4a3)],
        [uf(0xb8f), uf(0xb05), no[uf(0xb36)], (rx) => rx + "s"],
        [
          uf(0x1a2),
          uf(0xb45),
          no[uf(0xdf6)],
          (rx) => "-" + parseInt((0x1 - rx) * 0x64) + "%",
        ],
      ];
    function nu(rx, ry = !![]) {
      const zJ = uf;
      let rz = "",
        rA = "",
        rB;
      rx[zJ(0xabe)] === void 0x0
        ? ((rB = ns),
          rx[zJ(0x593)] &&
            (rA =
              zJ(0xa09) +
              (rx[zJ(0x593)] / 0x3e8 +
                "s" +
                (rx[zJ(0xb3a)] > 0x0
                  ? zJ(0xded) + rx[zJ(0xb3a)] / 0x3e8 + "s"
                  : "")) +
              zJ(0x1ab)))
        : (rB = nt);
      for (let rD = 0x0; rD < rB[zJ(0x28c)]; rD++) {
        const [rE, rF, rG, rH] = rB[rD],
          rI = rx[rE];
        rI &&
          rI !== 0x0 &&
          (rz +=
            zJ(0x857) +
            rG +
            zJ(0x8e2) +
            rF +
            zJ(0x307) +
            (rH ? rH(rI, rx) : k9(rI)) +
            zJ(0x333));
      }
      const rC = nA(
        zJ(0xd32) +
          rx[zJ(0x789)] +
          zJ(0x18b) +
          hN[rx[zJ(0x24f)]] +
          zJ(0x7b8) +
          hQ[rx[zJ(0x24f)]] +
          zJ(0xbed) +
          rA +
          zJ(0x133) +
          rx[zJ(0xab8)] +
          zJ(0xbed) +
          rz +
          zJ(0x825)
      );
      if (rx[zJ(0xd80)] && ry) {
        rC[zJ(0x4ae)][zJ(0xdd7)][zJ(0x39f)] = zJ(0x92d);
        for (let rJ = 0x0; rJ < rx[zJ(0xd80)][zJ(0x28c)]; rJ++) {
          const [rK, rL] = rx[zJ(0xd80)][rJ],
            rM = nA(zJ(0xa89));
          rC[zJ(0x771)](rM);
          const rN = f5[rL][rx[zJ(0x24f)]];
          for (let rO = 0x0; rO < rN[zJ(0x28c)]; rO++) {
            const [rP, rQ] = rN[rO],
              rR = eW(rK, rQ),
              rS = nA(
                zJ(0xde6) +
                  rR[zJ(0x24f)] +
                  "\x22\x20" +
                  qk(rR) +
                  zJ(0x3fb) +
                  rP +
                  zJ(0x7fb)
              );
            rM[zJ(0x771)](rS);
          }
        }
      }
      return rC;
    }
    function nv() {
      const zK = uf;
      mt && (mt[zK(0x86e)](), (mt = null));
      const rx = ko[zK(0xddf)](zK(0x13d));
      for (let ry = 0x0; ry < rx[zK(0x28c)]; ry++) {
        const rz = rx[ry];
        rz[zK(0x86e)]();
      }
      for (let rA = 0x0; rA < iO; rA++) {
        const rB = nA(zK(0xc0d));
        rB[zK(0x8cd)] = rA;
        const rC = iP[rA];
        if (rC) {
          const rD = nA(
            zK(0xc8b) + rC[zK(0x24f)] + "\x22\x20" + qk(rC) + zK(0x2d6)
          );
          (rD[zK(0xb1a)] = rC),
            (rD[zK(0x233)] = !![]),
            (rD[zK(0x224)] = iR[zK(0xbb0)]()),
            nz(rD, rC),
            rB[zK(0x771)](rD),
            (iQ[rD[zK(0x224)]] = rD);
        }
        rA >= iN
          ? (rB[zK(0x771)](nA(zK(0x5d4) + ((rA - iN + 0x1) % 0xa) + zK(0x82a))),
            nl[zK(0x771)](rB))
          : nk[zK(0x771)](rB);
      }
    }
    function nw(rx) {
      const zL = uf;
      return rx < 0.5
        ? 0x4 * rx * rx * rx
        : 0x1 - Math[zL(0x695)](-0x2 * rx + 0x2, 0x3) / 0x2;
    }
    var nx = [];
    function ny(rx, ry) {
      const zM = uf;
      (rx[zM(0x84c)] = 0x0), (rx[zM(0x88d)] = 0x1);
      let rz = 0x1,
        rA = 0x0,
        rB = -0x1;
      rx[zM(0x3d4)][zM(0xa29)](zM(0x942)), rx[zM(0x654)](zM(0xdd7), "");
      const rC = nA(zM(0x4a0));
      rx[zM(0x771)](rC), nx[zM(0x462)](rC);
      const rD = qc;
      rC[zM(0x662)] = rC[zM(0x645)] = rD;
      const rE = rC[zM(0xd84)]("2d");
      (rC[zM(0xb2b)] = function () {
        const zN = zM;
        rE[zN(0x532)](0x0, 0x0, rD, rD);
        rA < 0.99 &&
          ((rE[zN(0xac6)] = 0x1 - rA),
          (rE[zN(0x632)] = zN(0x7eb)),
          rE[zN(0x95a)](0x0, 0x0, rD, (0x1 - rz) * rD));
        if (rA < 0.01) return;
        (rE[zN(0xac6)] = rA),
          rE[zN(0x96f)](),
          rE[zN(0x3ad)](rD / 0x64),
          rE[zN(0x5df)](0x32, 0x2d);
        let rF = rx[zN(0x84c)];
        rF = nw(rF);
        const rG = Math["PI"] * 0x2 * rF;
        rE[zN(0x488)](rG * 0x4),
          rE[zN(0x721)](),
          rE[zN(0x371)](0x0, 0x0),
          rE[zN(0x1e0)](0x0, 0x0, 0x64, 0x0, rG),
          rE[zN(0x371)](0x0, 0x0),
          rE[zN(0x1e0)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rE[zN(0x632)] = zN(0x967)),
          rE[zN(0x80f)](zN(0x34e)),
          rE[zN(0x416)]();
      }),
        (rC[zM(0x364)] = function () {
          const zO = zM;
          rx[zO(0x84c)] += pA / (ry[zO(0x593)] + 0xc8);
          let rF = 0x1,
            rG = rx[zO(0x88d)];
          rx[zO(0x84c)] >= 0x1 && (rF = 0x0);
          const rH = rx[zO(0x3e7)] || rx[zO(0x516)];
          ((rH && rH[zO(0x516)] === nl) || !iy) && ((rG = 0x1), (rF = 0x0));
          (rA = pg(rA, rF, 0x64)), (rz = pg(rz, rG, 0x64));
          const rI = Math[zO(0x7cc)]((0x1 - rz) * 0x64),
            rJ = Math[zO(0x7cc)](rA * 0x64) / 0x64;
          rJ == 0x0 && rI <= 0x0
            ? ((rC[zO(0x7af)] = ![]), (rC[zO(0xdd7)][zO(0xd71)] = zO(0x18e)))
            : ((rC[zO(0x7af)] = !![]), (rC[zO(0xdd7)][zO(0xd71)] = "")),
            (rB = rI);
        }),
        rx[zM(0x771)](nA(zM(0x5f4) + qk(ry) + zM(0x2d6)));
    }
    function nz(rx, ry, rz = !![]) {
      const zP = uf;
      rz && ry[zP(0xabe)] === void 0x0 && ny(rx, ry);
    }
    function nA(rx) {
      const zQ = uf;
      return (hB[zQ(0x729)] = rx), hB[zQ(0x600)][0x0];
    }
    var nB = document[uf(0xbda)](uf(0x559)),
      nC = [];
    function nD() {
      const zR = uf;
      (nB[zR(0x729)] = zR(0xc0e)[zR(0x68e)](eL * dH)),
        (nC = Array[zR(0x68f)](nB[zR(0x600)]));
    }
    nD();
    var nE = {};
    for (let rx = 0x0; rx < eK[uf(0x28c)]; rx++) {
      const ry = eK[rx];
      !nE[ry[uf(0x344)]] &&
        ((nE[ry[uf(0x344)]] = new lG(
          -0x1,
          ry[uf(0x344)],
          0x0,
          0x0,
          ry[uf(0x372)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          ry[uf(0x4e2)],
          0x1
        )),
        (nE[ry[uf(0x344)]][uf(0xa38)] = !![]));
      const rz = nE[ry[uf(0x344)]];
      let rA = null;
      ry[uf(0x1ca)] !== void 0x0 &&
        (rA = new lG(-0x1, ry[uf(0x1ca)], 0x0, 0x0, 0x0, ry[uf(0x4e2)], 0x1)),
        (ry[uf(0x30b)] = function (rB) {
          const zS = uf;
          rB[zS(0x37a)](0.5, 0.5),
            rz[zS(0x536)](rB),
            rA &&
              (rB[zS(0x488)](rz[zS(0xcaa)]),
              rB[zS(0x5df)](-ry[zS(0x4e2)] * 0x2, 0x0),
              rA[zS(0x536)](rB));
        });
    }
    function nF(rB, rC = ![]) {
      const zT = uf,
        rD = nA(zT(0xc8b) + rB[zT(0x24f)] + "\x22\x20" + qk(rB) + zT(0x2d6));
      jY(rD), (rD[zT(0xb1a)] = rB);
      if (rC) return rD;
      const rE = dH * rB[zT(0x959)] + rB[zT(0x24f)],
        rF = nC[rE];
      return nB[zT(0xc50)](rD, rF), rF[zT(0x86e)](), (nC[rE] = rD), rD;
    }
    var nG = document[uf(0xbda)](uf(0xcf5)),
      nH = document[uf(0xbda)](uf(0x3b0)),
      nI = document[uf(0xbda)](uf(0x981)),
      nJ = document[uf(0xbda)](uf(0xdd6)),
      nK = document[uf(0xbda)](uf(0x368)),
      nL = nK[uf(0xbda)](uf(0xda3)),
      nM = nK[uf(0xbda)](uf(0x99c)),
      nN = document[uf(0xbda)](uf(0x519)),
      nO = document[uf(0xbda)](uf(0x276)),
      nP = ![],
      nQ = 0x0,
      nR = ![];
    (nH[uf(0x4a5)] = function () {
      (nP = !![]), (nQ = 0x0), (nR = ![]);
    }),
      (nJ[uf(0x4a5)] = function () {
        const zU = uf;
        if (this[zU(0x3d4)][zU(0x755)](zU(0x720)) || jy) return;
        kI(zU(0xa7a), (rB) => {
          rB && ((nP = !![]), (nQ = 0x0), (nR = !![]));
        });
      }),
      (nG[uf(0x729)] = uf(0xc0e)[uf(0x68e)](dG * dH));
    var nS = Array[uf(0x68f)](nG[uf(0x600)]),
      nT = document[uf(0xbda)](uf(0x89d)),
      nU = {};
    function nV() {
      const zV = uf;
      for (let rB in nU) {
        nU[rB][zV(0x6df)]();
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
        rC = Array[zW(0x68f)](rB[zW(0xddf)](zW(0x13d)));
      rC[zW(0x582)]((rD, rE) => {
        const zX = zW,
          rF = rE[zX(0xb1a)][zX(0x24f)] - rD[zX(0xb1a)][zX(0x24f)];
        return rF === 0x0 ? rE[zX(0xb1a)]["id"] - rD[zX(0xb1a)]["id"] : rF;
      });
      for (let rD = 0x0; rD < rC[zW(0x28c)]; rD++) {
        const rE = rC[rD];
        rB[zW(0x771)](rE);
      }
    }
    function nY(rB, rC) {
      const zY = uf,
        rD = rC[zY(0x24f)] - rB[zY(0x24f)];
      return rD === 0x0 ? rC["id"] - rB["id"] : rD;
    }
    function nZ(rB, rC = !![]) {
      const zZ = uf,
        rD = nA(zZ(0x560) + rB[zZ(0x24f)] + "\x22\x20" + qk(rB) + zZ(0xd8a));
      setTimeout(function () {
        const A0 = zZ;
        rD[A0(0x3d4)][A0(0x86e)](A0(0x417));
      }, 0x1f4),
        (rD[zZ(0xb1a)] = rB);
      if (rC) {
      }
      return (rD[zZ(0x7e2)] = rD[zZ(0xbda)](zZ(0x4fb))), rD;
    }
    var o0 = nA(uf(0xa6b)),
      o1 = o0[uf(0xbda)](uf(0x6f8)),
      o2 = o0[uf(0xbda)](uf(0x6fb)),
      o3 = o0[uf(0xbda)](uf(0xba6)),
      o4 = [];
    for (let rB = 0x0; rB < 0x5; rB++) {
      const rC = nA(uf(0xc0e));
      (rC[uf(0x636)] = function (rD = 0x0) {
        const A1 = uf,
          rE =
            (rB / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rD * Math["PI"] * 0x6,
          rF =
            0x32 +
            (rD > 0x0
              ? Math[A1(0x10d)](Math[A1(0xa3a)](rD * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[A1(0xdd7)][A1(0x59b)] = Math[A1(0x68a)](rE) * rF + 0x32 + "%"),
          (this[A1(0xdd7)][A1(0x525)] = Math[A1(0xa3a)](rE) * rF + 0x32 + "%");
      }),
        rC[uf(0x636)](),
        (rC[uf(0x91b)] = 0x0),
        (rC["el"] = null),
        (rC[uf(0x33e)] = function () {
          const A2 = uf;
          (rC[A2(0x91b)] = 0x0), (rC["el"] = null), (rC[A2(0x729)] = "");
        }),
        (rC[uf(0x46f)] = function (rD) {
          const A3 = uf;
          if (!rC["el"]) {
            const rE = nZ(oJ, ![]);
            (rE[A3(0x4a5)] = function () {
              if (oL || oN) return;
              oR(null);
            }),
              rC[A3(0x771)](rE),
              (rC["el"] = rE);
          }
          (rC[A3(0x91b)] += rD), oP(rC["el"][A3(0x7e2)], rC[A3(0x91b)]);
        }),
        o1[uf(0x771)](rC),
        o4[uf(0x462)](rC);
    }
    var o5,
      o6 = document[uf(0xbda)](uf(0xdb6)),
      o7 = document[uf(0xbda)](uf(0xaa7)),
      o8 = document[uf(0xbda)](uf(0x261)),
      o9 = document[uf(0xbda)](uf(0x6cb)),
      oa = {};
    function ob() {
      const A4 = uf,
        rD = document[A4(0xbda)](A4(0x247));
      for (let rE = 0x0; rE < dH; rE++) {
        const rF = nA(A4(0x65b) + rE + A4(0xaca));
        (rF[A4(0x4a5)] = function () {
          const A5 = A4;
          let rG = p9;
          p9 = !![];
          for (const rH in nU) {
            const rI = dC[rH];
            if (rI[A5(0x24f)] !== rE) continue;
            const rJ = nU[rH];
            rJ[A5(0x5e5)][A5(0x58b)]();
          }
          p9 = rG;
        }),
          (oa[rE] = rF),
          rD[A4(0x771)](rF);
      }
    }
    ob();
    var oc = ![],
      od = document[uf(0xbda)](uf(0x822));
    od[uf(0x4a5)] = function () {
      const A6 = uf;
      document[A6(0xde9)][A6(0x3d4)][A6(0x466)](A6(0x13a)),
        (oc = document[A6(0xde9)][A6(0x3d4)][A6(0x755)](A6(0x13a)));
      const rD = oc ? A6(0x783) : A6(0xb6d);
      k8(o7, rD),
        k8(o9, rD),
        oc
          ? (o6[A6(0x771)](o0), o0[A6(0x771)](nG), o8[A6(0x86e)]())
          : (o6[A6(0x771)](o8),
            o8[A6(0xc50)](nG, o8[A6(0x4ae)]),
            o0[A6(0x86e)]());
    };
    var oe = document[uf(0xbda)](uf(0x6ce)),
      of = oi(uf(0x697), no[uf(0xb88)]),
      og = oi(uf(0x7cf), no[uf(0x1fa)]),
      oh = oi(uf(0x523), no[uf(0x5f6)]);
    function oi(rD, rE) {
      const A7 = uf,
        rF = nA(A7(0x9fd) + rE + A7(0xb75) + rD + A7(0x422));
      return (
        (rF[A7(0x12d)] = function (rG) {
          const A8 = A7;
          k8(rF[A8(0x600)][0x1], k9(Math[A8(0x7cc)](rG)));
        }),
        oe[A7(0x771)](rF),
        rF
      );
    }
    var oj = document[uf(0xbda)](uf(0x2bd)),
      ok = document[uf(0xbda)](uf(0x22c));
    ok[uf(0x729)] = "";
    var ol = document[uf(0xbda)](uf(0xa05)),
      om = {};
    function on() {
      const A9 = uf;
      (ok[A9(0x729)] = ""), (ol[A9(0x729)] = "");
      const rD = {},
        rE = [];
      for (let rF in om) {
        const rG = dC[rF],
          rH = om[rF];
        (rD[rG[A9(0x24f)]] = (rD[rG[A9(0x24f)]] || 0x0) + rH),
          rE[A9(0x462)]([rG, rH]);
      }
      if (rE[A9(0x28c)] === 0x0) {
        oj[A9(0xdd7)][A9(0xd71)] = A9(0x18e);
        return;
      }
      (oj[A9(0xdd7)][A9(0xd71)] = ""),
        rE[A9(0x582)]((rI, rJ) => {
          return nY(rI[0x0], rJ[0x0]);
        })[A9(0x96e)](([rI, rJ]) => {
          const Aa = A9,
            rK = nZ(rI);
          jY(rK), oP(rK[Aa(0x7e2)], rJ), ok[Aa(0x771)](rK);
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
            Ab(0xd66) + k9(rH) + "\x20" + rG + Ab(0x7b8) + hP[rG] + Ab(0x441)
          );
          rD[Ab(0x702)](rI);
        }
      }
      rF % 0x2 === 0x1 &&
        (rD[Ab(0x600)][0x0][Ab(0xdd7)][Ab(0x4e5)] = Ab(0xa51));
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
          Ac(0x2b8) + (or + 0x1) + Ac(0x9ef) + iJ(ot) + "/" + iJ(ou) + Ac(0x1de)
        );
      const rE = d6(or);
      of[Ac(0x12d)](0xc8 * rE),
        og[Ac(0x12d)](0x19 * rE),
        oh[Ac(0x12d)](d5(or)),
        (ow = Math[Ac(0x9dc)](0x1, ot / ou)),
        (oy = 0x0),
        (nJ[Ac(0xbda)](Ac(0x8d6))[Ac(0x729)] =
          or >= cH ? Ac(0x6d9) : Ac(0xe01) + (cH + 0x1) + Ac(0x724));
    }
    var oB = 0x0,
      oC = document[uf(0xbda)](uf(0xb08));
    for (let rD = 0x0; rD < cZ[uf(0x28c)]; rD++) {
      const [rE, rF] = cZ[rD],
        rG = j7[rE],
        rH = nA(
          uf(0x833) +
            hP[rG] +
            uf(0xd6e) +
            rG +
            uf(0x34c) +
            (rF + 0x1) +
            uf(0x35b)
        );
      (rH[uf(0x4a5)] = function () {
        const Ad = uf;
        if (or >= rF) {
          const rI = oC[Ad(0xbda)](Ad(0x6b0));
          rI && rI[Ad(0x3d4)][Ad(0x86e)](Ad(0xd77)),
            (oB = rD),
            (hD[Ad(0x193)] = rD),
            this[Ad(0x3d4)][Ad(0xa29)](Ad(0xd77));
        }
      }),
        (cZ[rD][uf(0x83c)] = rH),
        oC[uf(0x771)](rH);
    }
    function oD() {
      const Ae = uf,
        rI = parseInt(hD[Ae(0x193)]) || 0x0;
      cZ[0x0][Ae(0x83c)][Ae(0x58b)](),
        cZ[Ae(0x96e)]((rJ, rK) => {
          const Af = Ae,
            rL = rJ[0x1];
          if (or >= rL) {
            rJ[Af(0x83c)][Af(0x3d4)][Af(0x86e)](Af(0x720));
            if (rI === rK) rJ[Af(0x83c)][Af(0x58b)]();
          } else rJ[Af(0x83c)][Af(0x3d4)][Af(0xa29)](Af(0x720));
        });
    }
    var oE = document[uf(0xbda)](uf(0x5ff));
    setInterval(() => {
      const Ag = uf;
      if (!o6[Ag(0x3d4)][Ag(0x755)](Ag(0x230))) return;
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
          const rM = oG(rL, op[rL][Ah(0x91b)]);
          (rJ += rM), (rI += rM);
        }
        if (rJ > 0x0) {
          const rN = Math[Ah(0x9dc)](0x19, (rJ / rI) * 0x64),
            rO = rN > 0x1 ? rN[Ah(0x24a)](0x2) : rN[Ah(0x24a)](0x5);
          k8(oE, "+" + rO + "%");
        }
      }
    }
    function oG(rI, rJ) {
      const Ai = uf,
        rK = dC[rI];
      if (!rK) return 0x0;
      const rL = rK[Ai(0x24f)];
      return Math[Ai(0x695)](rL * 0xa, rL) * rJ;
    }
    var oH = document[uf(0xbda)](uf(0xcca));
    (oH[uf(0x4a5)] = function () {
      const Aj = uf;
      for (const rI in op) {
        const rJ = op[rI];
        rJ[Aj(0x6df)]();
      }
      oI();
    }),
      oI(),
      oA();
    function oI() {
      const Ak = uf,
        rI = Object[Ak(0xb74)](op);
      nI[Ak(0x3d4)][Ak(0x86e)](Ak(0xbe9));
      const rJ = rI[Ak(0x28c)] === 0x0;
      (oH[Ak(0xdd7)][Ak(0xd71)] = rJ ? Ak(0x18e) : ""), (oz = 0x0);
      let rK = 0x0;
      const rL = rI[Ak(0x28c)] > 0x1 ? 0x32 : 0x0;
      for (let rN = 0x0, rO = rI[Ak(0x28c)]; rN < rO; rN++) {
        const rP = rI[rN],
          rQ = (rN / rO) * Math["PI"] * 0x2;
        rP[Ak(0x5e7)](
          Math[Ak(0x68a)](rQ) * rL + 0x32,
          Math[Ak(0xa3a)](rQ) * rL + 0x32
        ),
          (oz += d3[rP["el"][Ak(0xb1a)][Ak(0x24f)]] * rP[Ak(0x91b)]);
      }
      nI[Ak(0x3d4)][rL ? Ak(0xa29) : Ak(0x86e)](Ak(0xbe9)),
        nH[Ak(0x3d4)][rI[Ak(0x28c)] > 0x0 ? Ak(0x86e) : Ak(0xa29)](Ak(0x63d));
      const rM = or >= cH;
      nJ[Ak(0x3d4)][rI[Ak(0x28c)] > 0x0 && rM ? Ak(0x86e) : Ak(0xa29)](
        Ak(0x720)
      ),
        oF(),
        (nI[Ak(0xdd7)][Ak(0x81c)] = ""),
        (nP = ![]),
        (nR = ![]),
        (nQ = 0x0),
        (ov = Math[Ak(0x9dc)](0x1, (ot + oz) / ou) || 0x0),
        k8(nN, oz > 0x0 ? "+" + iJ(oz) + Ak(0x1de) : "");
    }
    var oJ,
      oK = 0x0,
      oL = ![],
      oM = 0x0,
      oN = null;
    function oO() {
      const Al = uf;
      o2[Al(0x3d4)][oK < 0x5 ? Al(0xa29) : Al(0x86e)](Al(0x63d));
    }
    o2[uf(0x4a5)] = function () {
      const Am = uf;
      if (oL || !oJ || oK < 0x5 || !ik() || oN) return;
      (oL = !![]), (oM = 0x0), (oN = null), o2[Am(0x3d4)][Am(0xa29)](Am(0x63d));
      const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rI[Am(0x549)](0x0, cI[Am(0x336)]),
        rI[Am(0x616)](0x1, oJ["id"]),
        rI[Am(0x596)](0x3, oK),
        il(rI);
    };
    function oP(rI, rJ) {
      k8(rI, "x" + iJ(rJ));
    }
    function oQ(rI) {
      const An = uf;
      typeof rI === An(0xdde) && (rI = nr(rI)), k8(o3, rI + An(0x67f));
    }
    function oR(rI) {
      const Ao = uf;
      oJ && mQ(oJ["id"], oK);
      o5 && o5[Ao(0x58b)]();
      (oJ = rI), (oK = 0x0), oO();
      for (let rJ = 0x0; rJ < o4[Ao(0x28c)]; rJ++) {
        o4[rJ][Ao(0x33e)]();
      }
      oJ
        ? (oQ(dE[oJ[Ao(0x24f)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (o2[Ao(0xdd7)][Ao(0x16a)] = hQ[oJ[Ao(0x24f)] + 0x1]))
        : oQ("?");
    }
    var oS = 0x0,
      oT = 0x1;
    function oU(rI) {
      const Ap = uf,
        rJ = dC[rI],
        rK = nZ(rJ);
      (rK[Ap(0x6f0)] = pc), jY(rK), (rK[Ap(0x9f7)] = !![]), nT[Ap(0x771)](rK);
      const rL = nZ(rJ);
      jY(rL), (rL[Ap(0x6f0)] = o6);
      rJ[Ap(0x24f)] >= dc && rL[Ap(0x3d4)][Ap(0xa29)](Ap(0x60d));
      rL[Ap(0x4a5)] = function () {
        const Aq = Ap;
        pz - oS < 0x1f4 ? oT++ : (oT = 0x1);
        oS = pz;
        if (oc) {
          if (oL || rJ[Aq(0x24f)] >= dc) return;
          const rP = iS[rJ["id"]];
          if (!rP) return;
          oJ !== rJ && oR(rJ);
          const rQ = o4[Aq(0x28c)];
          let rR = p9 ? rP : Math[Aq(0x9dc)](rQ * oT, rP);
          mQ(rJ["id"], -rR), (oK += rR), oO();
          let rS = rR % rQ,
            rT = (rR - rS) / rQ;
          const rU = [...o4][Aq(0x582)](
            (rW, rX) => rW[Aq(0x91b)] - rX[Aq(0x91b)]
          );
          rT > 0x0 && rU[Aq(0x96e)]((rW) => rW[Aq(0x46f)](rT));
          let rV = 0x0;
          while (rS--) {
            const rW = rU[rV];
            (rV = (rV + 0x1) % rQ), rW[Aq(0x46f)](0x1);
          }
          return;
        }
        if (!op[rJ["id"]]) {
          const rX = nZ(rJ, ![]);
          k8(rX[Aq(0x7e2)], "x1"),
            (rX[Aq(0x4a5)] = function (rZ) {
              const Ar = Aq;
              rY[Ar(0x6df)](), oI();
            }),
            nI[Aq(0x771)](rX);
          const rY = {
            petal: rJ,
            count: 0x0,
            el: rX,
            setPos(rZ, s0) {
              const As = Aq;
              (rX[As(0xdd7)][As(0x59b)] = rZ + "%"),
                (rX[As(0xdd7)][As(0x525)] = s0 + "%"),
                (rX[As(0xdd7)][As(0x251)] = As(0xc6c));
            },
            dispose(rZ = !![]) {
              const At = Aq;
              rX[At(0x86e)](),
                rZ && mQ(rJ["id"], this[At(0x91b)]),
                delete op[rJ["id"]];
            },
          };
          (op[rJ["id"]] = rY), oI();
        }
        const rO = op[rJ["id"]];
        if (iS[rJ["id"]]) {
          const rZ = iS[rJ["id"]],
            s0 = p9 ? rZ : Math[Aq(0x9dc)](0x1 * oT, rZ);
          (rO[Aq(0x91b)] += s0),
            mQ(rJ["id"], -s0),
            oP(rO["el"][Aq(0x7e2)], rO[Aq(0x91b)]);
        }
        oI();
      };
      const rM = dH * rJ[Ap(0x959)] + rJ[Ap(0xced)],
        rN = nS[rM];
      return (
        nG[Ap(0xc50)](rL, rN),
        rN[Ap(0x86e)](),
        (nS[rM] = rL),
        (rK[Ap(0x717)] = function (rO) {
          const Au = Ap;
          oP(rK[Au(0x7e2)], rO), oP(rL[Au(0x7e2)], rO);
        }),
        (rK[Ap(0x5e5)] = rL),
        (nU[rI] = rK),
        (rK[Ap(0x6df)] = function () {
          const Av = Ap;
          rK[Av(0x86e)](), delete nU[rI];
          const rO = nA(Av(0xc0e));
          (nS[rM] = rO), nG[Av(0xc50)](rO, rL), rL[Av(0x86e)]();
        }),
        rK[Ap(0x717)](iS[rI]),
        rK
      );
    }
    var oV = {},
      oW = {};
    function oX(rI, rJ, rK, rL) {
      const Aw = uf,
        rM = document[Aw(0xbda)](rK);
      (rM[Aw(0x4eb)] = function () {
        const Ax = Aw;
        (oV[rI] = this[Ax(0x850)]),
          (hD[rI] = this[Ax(0x850)] ? "1" : "0"),
          rL && rL(this[Ax(0x850)]);
      }),
        (oW[rI] = function () {
          const Ay = Aw;
          rM[Ay(0x58b)]();
        }),
        (rM[Aw(0x850)] = hD[rI] === void 0x0 ? rJ : hD[rI] === "1"),
        rM[Aw(0x4eb)]();
    }
    var oY = document[uf(0xbda)](uf(0x7d4));
    (oY[uf(0xb1a)] = function () {
      const Az = uf;
      return nA(
        Az(0x41b) + hP[Az(0x16d)] + Az(0x3e4) + hP[Az(0x3f4)] + Az(0xb73)
      );
    }),
      oX(uf(0x6ab), ![], uf(0x439), mq),
      oX(uf(0x8d5), !![], uf(0x1e1)),
      oX(uf(0x6ae), !![], uf(0x5bf)),
      oX(
        uf(0x886),
        !![],
        uf(0xc73),
        (rI) => (kK[uf(0xdd7)][uf(0xd71)] = rI ? "" : uf(0x18e))
      ),
      oX(uf(0xb1e), ![], uf(0xa19)),
      oX(uf(0x794), ![], uf(0x363)),
      oX(uf(0x539), ![], uf(0x65e)),
      oX(uf(0x6d6), !![], uf(0x4e6)),
      oX(
        uf(0x31a),
        !![],
        uf(0xb77),
        (rI) => (oY[uf(0xdd7)][uf(0xd71)] = rI ? "" : uf(0x18e))
      ),
      oX(uf(0xc5d), ![], uf(0xd0c), kT),
      oX(uf(0x9ea), ![], uf(0x5c9), kX),
      oX(uf(0xdbf), ![], uf(0x4cd), (rI) => oZ(ko, uf(0x29d), rI)),
      oX(uf(0x87f), !![], uf(0xa5d), (rI) =>
        oZ(document[uf(0xde9)], uf(0x374), !rI)
      ),
      oX(uf(0xcd8), !![], uf(0x153), (rI) =>
        oZ(document[uf(0xde9)], uf(0x19a), !rI)
      ),
      oX(uf(0x100), !![], uf(0x35a));
    function oZ(rI, rJ, rK) {
      const AA = uf;
      rI[AA(0x3d4)][rK ? AA(0xa29) : AA(0x86e)](rJ);
    }
    function p0() {
      const AB = uf,
        rI = document[AB(0xbda)](AB(0x476)),
        rJ = [];
      for (let rL = 0x0; rL <= 0xa; rL++) {
        rJ[AB(0x462)](0x1 - rL * 0.05);
      }
      for (const rM of rJ) {
        const rN = nA(AB(0x380) + rM + "\x22>" + nr(rM * 0x64) + AB(0x97f));
        rI[AB(0x771)](rN);
      }
      let rK = parseFloat(hD[AB(0xdfe)]);
      (isNaN(rK) || !rJ[AB(0x9ae)](rK)) && (rK = rJ[0x0]),
        (rI[AB(0x6f1)] = rK),
        (kP = rK),
        (rI[AB(0x4eb)] = function () {
          const AC = AB;
          (kP = parseFloat(this[AC(0x6f1)])),
            (hD[AC(0xdfe)] = this[AC(0x6f1)]),
            kX();
        });
    }
    p0();
    var p1 = document[uf(0xbda)](uf(0xccd)),
      p2 = document[uf(0xbda)](uf(0xb9e));
    p2[uf(0xa59)] = cL;
    var p3 = document[uf(0xbda)](uf(0x1db));
    function p4(rI) {
      const AD = uf,
        rJ = nA(AD(0xd2b));
      kl[AD(0x771)](rJ);
      const rK = rJ[AD(0xbda)](AD(0x36c));
      rK[AD(0x6f1)] = rI;
      const rL = rJ[AD(0xbda)](AD(0x2e9));
      (rL[AD(0x4eb)] = function () {
        const AE = AD;
        rK[AE(0x344)] = this[AE(0x850)] ? AE(0x54f) : AE(0x76f);
      }),
        (rJ[AD(0xbda)](AD(0x7f5))[AD(0x4a5)] = function () {
          const AF = AD;
          jp(rI), hc(AF(0x3c2));
        }),
        (rJ[AD(0xbda)](AD(0x3c5))[AD(0x4a5)] = function () {
          const AG = AD,
            rM = {};
          rM[AG(0x344)] = AG(0x7c8);
          const rN = new Blob([rI], rM),
            rO = document[AG(0x9bf)]("a");
          (rO[AG(0x87c)] = URL[AG(0x3e9)](rN)),
            (rO[AG(0x90f)] = (jv ? jv : AG(0x78c)) + AG(0x4ba)),
            rO[AG(0x58b)](),
            hc(AG(0xa3d));
        }),
        (rJ[AD(0xbda)](AD(0x5c4))[AD(0x4a5)] = function () {
          const AH = AD;
          rJ[AH(0x86e)]();
        });
    }
    function p5() {
      const AI = uf,
        rI = nA(AI(0xbfa));
      kl[AI(0x771)](rI);
      const rJ = rI[AI(0xbda)](AI(0x36c)),
        rK = rI[AI(0xbda)](AI(0x2e9));
      (rK[AI(0x4eb)] = function () {
        const AJ = AI;
        rJ[AJ(0x344)] = this[AJ(0x850)] ? AJ(0x54f) : AJ(0x76f);
      }),
        (rI[AI(0xbda)](AI(0x5c4))[AI(0x4a5)] = function () {
          const AK = AI;
          rI[AK(0x86e)]();
        }),
        (rI[AI(0xbda)](AI(0xa1d))[AI(0x4a5)] = function () {
          const AL = AI,
            rL = rJ[AL(0x6f1)][AL(0x55e)]();
          if (eV(rL)) {
            delete hD[AL(0xc3c)], (hD[AL(0x9a8)] = rL);
            if (hU)
              try {
                hU[AL(0x436)]();
              } catch (rM) {}
            hc(AL(0xc40));
          } else hc(AL(0x285));
        });
    }
    (document[uf(0xbda)](uf(0x520))[uf(0x4a5)] = function () {
      const AM = uf;
      if (i5) {
        p4(i5);
        return;
        const rI = prompt(AM(0x2cf), i5);
        if (rI !== null) {
          const rJ = {};
          rJ[AM(0x344)] = AM(0x7c8);
          const rK = new Blob([i5], rJ),
            rL = document[AM(0x9bf)]("a");
          (rL[AM(0x87c)] = URL[AM(0x3e9)](rK)),
            (rL[AM(0x90f)] = jv + AM(0xbe5)),
            rL[AM(0x58b)](),
            alert(AM(0x887));
        }
      }
    }),
      (document[uf(0xbda)](uf(0xc32))[uf(0x4a5)] = function () {
        const AN = uf;
        p5();
        return;
        const rI = prompt(AN(0xc45));
        if (rI !== null) {
          if (eV(rI)) {
            let rJ = AN(0xddd);
            i6 && (rJ += AN(0x3b9));
            if (confirm(rJ)) {
              delete hD[AN(0xc3c)], (hD[AN(0x9a8)] = rI);
              if (hU)
                try {
                  hU[AN(0x436)]();
                } catch (rK) {}
            }
          } else alert(AN(0x285));
        }
      }),
      oX(uf(0x973), ![], uf(0x411), (rI) =>
        p2[uf(0x3d4)][rI ? uf(0xa29) : uf(0x86e)](uf(0x837))
      ),
      oX(uf(0x282), !![], uf(0x398));
    var p6 = 0x0,
      p7 = 0x0,
      p8 = 0x0,
      p9 = ![];
    function pa(rI, rJ) {
      const AO = uf;
      (rI === AO(0xa27) || rI === AO(0x40a)) && (p9 = rJ);
      if (rJ) {
        switch (rI) {
          case AO(0x3d1):
            m1[AO(0xa10)][AO(0x466)]();
            break;
          case AO(0xd83):
            m1[AO(0x4b4)][AO(0x466)]();
            break;
          case AO(0x101):
            m1[AO(0xd68)][AO(0x466)]();
            break;
          case AO(0x95d):
            pM[AO(0x3d4)][AO(0x466)](AO(0xd77));
            break;
          case AO(0x351):
            oW[AO(0xb1e)](), hc(AO(0x712) + (oV[AO(0xb1e)] ? "ON" : AO(0xb28)));
            break;
          case AO(0x302):
            oW[AO(0x794)](), hc(AO(0xa7c) + (oV[AO(0x794)] ? "ON" : AO(0xb28)));
            break;
          case AO(0xdcc):
            oW[AO(0x886)](), hc(AO(0x1f3) + (oV[AO(0x886)] ? "ON" : AO(0xb28)));
            break;
          case AO(0x7d8):
            oW[AO(0x539)](), hc(AO(0x819) + (oV[AO(0x539)] ? "ON" : AO(0xb28)));
            break;
          case AO(0xdd2):
            if (!mt && hW) {
              const rK = nk[AO(0xddf)](AO(0x94e)),
                rL = nl[AO(0xddf)](AO(0x94e));
              for (let rM = 0x0; rM < rK[AO(0x28c)]; rM++) {
                const rN = rK[rM],
                  rO = rL[rM],
                  rP = mT(rN),
                  rQ = mT(rO);
                if (rP) mU(rP, rO);
                else rQ && mU(rQ, rN);
              }
              il(new Uint8Array([cI[AO(0x623)]]));
            }
            break;
          default:
            if (!mt && hW && rI[AO(0x904)](AO(0x1aa)))
              rY: {
                let rR = parseInt(rI[AO(0x471)](0x5));
                if (n8[AO(0xdcc)]) {
                  p9 ? ku(rR) : kx(rR);
                  break rY;
                }
                rR === 0x0 && (rR = 0xa);
                iN > 0xa && p9 && (rR += 0xa);
                rR--;
                if (rR >= 0x0) {
                  const rS = nk[AO(0xddf)](AO(0x94e))[rR],
                    rT = nl[AO(0xddf)](AO(0x94e))[rR];
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
        rI === AO(0x312) &&
          (kk[AO(0xdd7)][AO(0xd71)] === "" &&
          p2[AO(0xdd7)][AO(0xd71)] === AO(0x18e)
            ? kD[AO(0x58b)]()
            : p2[AO(0x218)]()),
          delete n8[rI];
      if (iy) {
        if (oV[AO(0x6ab)]) {
          let rW = 0x0,
            rX = 0x0;
          if (n8[AO(0xdd4)] || n8[AO(0x8c7)]) rX = -0x1;
          else (n8[AO(0xb5a)] || n8[AO(0x18a)]) && (rX = 0x1);
          if (n8[AO(0xbb4)] || n8[AO(0xaf4)]) rW = -0x1;
          else (n8[AO(0x42f)] || n8[AO(0x254)]) && (rW = 0x1);
          if (rW !== 0x0 || rX !== 0x0)
            (p6 = Math[AO(0x22b)](rX, rW)), im(p6, 0x1);
          else (p7 !== 0x0 || p8 !== 0x0) && im(p6, 0x0);
          (p7 = rW), (p8 = rX);
        }
        pb();
      }
    }
    function pb() {
      const AP = uf,
        rI = n8[AP(0x338)] || n8[AP(0x40a)] || n8[AP(0xa27)],
        rJ = n8[AP(0x778)] || n8[AP(0xc58)],
        rK = (rI << 0x1) | rJ;
      mV !== rK && ((mV = rK), il(new Uint8Array([cI[AP(0xdc5)], rK])));
    }
    var pc = document[uf(0xbda)](uf(0xbcd)),
      pd = 0x0,
      pe = 0x0,
      pf = 0x0;
    function pg(rI, rJ, rK) {
      const AQ = uf;
      return rI + (rJ - rI) * Math[AQ(0x9dc)](0x1, pA / rK);
    }
    var ph = 0x1,
      pi = [];
    for (let rI in cS) {
      if (
        [uf(0xa98), uf(0x7c0), uf(0x4fd), uf(0x584), uf(0x6e5), uf(0x5a3)][
          uf(0x9ae)
        ](rI)
      )
        continue;
      pi[uf(0x462)](cS[rI]);
    }
    var pj = [];
    for (let rJ = 0x0; rJ < 0x1e; rJ++) {
      pk();
    }
    function pk(rK = !![]) {
      const AR = uf,
        rL = new lG(
          -0x1,
          pi[Math[AR(0x61d)](Math[AR(0x50e)]() * pi[AR(0x28c)])],
          0x0,
          Math[AR(0x50e)]() * d1,
          Math[AR(0x50e)]() * 6.28
        );
      if (!rL[AR(0x558)] && Math[AR(0x50e)]() < 0.01) rL[AR(0x806)] = !![];
      rL[AR(0x558)]
        ? (rL[AR(0x9ac)] = rL[AR(0xd48)] = Math[AR(0x50e)]() * 0x8 + 0xc)
        : (rL[AR(0x9ac)] = rL[AR(0xd48)] = Math[AR(0x50e)]() * 0x1e + 0x19),
        rK
          ? (rL["x"] = Math[AR(0x50e)]() * d0)
          : (rL["x"] = -rL[AR(0xd48)] * 0x2),
        (rL[AR(0x667)] =
          (Math[AR(0x50e)]() * 0x3 + 0x4) * rL[AR(0x9ac)] * 0.02),
        (rL[AR(0x105)] = (Math[AR(0x50e)]() * 0x2 - 0x1) * 0.05),
        pj[AR(0x462)](rL);
    }
    var pl = 0x0,
      pm = 0x0,
      pn = 0x0,
      po = 0x0;
    setInterval(function () {
      const AS = uf,
        rK = [ki, qe, ...Object[AS(0xb74)](pp), ...nx],
        rL = rK[AS(0x28c)];
      let rM = 0x0;
      for (let rN = 0x0; rN < rL; rN++) {
        const rO = rK[rN];
        rM += rO[AS(0x662)] * rO[AS(0x645)];
      }
      kK[AS(0x654)](
        AS(0xaaa),
        Math[AS(0x7cc)](0x3e8 / pA) +
          AS(0x9b7) +
          iw[AS(0x28c)] +
          AS(0x122) +
          rL +
          AS(0xc8e) +
          iJ(rM) +
          AS(0x48c) +
          (po / 0x3e8)[AS(0x24a)](0x2) +
          AS(0xdc9)
      ),
        (po = 0x0);
    }, 0x3e8);
    var pp = {};
    function pq(rK, rL, rM, rN, rO, rP = ![]) {
      const AT = uf;
      if (!pp[rL]) {
        const rS = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[AT(0x9bf)](AT(0x297));
        (rS[AT(0xa13)] = rS[AT(0xd84)]("2d")),
          (rS[AT(0xf8)] = 0x0),
          (rS[AT(0x841)] = rM),
          (rS[AT(0x2f0)] = rN),
          (pp[rL] = rS);
      }
      const rQ = pp[rL],
        rR = rQ[AT(0xa13)];
      if (pz - rQ[AT(0xf8)] > 0x1f4) {
        rQ[AT(0xf8)] = pz;
        const rT = rK[AT(0x86c)](),
          rU = Math[AT(0x5b5)](rT["a"], rT["b"]) * 1.5,
          rV = kW * rU,
          rW = Math[AT(0x48b)](rQ[AT(0x841)] * rV) || 0x1;
        rW !== rQ["w"] &&
          ((rQ["w"] = rW),
          (rQ[AT(0x662)] = rW),
          (rQ[AT(0x645)] = Math[AT(0x48b)](rQ[AT(0x2f0)] * rV) || 0x1),
          rR[AT(0x96f)](),
          rR[AT(0x37a)](rV, rV),
          rO(rR),
          rR[AT(0x416)]());
      }
      rQ[AT(0x45a)] = !![];
      if (rP) return rQ;
      rK[AT(0x277)](
        rQ,
        -rQ[AT(0x841)] / 0x2,
        -rQ[AT(0x2f0)] / 0x2,
        rQ[AT(0x841)],
        rQ[AT(0x2f0)]
      );
    }
    var pr = /^((?!chrome|android).)*safari/i[uf(0x21d)](navigator[uf(0x266)]),
      ps = pr ? 0.25 : 0x0;
    function pt(rK, rL, rM = 0x14, rN = uf(0x910), rO = 0x4, rP, rQ = "") {
      const AU = uf,
        rR = AU(0x947) + rM + AU(0xa2d) + iA;
      let rS, rT;
      const rU = rL + "_" + rR + "_" + rN + "_" + rO + "_" + rQ,
        rV = pp[rU];
      if (!rV) {
        rK[AU(0xb4e)] = rR;
        const rW = rK[AU(0x9fa)](rL);
        (rS = rW[AU(0x662)] + rO), (rT = rM + rO);
      } else (rS = rV[AU(0x841)]), (rT = rV[AU(0x2f0)]);
      return pq(
        rK,
        rU,
        rS,
        rT,
        function (rX) {
          const AV = AU;
          rX[AV(0x5df)](rO / 0x2, rO / 0x2 - rT * ps),
            (rX[AV(0xb4e)] = rR),
            (rX[AV(0x78d)] = AV(0x525)),
            (rX[AV(0x974)] = AV(0x59b)),
            (rX[AV(0xd87)] = rO),
            (rX[AV(0x20a)] = AV(0x3fd)),
            (rX[AV(0x632)] = rN),
            rO > 0x0 && rX[AV(0x5d1)](rL, 0x0, 0x0),
            rX[AV(0x437)](rL, 0x0, 0x0);
        },
        rP
      );
    }
    var pu = 0x1;
    function pv(rK = cI[uf(0xa08)]) {
      const AW = uf,
        rL = Object[AW(0xb74)](op),
        rM = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rL[AW(0x28c)] * (0x2 + 0x4))
        );
      let rN = 0x0;
      rM[AW(0x549)](rN++, rK), rM[AW(0x616)](rN, rL[AW(0x28c)]), (rN += 0x2);
      for (let rO = 0x0; rO < rL[AW(0x28c)]; rO++) {
        const rP = rL[rO];
        rM[AW(0x616)](rN, rP[AW(0xb1a)]["id"]),
          (rN += 0x2),
          rM[AW(0x596)](rN, rP[AW(0x91b)]),
          (rN += 0x4);
      }
      il(rM);
    }
    function pw() {
      const AX = uf;
      o5[AX(0x86e)](), o1[AX(0x3d4)][AX(0x86e)](AX(0xc15)), (o5 = null);
    }
    var px = [];
    function py() {
      const AY = uf;
      for (let rK = 0x0; rK < px[AY(0x28c)]; rK++) {
        const rL = px[rK],
          rM = rL[AY(0x236)],
          rN = rM && !rM[AY(0x3dc)];
        rN
          ? ((rL[AY(0x3dc)] = ![]),
            (rL[AY(0xba7)] = rM[AY(0xba7)]),
            (rL[AY(0xd6c)] = rM[AY(0xd6c)]),
            (rL[AY(0x320)] = rM[AY(0x320)]),
            (rL[AY(0x1eb)] = rM[AY(0x1eb)]),
            (rL[AY(0x928)] = rM[AY(0x928)]),
            (rL[AY(0x81b)] = rM[AY(0x81b)]),
            (rL[AY(0x5f5)] = rM[AY(0x5f5)]),
            (rL[AY(0x739)] = rM[AY(0x739)]),
            (rL[AY(0x5ef)] = rM[AY(0x5ef)]),
            (rL[AY(0xbcf)] = rM[AY(0xbcf)]),
            (rL[AY(0x45c)] = rM[AY(0x45c)]),
            (rL[AY(0x263)] = rM[AY(0x263)]),
            (rL[AY(0xa90)] = rM[AY(0xa90)]),
            (rL[AY(0xcaa)] = rM[AY(0xcaa)]),
            (rL[AY(0xa6c)] = rM[AY(0xa6c)]),
            j0(rL, rM))
          : ((rL[AY(0x3dc)] = !![]),
            (rL[AY(0x2e4)] = 0x0),
            (rL[AY(0xd6c)] = 0x1),
            (rL[AY(0xba7)] = 0x0),
            (rL[AY(0x320)] = ![]),
            (rL[AY(0x1eb)] = 0x0),
            (rL[AY(0x928)] = 0x0),
            (rL[AY(0x5f5)] = pg(rL[AY(0x5f5)], 0x0, 0xc8)),
            (rL[AY(0x81b)] = pg(rL[AY(0x81b)], 0x0, 0xc8)),
            (rL[AY(0xa6c)] = pg(rL[AY(0xa6c)], 0x0, 0xc8)));
        if (rK > 0x0) {
          if (rM) {
            const rO = Math[AY(0x22b)](rM["y"] - pe, rM["x"] - pd);
            rL[AY(0xbde)] === void 0x0
              ? (rL[AY(0xbde)] = rO)
              : (rL[AY(0xbde)] = f8(rL[AY(0xbde)], rO, 0.1));
          }
          rL[AY(0x2f3)] += ((rN ? -0x1 : 0x1) * pA) / 0x320;
          if (rL[AY(0x2f3)] < 0x0) rL[AY(0x2f3)] = 0x0;
          rL[AY(0x2f3)] > 0x1 && px[AY(0x27c)](rK, 0x1);
        }
      }
    }
    var pz = Date[uf(0x160)](),
      pA = 0x0,
      pB = 0x0,
      pC = pz;
    function pD() {
      const AZ = uf;
      (pz = Date[AZ(0x160)]()),
        (pA = pz - pC),
        (pC = pz),
        (pB = pA / 0x21),
        hd();
      let rK = 0x0;
      for (let rM = jX[AZ(0x28c)] - 0x1; rM >= 0x0; rM--) {
        const rN = jX[rM];
        if (!rN[AZ(0xa61)]) jX[AZ(0x27c)](rM, 0x1);
        else {
          if (
            (rN[AZ(0x6f0)] &&
              !rN[AZ(0x6f0)][AZ(0x3d4)][AZ(0x755)](AZ(0x230))) ||
            rN[AZ(0x516)][AZ(0xdd7)][AZ(0xd71)] === AZ(0x18e)
          )
            continue;
          else {
            jX[AZ(0x27c)](rM, 0x1), rN[AZ(0x3d4)][AZ(0x86e)](AZ(0x942)), rK++;
            if (rK >= 0x14) break;
          }
        }
      }
      (pE[AZ(0x236)] = iy), py();
      kC[AZ(0x3d4)][AZ(0x755)](AZ(0x230)) && (lL = pz);
      if (hv) {
        const rO = pz / 0x50,
          rP = Math[AZ(0xa3a)](rO) * 0x7,
          rQ = Math[AZ(0x10d)](Math[AZ(0xa3a)](rO / 0x4)) * 0.15 + 0.85;
        hu[AZ(0xdd7)][AZ(0x81c)] = AZ(0x4c7) + rP + AZ(0xdb4) + rQ + ")";
      } else hu[AZ(0xdd7)][AZ(0x81c)] = AZ(0x18e);
      for (let rR = jc[AZ(0x28c)] - 0x1; rR >= 0x0; rR--) {
        const rS = jc[rR];
        if (rS[AZ(0x9cc)]) {
          jc[AZ(0x27c)](rR, 0x1);
          continue;
        }
        rS[AZ(0x1af)]();
      }
      for (let rT = nx[AZ(0x28c)] - 0x1; rT >= 0x0; rT--) {
        const rU = nx[rT];
        if (!rU[AZ(0xa61)]) {
          nx[AZ(0x27c)](rT, 0x1);
          continue;
        }
        rU[AZ(0x364)]();
      }
      for (let rV = jb[AZ(0x28c)] - 0x1; rV >= 0x0; rV--) {
        const rW = jb[rV];
        rW[AZ(0x9cc)] &&
          rW["t"] <= 0x0 &&
          (rW[AZ(0x86e)](), jb[AZ(0x27c)](rV, 0x1)),
          (rW["t"] += ((rW[AZ(0x9cc)] ? -0x1 : 0x1) * pA) / rW[AZ(0x377)]),
          (rW["t"] = Math[AZ(0x9dc)](0x1, Math[AZ(0x8ab)](0x0, rW["t"]))),
          rW[AZ(0x364)]();
      }
      for (let rX = mN[AZ(0x28c)] - 0x1; rX >= 0x0; rX--) {
        const rY = mN[rX];
        if (!rY["el"][AZ(0xa61)]) rY[AZ(0x169)] = ![];
        (rY[AZ(0xb02)] += ((rY[AZ(0x169)] ? 0x1 : -0x1) * pA) / 0xc8),
          (rY[AZ(0xb02)] = Math[AZ(0x9dc)](
            0x1,
            Math[AZ(0x8ab)](rY[AZ(0xb02)])
          ));
        if (!rY[AZ(0x169)] && rY[AZ(0xb02)] <= 0x0) {
          mN[AZ(0x27c)](rX, 0x1), rY[AZ(0x86e)]();
          continue;
        }
        rY[AZ(0xdd7)][AZ(0x663)] = rY[AZ(0xb02)];
      }
      if (oL) {
        oM += pA / 0x7d0;
        if (oM > 0x1) {
          oM = 0x0;
          if (oN) {
            oL = ![];
            const rZ = oJ[AZ(0x4bb)],
              s0 = oN[AZ(0x6f9)];
            if (oN[AZ(0xd02)] > 0x0)
              o4[AZ(0x96e)]((s1) => s1[AZ(0x33e)]()),
                mQ(oJ["id"], s0),
                (oK = 0x0),
                oQ("?"),
                o1[AZ(0x3d4)][AZ(0xa29)](AZ(0xc15)),
                (o5 = nZ(rZ)),
                o1[AZ(0x771)](o5),
                oP(o5[AZ(0x7e2)], oN[AZ(0xd02)]),
                (o5[AZ(0x4a5)] = function () {
                  const B0 = AZ;
                  mQ(rZ["id"], oN[B0(0xd02)]), pw(), (oN = null);
                });
            else {
              oK = s0;
              const s1 = [...o4][AZ(0x582)](() => Math[AZ(0x50e)]() - 0.5);
              for (let s2 = 0x0, s3 = s1[AZ(0x28c)]; s2 < s3; s2++) {
                const s4 = s1[s2];
                s2 >= s0 ? s4[AZ(0x33e)]() : s4[AZ(0x46f)](0x1 - s4[AZ(0x91b)]);
              }
              oN = null;
            }
            oO();
          }
        }
      }
      for (let s5 = 0x0; s5 < o4[AZ(0x28c)]; s5++) {
        o4[s5][AZ(0x636)](oM);
      }
      for (let s6 in n4) {
        const s7 = n4[s6];
        if (!s7) {
          delete n4[s6];
          continue;
        }
        for (let s8 = s7[AZ(0x28c)] - 0x1; s8 >= 0x0; s8--) {
          const s9 = s7[s8];
          s9["t"] += pA;
          if (s9[AZ(0x5c0)]) s9["t"] > lX && s7[AZ(0x27c)](s8, 0x1);
          else {
            if (s9["t"] > lU) {
              const sa = 0x1 - Math[AZ(0x9dc)](0x1, (s9["t"] - lU) / 0x7d0);
              (s9[AZ(0xdd7)][AZ(0x663)] = sa),
                sa <= 0x0 && s7[AZ(0x27c)](s8, 0x1);
            }
          }
        }
        s7[AZ(0x28c)] === 0x0 && delete n4[s6];
      }
      if (nP)
        su: {
          if (ik()) {
            (nQ += pA),
              (nI[AZ(0xdd7)][AZ(0x81c)] =
                AZ(0x725) +
                (Math[AZ(0xa3a)](Date[AZ(0x160)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (nQ > 0x3e8) {
              if (nR) {
                pv(cI[AZ(0xd76)]), m0(![]);
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
                  const sf = nl[AZ(0x600)][se];
                  sf[AZ(0x8cd)] += sc;
                }
                const sd = nl[AZ(0x4ae)][AZ(0x8cd)] + 0x1;
                for (let sg = 0x0; sg < sc; sg++) {
                  const sh = nA(AZ(0xc0d));
                  (sh[AZ(0x8cd)] = iN + sg), nk[AZ(0x771)](sh);
                  const si = nA(AZ(0xc0d));
                  (si[AZ(0x8cd)] = sd + sg),
                    si[AZ(0x771)](
                      nA(AZ(0x5d4) + ((sh[AZ(0x8cd)] + 0x1) % 0xa) + AZ(0x82a))
                    ),
                    nl[AZ(0x771)](si);
                }
                (iN = sb), (iO = iN * 0x2);
              }
            }
          } else (nP = ![]), (nR = ![]), (nQ = 0x0);
        }
      (oy = pg(oy, ow, 0x64)),
        (ox = pg(ox, ov, 0x64)),
        (nL[AZ(0xdd7)][AZ(0x662)] = oy * 0x64 + "%"),
        (nM[AZ(0xdd7)][AZ(0x662)] = ox * 0x64 + "%");
      for (let sj in pp) {
        !pp[sj][AZ(0x45a)] ? delete pp[sj] : (pp[sj][AZ(0x45a)] = ![]);
      }
      (mW = pg(mW, mY, 0x32)), (mX = pg(mX, mZ, 0x32));
      const rL = Math[AZ(0x9dc)](0x64, pA) / 0x3c;
      pG -= 0x3 * rL;
      for (let sk = pj[AZ(0x28c)] - 0x1; sk >= 0x0; sk--) {
        const sl = pj[sk];
        (sl["x"] += sl[AZ(0x667)] * rL),
          (sl["y"] += Math[AZ(0xa3a)](sl[AZ(0xcaa)] * 0x2) * 0.8 * rL),
          (sl[AZ(0xcaa)] += sl[AZ(0x105)] * rL),
          (sl[AZ(0xa90)] += 0.002 * pA),
          (sl[AZ(0xca9)] = !![]);
        const sm = sl[AZ(0xd48)] * 0x2;
        (sl["x"] >= d0 + sm || sl["y"] < -sm || sl["y"] >= d1 + sm) &&
          (pj[AZ(0x27c)](sk, 0x1), pk(![]));
      }
      for (let sn = 0x0; sn < iG[AZ(0x28c)]; sn++) {
        iG[sn][AZ(0x364)]();
      }
      pf = Math[AZ(0x8ab)](0x0, pf - pA / 0x12c);
      if (oV[AZ(0x8d5)] && pf > 0x0) {
        const so = Math[AZ(0x50e)]() * 0x2 * Math["PI"],
          sp = pf * 0x3;
        (qu = Math[AZ(0x68a)](so) * sp), (qv = Math[AZ(0xa3a)](so) * sp);
      } else (qu = 0x0), (qv = 0x0);
      (ph = pg(ph, pu, 0xc8)), (n1 = pg(n1, n0, 0x64));
      for (let sq = ms[AZ(0x28c)] - 0x1; sq >= 0x0; sq--) {
        const sr = ms[sq];
        sr[AZ(0x364)](), sr[AZ(0x535)] && ms[AZ(0x27c)](sq, 0x1);
      }
      for (let ss = iw[AZ(0x28c)] - 0x1; ss >= 0x0; ss--) {
        const st = iw[ss];
        st[AZ(0x364)](),
          st[AZ(0x3dc)] && st[AZ(0x2e4)] > 0x1 && iw[AZ(0x27c)](ss, 0x1);
      }
      iy && ((pd = iy["x"]), (pe = iy["y"])), qs(), window[AZ(0xcad)](pD);
    }
    var pE = pF();
    function pF() {
      const B1 = uf,
        rK = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[B1(0x220)], 0x19);
      return (rK[B1(0x2f3)] = 0x1), rK;
    }
    var pG = 0x0,
      pH = [uf(0x6b4), uf(0xa5e), uf(0x130)],
      pI = [];
    for (let rK = 0x0; rK < 0x3; rK++) {
      for (let rL = 0x0; rL < 0x3; rL++) {
        const rM = pJ(pH[rK], 0x1 - 0.05 * rL);
        pI[uf(0x462)](rM);
      }
    }
    function pJ(rN, rO) {
      const B2 = uf;
      return pK(hA(rN)[B2(0x196)]((rP) => rP * rO));
    }
    function pK(rN) {
      const B3 = uf;
      return rN[B3(0x8d9)](
        (rO, rP) => rO + parseInt(rP)[B3(0x7e3)](0x10)[B3(0xb67)](0x2, "0"),
        "#"
      );
    }
    function pL(rN) {
      const B4 = uf;
      return B4(0x1f9) + rN[B4(0x4d3)](",") + ")";
    }
    var pM = document[uf(0xbda)](uf(0x804));
    function pN() {
      const B5 = uf,
        rN = document[B5(0x9bf)](B5(0x297));
      rN[B5(0x662)] = rN[B5(0x645)] = 0x3;
      const rO = rN[B5(0xd84)]("2d");
      for (let rP = 0x0; rP < pI[B5(0x28c)]; rP++) {
        const rQ = rP % 0x3,
          rR = (rP - rQ) / 0x3;
        (rO[B5(0x632)] = pI[rP]), rO[B5(0x95a)](rQ, rR, 0x1, 0x1);
        const rS = j7[rP],
          rT = j8[rP],
          rU = nA(
            B5(0x5cd) +
              rT +
              B5(0xa37) +
              ((rR + 0.5) / 0x3) * 0x64 +
              B5(0xdee) +
              ((rQ + 0.5) / 0x3) * 0x64 +
              B5(0x194) +
              rS +
              B5(0x724)
          );
        pM[B5(0xc50)](rU, pM[B5(0x600)][0x0]);
      }
      pM[B5(0xdd7)][B5(0xce3)] = B5(0xc47) + rN[B5(0x2ec)]() + ")";
    }
    pN();
    var pO = document[uf(0xbda)](uf(0x99e)),
      pP = document[uf(0xbda)](uf(0x615));
    function pQ(rN, rO, rP) {
      const B6 = uf;
      (rN[B6(0xdd7)][B6(0x59b)] = (rO / j2) * 0x64 + "%"),
        (rN[B6(0xdd7)][B6(0x525)] = (rP / j2) * 0x64 + "%");
    }
    function pR() {
      const B7 = uf,
        rN = qx(),
        rO = d0 / 0x2 / rN,
        rP = d1 / 0x2 / rN,
        rQ = j4,
        rR = Math[B7(0x8ab)](0x0, Math[B7(0x61d)]((pd - rO) / rQ) - 0x1),
        rS = Math[B7(0x8ab)](0x0, Math[B7(0x61d)]((pe - rP) / rQ) - 0x1),
        rT = Math[B7(0x9dc)](j5 - 0x1, Math[B7(0x48b)]((pd + rO) / rQ)),
        rU = Math[B7(0x9dc)](j5 - 0x1, Math[B7(0x48b)]((pe + rP) / rQ));
      kj[B7(0x96f)](), kj[B7(0x37a)](rQ, rQ), kj[B7(0x721)]();
      for (let rV = rR; rV <= rT + 0x1; rV++) {
        kj[B7(0x371)](rV, rS), kj[B7(0x8f6)](rV, rU + 0x1);
      }
      for (let rW = rS; rW <= rU + 0x1; rW++) {
        kj[B7(0x371)](rR, rW), kj[B7(0x8f6)](rT + 0x1, rW);
      }
      kj[B7(0x416)]();
      for (let rX = rR; rX <= rT; rX++) {
        for (let rY = rS; rY <= rU; rY++) {
          kj[B7(0x96f)](),
            kj[B7(0x5df)]((rX + 0.5) * rQ, (rY + 0.5) * rQ),
            pt(kj, rX + "," + rY, 0x28, B7(0x910), 0x6),
            kj[B7(0x416)]();
        }
      }
      (kj[B7(0x20a)] = B7(0x7eb)),
        (kj[B7(0xd87)] = 0xa),
        (kj[B7(0xa23)] = B7(0x7cc)),
        kj[B7(0xaaa)]();
    }
    function pS(rN, rO) {
      const B8 = uf,
        rP = nA(B8(0xb0d) + rN + B8(0xd1c) + rO + B8(0x541)),
        rQ = rP[B8(0xbda)](B8(0xca1));
      return (
        km[B8(0x771)](rP),
        (rP[B8(0x12d)] = function (rR) {
          const B9 = B8;
          rR > 0x0 && rR !== 0x1
            ? (rQ[B9(0x654)](B9(0xdd7), B9(0x744) + rR * 0x168 + B9(0x861)),
              rP[B9(0x3d4)][B9(0xa29)](B9(0x230)))
            : rP[B9(0x3d4)][B9(0x86e)](B9(0x230));
        }),
        km[B8(0xc50)](rP, pM),
        rP
      );
    }
    var pT = pS(uf(0xb2a), uf(0x510));
    pT[uf(0x3d4)][uf(0xa29)](uf(0x525));
    var pU = nA(uf(0x704) + hP[uf(0xa93)] + uf(0x682));
    pT[uf(0x600)][0x0][uf(0x771)](pU);
    var pV = pS(uf(0xae8), uf(0x2e8)),
      pW = pS(uf(0xb12), uf(0x30c));
    pW[uf(0x3d4)][uf(0xa29)](uf(0x25f));
    var pX = uf(0xb20),
      pY = 0x2bc,
      pZ = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[uf(0x220)], 0x19);
    pZ[uf(0xba7)] = 0x0;
    var q0 = [
      [uf(0x9e8), uf(0x28e)],
      [uf(0xd0b), uf(0xd2d)],
      [uf(0x225), uf(0x889)],
      [uf(0x5f0), uf(0x2cb), uf(0x2e6)],
      [uf(0x27b), uf(0x30d)],
      [uf(0xbef), uf(0x1e6)],
      [uf(0xb98), uf(0xae7)],
    ];
    function q1() {
      const Ba = uf;
      let rN = "";
      const rO = q0[Ba(0x28c)] - 0x1;
      for (let rP = 0x0; rP < rO; rP++) {
        const rQ = q0[rP][0x0];
        (rN += rQ),
          rP === rO - 0x1
            ? (rN += Ba(0x864) + q0[rP + 0x1][0x0] + ".")
            : (rN += ",\x20");
      }
      return rN;
    }
    var q2 = q1(),
      q3 = document[uf(0xbda)](uf(0x732));
    (q3[uf(0xb1a)] = function () {
      const Bb = uf;
      return nA(
        Bb(0x1c5) +
          hP[Bb(0x4c8)] +
          Bb(0xaef) +
          hP[Bb(0x3f4)] +
          Bb(0x2d3) +
          hP[Bb(0x16d)] +
          Bb(0x64b) +
          q2 +
          Bb(0xcde)
      );
    }),
      (q3[uf(0xd1b)] = !![]);
    var q4 =
      Date[uf(0x160)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[uf(0x61d)](Math[uf(0x50e)]() * q0[uf(0x28c)]);
    function q5() {
      const Bc = uf,
        rN = q0[q4];
      (pZ[Bc(0x739)] = rN[0x0]), (pZ[Bc(0xd1f)] = rN[0x1]);
      for (let rO of iZ) {
        pZ[rO] = Math[Bc(0x50e)]() > 0.5;
      }
      q4 = (q4 + 0x1) % q0[Bc(0x28c)];
    }
    q5(),
      (q3[uf(0x4a5)] = function () {
        const Bd = uf;
        window[Bd(0x1dc)](pZ[Bd(0xd1f)], Bd(0x6f2)), q5();
      });
    var q6 = new lT(uf(0x404), 0x0, -0x19, 0x0, 0x1, cY[uf(0x220)], 0x19);
    (q6[uf(0xba7)] = 0x0), (q6[uf(0xc4b)] = !![]);
    var q7 = [
        uf(0x3f3),
        uf(0x3b5),
        uf(0x5a9),
        uf(0x306),
        uf(0xc89),
        uf(0xb17),
        uf(0x831),
      ],
      q8 = [
        uf(0x42e),
        uf(0xad5),
        uf(0x98e),
        uf(0x77f),
        uf(0x6d5),
        uf(0xb07),
        uf(0xb3e),
        uf(0x93d),
      ],
      q9 = 0x0;
    function qa() {
      const Be = uf,
        rN = {};
      (rN[Be(0x54f)] = q7[q9 % q7[Be(0x28c)]]),
        (rN[Be(0x5c0)] = !![]),
        (rN[Be(0xd4a)] = n3["me"]),
        n7(Be(0x404), rN),
        n7("yt", {
          text: q8[q9 % q8[Be(0x28c)]][Be(0x5fe)](
            Be(0xdbd),
            kE[Be(0x6f1)][Be(0x55e)]() || Be(0x6bd)
          ),
          isFakeChat: !![],
          col: n3["me"],
        }),
        q9++;
    }
    qa(), setInterval(qa, 0xfa0);
    var qb = 0x0,
      qc = Math[uf(0x48b)](
        (Math[uf(0x8ab)](screen[uf(0x662)], screen[uf(0x645)], kU(), kV()) *
          window[uf(0x482)]) /
          0xc
      ),
      qd = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[uf(0xc72)], 0x19);
    (qd[uf(0x3dc)] = !![]), (qd[uf(0xd6c)] = 0x1), (qd[uf(0x37a)] = 0.6);
    var qe = (function () {
        const Bf = uf,
          rN = document[Bf(0x9bf)](Bf(0x297)),
          rO = qc * 0x2;
        (rN[Bf(0x662)] = rN[Bf(0x645)] = rO),
          (rN[Bf(0xdd7)][Bf(0x662)] = rN[Bf(0xdd7)][Bf(0x645)] = Bf(0xd1d));
        const rP = document[Bf(0xbda)](Bf(0xcb0));
        rP[Bf(0x771)](rN);
        const rQ = rN[Bf(0xd84)]("2d");
        return (
          (rN[Bf(0xb2b)] = function () {
            const Bg = Bf;
            (qd[Bg(0x806)] = ![]),
              rQ[Bg(0x532)](0x0, 0x0, rO, rO),
              rQ[Bg(0x96f)](),
              rQ[Bg(0x3ad)](rO / 0x64),
              rQ[Bg(0x5df)](0x32, 0x32),
              rQ[Bg(0x3ad)](0.8),
              rQ[Bg(0x488)](-Math["PI"] / 0x8),
              qd[Bg(0x536)](rQ),
              rQ[Bg(0x416)]();
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
      qh = rN[Bh(0x2ec)](Bh(0x8cc));
      const rO = qf * 0x64 + "%\x20" + qg * 0x64 + Bh(0xc0b),
        rP = nA(
          Bh(0x930) +
            hQ[Bh(0x196)](
              (rQ, rR) => Bh(0x11a) + rR + Bh(0x71d) + rQ + Bh(0x903)
            )[Bh(0x4d3)]("\x0a") +
            Bh(0x14d) +
            no[Bh(0xb88)] +
            Bh(0x4d0) +
            no[Bh(0x1fa)] +
            Bh(0xd35) +
            no[Bh(0x5f6)] +
            Bh(0x4e7) +
            dH +
            Bh(0x38b) +
            qh +
            Bh(0xc3f) +
            rO +
            Bh(0x5cf) +
            rO +
            Bh(0x6e9) +
            rO +
            Bh(0xc68) +
            rO +
            Bh(0x3eb)
        );
      document[Bh(0xde9)][Bh(0x771)](rP);
    }
    function qk(rN) {
      const Bi = uf,
        rO =
          -rN[Bi(0xde4)]["x"] * 0x64 +
          "%\x20" +
          -rN[Bi(0xde4)]["y"] * 0x64 +
          "%";
      return (
        Bi(0x221) +
        rO +
        Bi(0xbfe) +
        rO +
        Bi(0x9f4) +
        rO +
        Bi(0x56f) +
        rO +
        ";\x22"
      );
    }
    if (document[uf(0xd6d)] && document[uf(0xd6d)][uf(0x4a8)]) {
      const rN = setTimeout(qj, 0x1f40);
      document[uf(0xd6d)][uf(0x4a8)][uf(0xcf2)](() => {
        const Bj = uf;
        console[Bj(0x8d7)](Bj(0xa9d)), clearTimeout(rN), qj();
      });
    } else qj();
    var ql = [];
    qm();
    function qm() {
      const Bk = uf,
        rO = {};
      (qf = 0xf), (ql = []);
      let rP = 0x0;
      for (let rR = 0x0; rR < dC[Bk(0x28c)]; rR++) {
        const rS = dC[rR],
          rT = Bk(0x345) + rS[Bk(0x789)] + "_" + (rS[Bk(0x91b)] || 0x1),
          rU = rO[rT];
        if (rU === void 0x0) (rS[Bk(0xde4)] = rO[rT] = rQ()), ql[Bk(0x462)](rS);
        else {
          rS[Bk(0xde4)] = rU;
          continue;
        }
      }
      for (let rV = 0x0; rV < eK[Bk(0x28c)]; rV++) {
        const rW = eK[rV],
          rX = Bk(0xa73) + rW[Bk(0x789)],
          rY = rO[rX];
        if (rY === void 0x0) rW[Bk(0xde4)] = rO[rX] = rQ();
        else {
          rW[Bk(0xde4)] = rY;
          continue;
        }
      }
      function rQ() {
        const Bl = Bk;
        return { x: rP % qf, y: Math[Bl(0x61d)](rP / qf), index: rP++ };
      }
    }
    function qn(rO) {
      const Bm = uf,
        rP = ql[Bm(0x28c)] + eL;
      qg = Math[Bm(0x48b)](rP / qf);
      const rQ = document[Bm(0x9bf)](Bm(0x297));
      (rQ[Bm(0x662)] = rO * qf), (rQ[Bm(0x645)] = rO * qg);
      const rR = rQ[Bm(0xd84)]("2d"),
        rS = 0x5a,
        rT = rS / 0x2,
        rU = rO / rS;
      rR[Bm(0x37a)](rU, rU), rR[Bm(0x5df)](rT, rT);
      for (let rV = 0x0; rV < ql[Bm(0x28c)]; rV++) {
        const rW = ql[rV];
        rR[Bm(0x96f)](),
          rR[Bm(0x5df)](rW[Bm(0xde4)]["x"] * rS, rW[Bm(0xde4)]["y"] * rS),
          rR[Bm(0x96f)](),
          rR[Bm(0x5df)](0x0 + rW[Bm(0x6db)], -0x5 + rW[Bm(0x2d2)]),
          rW[Bm(0x30b)](rR),
          rR[Bm(0x416)](),
          (rR[Bm(0x632)] = Bm(0x910)),
          (rR[Bm(0x974)] = Bm(0x25f)),
          (rR[Bm(0x78d)] = Bm(0x871)),
          (rR[Bm(0xb4e)] = Bm(0x342) + iA),
          (rR[Bm(0xd87)] = h5 ? 0x5 : 0x3),
          (rR[Bm(0x20a)] = Bm(0x620)),
          (rR[Bm(0xa23)] = rR[Bm(0x62f)] = Bm(0x7cc)),
          rR[Bm(0x5df)](0x0, rT - 0x8 - rR[Bm(0xd87)]);
        let rX = rW[Bm(0x789)];
        h5 && (rX = h7(rX));
        const rY = rR[Bm(0x9fa)](rX)[Bm(0x662)] + rR[Bm(0xd87)],
          rZ = Math[Bm(0x9dc)](0x4c / rY, 0x1);
        rR[Bm(0x37a)](rZ, rZ),
          rR[Bm(0x5d1)](rX, 0x0, 0x0),
          rR[Bm(0x437)](rX, 0x0, 0x0),
          rR[Bm(0x416)]();
      }
      for (let s0 = 0x0; s0 < eL; s0++) {
        const s1 = eK[s0];
        rR[Bm(0x96f)](),
          rR[Bm(0x5df)](s1[Bm(0xde4)]["x"] * rS, s1[Bm(0xde4)]["y"] * rS),
          s1[Bm(0x1ca)] !== void 0x0 &&
            (rR[Bm(0x721)](), rR[Bm(0x924)](-rT, -rT, rS, rS), rR[Bm(0xc04)]()),
          rR[Bm(0x5df)](s1[Bm(0x6db)], s1[Bm(0x2d2)]),
          s1[Bm(0x30b)](rR),
          rR[Bm(0x416)]();
      }
      return rQ;
    }
    var qo = new lG(-0x1, cS[uf(0xcfe)], 0x0, 0x0, Math[uf(0x50e)]() * 6.28);
    qo[uf(0xd48)] = 0x32;
    function qp() {
      const Bn = uf;
      kj[Bn(0x1e0)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qq(rO) {
      const Bo = uf,
        rP = rO[Bo(0x28c)],
        rQ = document[Bo(0x9bf)](Bo(0x297));
      rQ[Bo(0x662)] = rQ[Bo(0x645)] = rP;
      const rR = rQ[Bo(0xd84)]("2d"),
        rS = rR[Bo(0xce9)](rP, rP);
      for (let rT = 0x0; rT < rP; rT++) {
        for (let rU = 0x0; rU < rP; rU++) {
          const rV = rO[rT][rU];
          if (!rV) continue;
          const rW = (rT * rP + rU) * 0x4;
          rS[Bo(0x4a4)][rW + 0x3] = 0xff;
        }
      }
      return rR[Bo(0xd56)](rS, 0x0, 0x0), rQ;
    }
    function qr() {
      const Bp = uf;
      if (!jK) return;
      kj[Bp(0x96f)](),
        kj[Bp(0x721)](),
        qp(),
        kj[Bp(0xc04)](),
        !jK[Bp(0x297)] && (jK[Bp(0x297)] = qq(jK)),
        (kj[Bp(0x23f)] = ![]),
        (kj[Bp(0xac6)] = 0.08),
        kj[Bp(0x277)](jK[Bp(0x297)], 0x0, 0x0, j2, j2),
        kj[Bp(0x416)]();
    }
    function qs() {
      const Bq = uf;
      lM = 0x0;
      const rO = kR * kW;
      qb = 0x0;
      for (let rT = 0x0; rT < nx[Bq(0x28c)]; rT++) {
        const rU = nx[rT];
        rU[Bq(0x7af)] && rU[Bq(0xb2b)]();
      }
      if (
        kk[Bq(0xdd7)][Bq(0xd71)] === "" ||
        document[Bq(0xde9)][Bq(0x3d4)][Bq(0x755)](Bq(0xb06))
      ) {
        (kj[Bq(0x632)] = Bq(0x6b4)),
          kj[Bq(0x95a)](0x0, 0x0, ki[Bq(0x662)], ki[Bq(0x645)]),
          kj[Bq(0x96f)]();
        let rV = Math[Bq(0x8ab)](ki[Bq(0x662)] / d0, ki[Bq(0x645)] / d1);
        kj[Bq(0x37a)](rV, rV),
          kj[Bq(0x924)](0x0, 0x0, d0, d1),
          kj[Bq(0x96f)](),
          kj[Bq(0x5df)](pG, -pG),
          kj[Bq(0x37a)](1.25, 1.25),
          (kj[Bq(0x632)] = kY),
          kj[Bq(0x80f)](),
          kj[Bq(0x416)]();
        for (let rW = 0x0; rW < pj[Bq(0x28c)]; rW++) {
          pj[rW][Bq(0x536)](kj);
        }
        kj[Bq(0x416)]();
        if (oV[Bq(0x31a)] && oY[Bq(0x11e)] > 0x0) {
          const rX = oY[Bq(0x832)]();
          kj[Bq(0x96f)]();
          let rY = kW;
          kj[Bq(0x37a)](rY, rY),
            kj[Bq(0x5df)](
              rX["x"] + rX[Bq(0x662)] / 0x2,
              rX["y"] + rX[Bq(0x645)]
            ),
            kj[Bq(0x3ad)](kR * 0.8),
            q6[Bq(0x536)](kj),
            kj[Bq(0x37a)](0.7, 0.7),
            q6[Bq(0xd11)](kj),
            kj[Bq(0x416)]();
        }
        if (q3[Bq(0x11e)] > 0x0) {
          const rZ = q3[Bq(0x832)]();
          kj[Bq(0x96f)]();
          let s0 = kW;
          kj[Bq(0x37a)](s0, s0),
            kj[Bq(0x5df)](
              rZ["x"] + rZ[Bq(0x662)] / 0x2,
              rZ["y"] + rZ[Bq(0x645)] * 0.6
            ),
            kj[Bq(0x3ad)](kR * 0.8),
            pZ[Bq(0x536)](kj),
            kj[Bq(0x3ad)](0.7),
            kj[Bq(0x96f)](),
            kj[Bq(0x5df)](0x0, -pZ[Bq(0xd48)] - 0x23),
            pt(kj, pZ[Bq(0x739)], 0x12, Bq(0x910), 0x3),
            kj[Bq(0x416)](),
            pZ[Bq(0xd11)](kj),
            kj[Bq(0x416)]();
        }
        if (hm[Bq(0x11e)] > 0x0) {
          const s1 = hm[Bq(0x832)]();
          kj[Bq(0x96f)]();
          let s3 = kW;
          kj[Bq(0x37a)](s3, s3),
            kj[Bq(0x5df)](
              s1["x"] + s1[Bq(0x662)] / 0x2,
              s1["y"] + s1[Bq(0x645)] * 0.5
            ),
            kj[Bq(0x3ad)](kR),
            qo[Bq(0x536)](kj),
            kj[Bq(0x416)]();
        }
        return;
      }
      if (jy)
        (kj[Bq(0x632)] = pI[0x0]),
          kj[Bq(0x95a)](0x0, 0x0, ki[Bq(0x662)], ki[Bq(0x645)]);
      else {
        kj[Bq(0x96f)](), qw();
        for (let s4 = -0x1; s4 < 0x4; s4++) {
          for (let s5 = -0x1; s5 < 0x4; s5++) {
            const s6 = Math[Bq(0x8ab)](0x0, Math[Bq(0x9dc)](s5, 0x2)),
              s7 = Math[Bq(0x8ab)](0x0, Math[Bq(0x9dc)](s4, 0x2));
            (kj[Bq(0x632)] = pI[s7 * 0x3 + s6]),
              kj[Bq(0x95a)](s5 * j3, s4 * j3, j3, j3);
          }
        }
        kj[Bq(0x721)](),
          kj[Bq(0x924)](0x0, 0x0, j2, j2),
          kj[Bq(0xc04)](),
          kj[Bq(0x721)](),
          kj[Bq(0x371)](-0xa, j3),
          kj[Bq(0x8f6)](j3 * 0x2, j3),
          kj[Bq(0x371)](j3 * 0x2, j3 * 0.5),
          kj[Bq(0x8f6)](j3 * 0x2, j3 * 1.5),
          kj[Bq(0x371)](j3 * 0x1, j3 * 0x2),
          kj[Bq(0x8f6)](j2 + 0xa, j3 * 0x2),
          kj[Bq(0x371)](j3, j3 * 1.5),
          kj[Bq(0x8f6)](j3, j3 * 2.5),
          (kj[Bq(0xd87)] = pY * 0x2),
          (kj[Bq(0xa23)] = Bq(0x7cc)),
          (kj[Bq(0x20a)] = pX),
          kj[Bq(0xaaa)](),
          kj[Bq(0x416)]();
      }
      kj[Bq(0x96f)](),
        kj[Bq(0x721)](),
        kj[Bq(0x924)](0x0, 0x0, ki[Bq(0x662)], ki[Bq(0x645)]),
        qw();
      oV[Bq(0x100)] && ((kj[Bq(0x632)] = kY), kj[Bq(0x80f)]());
      kj[Bq(0x721)]();
      jy ? qp() : kj[Bq(0x924)](0x0, 0x0, j2, j2);
      kj[Bq(0x416)](),
        kj[Bq(0x924)](0x0, 0x0, ki[Bq(0x662)], ki[Bq(0x645)]),
        (kj[Bq(0x632)] = pX),
        kj[Bq(0x80f)](Bq(0x34e)),
        kj[Bq(0x96f)](),
        qw();
      oV[Bq(0x794)] && pR();
      qr();
      const rP = [];
      let rQ = [];
      for (let s8 = 0x0; s8 < iw[Bq(0x28c)]; s8++) {
        const s9 = iw[s8];
        if (s9[Bq(0xa67)]) {
          if (iy) {
            if (
              pz - s9[Bq(0x7dc)] < 0x3e8 ||
              Math[Bq(0x5b5)](s9["nx"] - iy["x"], s9["ny"] - iy["y"]) <
                Math[Bq(0x5b5)](s9["ox"] - iy["x"], s9["oy"] - iy["y"])
            ) {
              rP[Bq(0x462)](s9), (s9[Bq(0x7dc)] = pz);
              continue;
            }
          }
        }
        s9 !== iy && rQ[Bq(0x462)](s9);
      }
      (rQ = qt(rQ, (sa) => sa[Bq(0x344)] === cS[Bq(0x6e5)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x344)] === cS[Bq(0x584)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x344)] === cS[Bq(0x5a3)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0xd4d)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x64f)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x558)] && !sa[Bq(0xd51)])),
        (rQ = qt(rQ, (sa) => !sa[Bq(0xd51)])),
        qt(rQ, (sa) => !![]);
      iy && iy[Bq(0x536)](kj);
      for (let sa = 0x0; sa < rP[Bq(0x28c)]; sa++) {
        rP[sa][Bq(0x536)](kj);
      }
      if (oV[Bq(0xb1e)]) {
        kj[Bq(0x721)]();
        for (let sb = 0x0; sb < iw[Bq(0x28c)]; sb++) {
          const sc = iw[sb];
          if (sc[Bq(0x3dc)]) continue;
          if (sc[Bq(0x676)]) {
            kj[Bq(0x96f)](),
              kj[Bq(0x5df)](sc["x"], sc["y"]),
              kj[Bq(0x488)](sc[Bq(0xcaa)]);
            if (!sc[Bq(0xc3e)])
              kj[Bq(0x924)](-sc[Bq(0xd48)], -0xa, sc[Bq(0xd48)] * 0x2, 0x14);
            else {
              kj[Bq(0x371)](-sc[Bq(0xd48)], -0xa),
                kj[Bq(0x8f6)](-sc[Bq(0xd48)], 0xa);
              const sd = 0xa + sc[Bq(0xc3e)] * sc[Bq(0xd48)] * 0x2;
              kj[Bq(0x8f6)](sc[Bq(0xd48)], sd),
                kj[Bq(0x8f6)](sc[Bq(0xd48)], -sd),
                kj[Bq(0x8f6)](-sc[Bq(0xd48)], -0xa);
            }
            kj[Bq(0x416)]();
          } else
            kj[Bq(0x371)](sc["x"] + sc[Bq(0xd48)], sc["y"]),
              kj[Bq(0x1e0)](sc["x"], sc["y"], sc[Bq(0xd48)], 0x0, l0);
        }
        (kj[Bq(0xd87)] = 0x2), (kj[Bq(0x20a)] = Bq(0x5f6)), kj[Bq(0xaaa)]();
      }
      const rR = oV[Bq(0x539)] ? 0x1 / qy() : 0x1;
      for (let se = 0x0; se < iw[Bq(0x28c)]; se++) {
        const sf = iw[se];
        !sf[Bq(0x558)] && sf[Bq(0xca9)] && lY(sf, kj, rR);
      }
      for (let sg = 0x0; sg < iw[Bq(0x28c)]; sg++) {
        const sh = iw[sg];
        sh[Bq(0x3ae)] && sh[Bq(0xd11)](kj, rR);
      }
      const rS = pA / 0x12;
      kj[Bq(0x96f)](),
        (kj[Bq(0xd87)] = 0x7),
        (kj[Bq(0x20a)] = Bq(0x910)),
        (kj[Bq(0xa23)] = kj[Bq(0x62f)] = Bq(0xdc7));
      for (let si = iF[Bq(0x28c)] - 0x1; si >= 0x0; si--) {
        const sj = iF[si];
        sj["a"] -= pA / 0x1f4;
        if (sj["a"] <= 0x0) {
          iF[Bq(0x27c)](si, 0x1);
          continue;
        }
        (kj[Bq(0xac6)] = sj["a"]), kj[Bq(0xaaa)](sj[Bq(0xc38)]);
      }
      kj[Bq(0x416)]();
      if (oV[Bq(0x6ae)])
        for (let sk = iz[Bq(0x28c)] - 0x1; sk >= 0x0; sk--) {
          const sl = iz[sk];
          (sl["x"] += sl["vx"] * rS),
            (sl["y"] += sl["vy"] * rS),
            (sl["vy"] += 0.35 * rS);
          if (sl["vy"] > 0xa) {
            iz[Bq(0x27c)](sk, 0x1);
            continue;
          }
          kj[Bq(0x96f)](),
            kj[Bq(0x5df)](sl["x"], sl["y"]),
            (kj[Bq(0xac6)] = 0x1 - Math[Bq(0x8ab)](0x0, sl["vy"] / 0xa)),
            kj[Bq(0x37a)](sl[Bq(0xd48)], sl[Bq(0xd48)]),
            sl[Bq(0x54f)] !== void 0x0
              ? pt(kj, sl[Bq(0x54f)], 0x15, Bq(0x3a7), 0x2, ![], sl[Bq(0xd48)])
              : (kj[Bq(0x488)](sl[Bq(0xcaa)]),
                pq(kj, Bq(0x7e4) + sl[Bq(0xd48)], 0x1e, 0x1e, function (sm) {
                  const Br = Bq;
                  sm[Br(0x5df)](0xf, 0xf), nm(sm);
                })),
            kj[Bq(0x416)]();
        }
      kj[Bq(0x416)]();
      if (iy && oV[Bq(0x6d6)] && !oV[Bq(0x6ab)]) {
        kj[Bq(0x96f)](),
          kj[Bq(0x5df)](ki[Bq(0x662)] / 0x2, ki[Bq(0x645)] / 0x2),
          kj[Bq(0x488)](Math[Bq(0x22b)](mX, mW)),
          kj[Bq(0x37a)](rO, rO);
        const sm = 0x28;
        let sn = Math[Bq(0x5b5)](mW, mX) / kR;
        kj[Bq(0x721)](),
          kj[Bq(0x371)](sm, 0x0),
          kj[Bq(0x8f6)](sn, 0x0),
          kj[Bq(0x8f6)](sn + -0x14, -0x14),
          kj[Bq(0x371)](sn, 0x0),
          kj[Bq(0x8f6)](sn + -0x14, 0x14),
          (kj[Bq(0xd87)] = 0xc),
          (kj[Bq(0xa23)] = Bq(0x7cc)),
          (kj[Bq(0x62f)] = Bq(0x7cc)),
          (kj[Bq(0xac6)] =
            sn < 0x64 ? Math[Bq(0x8ab)](sn - 0x32, 0x0) / 0x32 : 0x1),
          (kj[Bq(0x20a)] = Bq(0x7eb)),
          kj[Bq(0xaaa)](),
          kj[Bq(0x416)]();
      }
      kj[Bq(0x96f)](),
        kj[Bq(0x37a)](rO, rO),
        kj[Bq(0x5df)](0x28, 0x1e + 0x32),
        kj[Bq(0x3ad)](0.85);
      for (let so = 0x0; so < px[Bq(0x28c)]; so++) {
        const sp = px[so];
        if (so > 0x0) {
          const sq = lI(Math[Bq(0x8ab)](sp[Bq(0x2f3)] - 0.5, 0x0) / 0.5);
          kj[Bq(0x5df)](0x0, (so === 0x0 ? 0x46 : 0x41) * (0x1 - sq));
        }
        kj[Bq(0x96f)](),
          so > 0x0 &&
            (kj[Bq(0x5df)](lI(sp[Bq(0x2f3)]) * -0x190, 0x0),
            kj[Bq(0x3ad)](0.85)),
          kj[Bq(0x96f)](),
          lZ(sp, kj, !![]),
          (sp["id"] = (sp[Bq(0x236)] && sp[Bq(0x236)]["id"]) || -0x1),
          sp[Bq(0x536)](kj),
          (sp["id"] = -0x1),
          kj[Bq(0x416)](),
          sp[Bq(0xbde)] !== void 0x0 &&
            (kj[Bq(0x96f)](),
            kj[Bq(0x488)](sp[Bq(0xbde)]),
            kj[Bq(0x5df)](0x20, 0x0),
            kj[Bq(0x721)](),
            kj[Bq(0x371)](0x0, 0x6),
            kj[Bq(0x8f6)](0x0, -0x6),
            kj[Bq(0x8f6)](0x6, 0x0),
            kj[Bq(0x925)](),
            (kj[Bq(0xd87)] = 0x4),
            (kj[Bq(0xa23)] = kj[Bq(0x62f)] = Bq(0x7cc)),
            (kj[Bq(0x20a)] = Bq(0x6cf)),
            kj[Bq(0xaaa)](),
            (kj[Bq(0x632)] = Bq(0x910)),
            kj[Bq(0x80f)](),
            kj[Bq(0x416)]()),
          kj[Bq(0x416)]();
      }
      kj[Bq(0x416)]();
    }
    function qt(rO, rP) {
      const Bs = uf,
        rQ = [];
      for (let rR = 0x0; rR < rO[Bs(0x28c)]; rR++) {
        const rS = rO[rR];
        if (rP[Bs(0x9dd)] !== void 0x0 ? rP(rS) : rS[rP]) rS[Bs(0x536)](kj);
        else rQ[Bs(0x462)](rS);
      }
      return rQ;
    }
    var qu = 0x0,
      qv = 0x0;
    function qw() {
      const Bt = uf;
      kj[Bt(0x5df)](ki[Bt(0x662)] / 0x2, ki[Bt(0x645)] / 0x2);
      let rO = qx();
      kj[Bt(0x37a)](rO, rO),
        kj[Bt(0x5df)](-pd, -pe),
        oV[Bt(0x8d5)] && kj[Bt(0x5df)](qu, qv);
    }
    function qx() {
      const Bu = uf;
      return Math[Bu(0x8ab)](ki[Bu(0x662)] / d0, ki[Bu(0x645)] / d1) * qy();
    }
    function qy() {
      return n1 / ph;
    }
    kX(), pD();
    const qz = {};
    (qz[uf(0x9dd)] = uf(0x116)),
      (qz[uf(0xd1f)] = uf(0x50b)),
      (qz[uf(0x7f2)] = uf(0xaa9));
    const qA = {};
    (qA[uf(0x9dd)] = uf(0xc86)),
      (qA[uf(0xd1f)] = uf(0x6d1)),
      (qA[uf(0x7f2)] = uf(0x35e));
    const qB = {};
    (qB[uf(0x9dd)] = uf(0xca6)),
      (qB[uf(0xd1f)] = uf(0x845)),
      (qB[uf(0x7f2)] = uf(0x29c));
    const qC = {};
    (qC[uf(0x9dd)] = uf(0x487)),
      (qC[uf(0xd1f)] = uf(0xf9)),
      (qC[uf(0x7f2)] = uf(0x9af));
    const qD = {};
    (qD[uf(0x9dd)] = uf(0x9b1)),
      (qD[uf(0xd1f)] = uf(0x827)),
      (qD[uf(0x7f2)] = uf(0x890));
    const qE = {};
    (qE[uf(0x9dd)] = uf(0xda5)),
      (qE[uf(0xd1f)] = uf(0x926)),
      (qE[uf(0x7f2)] = uf(0x4c6));
    const qF = {};
    (qF[uf(0x659)] = qz),
      (qF[uf(0x61b)] = qA),
      (qF[uf(0x55c)] = qB),
      (qF[uf(0x701)] = qC),
      (qF[uf(0xb5c)] = qD),
      (qF[uf(0x538)] = qE);
    var qG = qF;
    if (window[uf(0x273)][uf(0xc65)] !== uf(0x32d))
      for (let rO in qG) {
        const rP = qG[rO];
        rP[uf(0xd1f)] = rP[uf(0xd1f)]
          [uf(0x5fe)](uf(0x32d), uf(0xb65))
          [uf(0x5fe)](uf(0x34f), uf(0x4c9));
      }
    var qH = document[uf(0xbda)](uf(0x90e)),
      qI = document[uf(0xbda)](uf(0x66d)),
      qJ = 0x0;
    for (let rQ in qG) {
      const rR = qG[rQ],
        rS = document[uf(0x9bf)](uf(0xc56));
      rS[uf(0x894)] = uf(0x83c);
      const rT = document[uf(0x9bf)](uf(0x668));
      rT[uf(0x654)](uf(0xaaa), rR[uf(0x9dd)]), rS[uf(0x771)](rT);
      const rU = document[uf(0x9bf)](uf(0x668));
      (rU[uf(0x894)] = uf(0x89f)),
        (rR[uf(0x895)] = 0x0),
        (rR[uf(0x4dc)] = function (rV) {
          const Bv = uf;
          (qJ -= rR[Bv(0x895)]),
            (rR[Bv(0x895)] = rV),
            (qJ += rV),
            k8(rU, kh(rV, Bv(0xc57))),
            rS[Bv(0x771)](rU);
          const rW = Bv(0x79a) + kh(qJ, Bv(0xc57)) + Bv(0x4fa);
          k8(qK, rW), k8(qI, rW);
        }),
        (rR[uf(0x6bc)] = function () {
          const Bw = uf;
          rR[Bw(0x4dc)](0x0), rU[Bw(0x86e)]();
        }),
        (rS[uf(0xdd7)][uf(0x8d2)] = rR[uf(0x7f2)]),
        qH[uf(0x771)](rS),
        (rS[uf(0x4a5)] = function () {
          const Bx = uf,
            rV = qH[Bx(0xbda)](Bx(0x6b0));
          if (rV === rS) return;
          rV && rV[Bx(0x3d4)][Bx(0x86e)](Bx(0xd77)),
            this[Bx(0x3d4)][Bx(0xa29)](Bx(0xd77)),
            qN(rR[Bx(0xd1f)]),
            (hD[Bx(0x146)] = rQ);
        }),
        (rR["el"] = rS);
    }
    var qK = document[uf(0x9bf)](uf(0x668));
    (qK[uf(0x894)] = uf(0x714)), qH[uf(0x771)](qK);
    if (!![]) {
      qL();
      let rV = Date[uf(0x160)]();
      setInterval(function () {
        pz - rV > 0x2710 && (qL(), (rV = pz));
      }, 0x3e8);
    }
    function qL() {
      const By = uf;
      fetch(By(0x255))
        [By(0xcf2)]((rW) => rW[By(0x50f)]())
        [By(0xcf2)]((rW) => {
          const Bz = By;
          for (let rX in rW) {
            const rY = qG[rX];
            rY && rY[Bz(0x4dc)](rW[rX]);
          }
        })
        [By(0x54b)]((rW) => {
          const BA = By;
          console[BA(0xd86)](BA(0x24e), rW);
        });
    }
    var qM = window[uf(0x317)] || window[uf(0x273)][uf(0x797)] === uf(0x209);
    if (qM) hV(window[uf(0x273)][uf(0x83e)][uf(0x5fe)](uf(0x907), "ws"));
    else {
      const rW = qG[hD[uf(0x146)]];
      if (rW) rW["el"][uf(0x58b)]();
      else {
        let rX = "EU";
        fetch(uf(0x24c))
          [uf(0xcf2)]((rY) => rY[uf(0x50f)]())
          [uf(0xcf2)]((rY) => {
            const BB = uf;
            if (["NA", "SA"][BB(0x9ae)](rY[BB(0x2f2)])) rX = "US";
            else ["AS", "OC"][BB(0x9ae)](rY[BB(0x2f2)]) && (rX = "AS");
          })
          [uf(0x54b)]((rY) => {
            const BC = uf;
            console[BC(0x8d7)](BC(0xf6));
          })
          [uf(0x65d)](function () {
            const BD = uf,
              rY = [];
            for (let s0 in qG) {
              const s1 = qG[s0];
              s1[BD(0x9dd)][BD(0x904)](rX) && rY[BD(0x462)](s1);
            }
            const rZ =
              rY[Math[BD(0x61d)](Math[BD(0x50e)]() * rY[BD(0x28c)])] ||
              qG[BD(0x6ff)];
            console[BD(0x8d7)](BD(0xbc9) + rX + BD(0x872) + rZ[BD(0x9dd)]),
              rZ["el"][BD(0x58b)]();
          });
      }
    }
    (document[uf(0xbda)](uf(0xbf7))[uf(0xdd7)][uf(0xd71)] = uf(0x18e)),
      kA[uf(0x3d4)][uf(0xa29)](uf(0x230)),
      kB[uf(0x3d4)][uf(0x86e)](uf(0x230)),
      (window[uf(0x7f3)] = function () {
        il(new Uint8Array([0xff]));
      });
    function qN(rY) {
      const BE = uf;
      clearTimeout(kF), iu();
      const rZ = {};
      (rZ[BE(0xd1f)] = rY), (hU = rZ), kg(!![]);
    }
    window[uf(0x3c9)] = qN;
    var qO = null;
    function qP(rY) {
      const BF = uf;
      if (!rY || typeof rY !== BF(0xd14)) {
        console[BF(0x8d7)](BF(0x547));
        return;
      }
      if (qO) qO[BF(0x6df)]();
      const rZ = rY[BF(0xac5)] || {},
        s0 = {};
      (s0[BF(0xd5c)] = BF(0x8e0)),
        (s0[BF(0x578)] = BF(0xb32)),
        (s0[BF(0xab8)] = BF(0x60a)),
        (s0[BF(0x431)] = BF(0x3f4)),
        (s0[BF(0xd50)] = !![]),
        (s0[BF(0x7ac)] = !![]),
        (s0[BF(0xcb2)] = ""),
        (s0[BF(0xafd)] = ""),
        (s0[BF(0x91a)] = !![]),
        (s0[BF(0xaae)] = !![]);
      const s1 = s0;
      for (let s7 in s1) {
        (rZ[s7] === void 0x0 || rZ[s7] === null) && (rZ[s7] = s1[s7]);
      }
      const s2 = [];
      for (let s8 in rZ) {
        s1[s8] === void 0x0 && s2[BF(0x462)](s8);
      }
      s2[BF(0x28c)] > 0x0 &&
        console[BF(0x8d7)](BF(0x458) + s2[BF(0x4d3)](",\x20"));
      rZ[BF(0xcb2)] === "" && rZ[BF(0xafd)] === "" && (rZ[BF(0xcb2)] = "x");
      (rZ[BF(0x578)] = hP[rZ[BF(0x578)]] || rZ[BF(0x578)]),
        (rZ[BF(0x431)] = hP[rZ[BF(0x431)]] || rZ[BF(0x431)]);
      const s3 = nA(
        BF(0x6ec) +
          rZ[BF(0xd5c)] +
          BF(0x7b8) +
          rZ[BF(0x578)] +
          BF(0x953) +
          (rZ[BF(0xab8)]
            ? BF(0x579) +
              rZ[BF(0xab8)] +
              "\x22\x20" +
              (rZ[BF(0x431)] ? BF(0xaac) + rZ[BF(0x431)] + "\x22" : "") +
              BF(0x2d6)
            : "") +
          BF(0x17b)
      );
      (qO = s3),
        (s3[BF(0x6df)] = function () {
          const BG = BF;
          document[BG(0xde9)][BG(0x3d4)][BG(0x86e)](BG(0xb06)),
            s3[BG(0x86e)](),
            (qO = null);
        }),
        (s3[BF(0xbda)](BF(0x5c4))[BF(0x4a5)] = s3[BF(0x6df)]);
      const s4 = s3[BF(0xbda)](BF(0xdfd)),
        s5 = [],
        s6 = [];
      for (let s9 in rY) {
        if (s9 === BF(0xac5)) continue;
        const sa = rY[s9];
        let sb = [];
        const sc = Array[BF(0xa46)](sa);
        let sd = 0x0;
        if (sc)
          for (let se = 0x0; se < sa[BF(0x28c)]; se++) {
            const sf = sa[se],
              sg = dF[sf];
            if (!sg) {
              s5[BF(0x462)](sf);
              continue;
            }
            sd++, sb[BF(0x462)]([sf, void 0x0]);
          }
        else
          for (let sh in sa) {
            const si = dF[sh];
            if (!si) {
              s5[BF(0x462)](sh);
              continue;
            }
            const sj = sa[sh];
            (sd += sj), sb[BF(0x462)]([sh, sj]);
          }
        if (sb[BF(0x28c)] === 0x0) continue;
        s6[BF(0x462)]([sd, s9, sb, sc]);
      }
      rZ[BF(0xaae)] && s6[BF(0x582)]((sk, sl) => sl[0x0] - sk[0x0]);
      for (let sk = 0x0; sk < s6[BF(0x28c)]; sk++) {
        const [sl, sm, sn, so] = s6[sk];
        rZ[BF(0x91a)] && !so && sn[BF(0x582)]((ss, st) => st[0x1] - ss[0x1]);
        let sp = "";
        rZ[BF(0xd50)] && (sp += sk + 0x1 + ".\x20");
        sp += sm;
        const sq = nA(BF(0xd66) + sp + BF(0x441));
        s4[BF(0x771)](sq);
        const sr = nA(BF(0xd94));
        for (let ss = 0x0; ss < sn[BF(0x28c)]; ss++) {
          const [st, su] = sn[ss],
            sv = dF[st],
            sw = nA(
              BF(0xc8b) + sv[BF(0x24f)] + "\x22\x20" + qk(sv) + BF(0x2d6)
            );
          if (!so && rZ[BF(0x7ac)]) {
            const sx = rZ[BF(0xcb2)] + k9(su) + rZ[BF(0xafd)],
              sy = nA(BF(0xd69) + sx + BF(0x441));
            sx[BF(0x28c)] > 0x6 && sy[BF(0x3d4)][BF(0xa29)](BF(0x89f)),
              sw[BF(0x771)](sy);
          }
          (sw[BF(0xb1a)] = sv), sr[BF(0x771)](sw);
        }
        s4[BF(0x771)](sr);
      }
      kl[BF(0x771)](s3),
        s5[BF(0x28c)] > 0x0 &&
          console[BF(0x8d7)](BF(0x301) + s5[BF(0x4d3)](",\x20")),
        document[BF(0xde9)][BF(0x3d4)][BF(0xa29)](BF(0xb06));
    }
    (window[uf(0xc05)] = qP),
      (document[uf(0xde9)][uf(0x92e)] = function (rY) {
        const BH = uf;
        rY[BH(0xaa4)]();
        const rZ = rY[BH(0xc9b)][BH(0x6ee)][0x0];
        if (rZ && rZ[BH(0x344)] === BH(0x39e)) {
          console[BH(0x8d7)](BH(0x5d9) + rZ[BH(0x9dd)] + BH(0x7fd));
          const s0 = new FileReader();
          (s0[BH(0x2da)] = function (s1) {
            const BI = BH,
              s2 = s1[BI(0xdef)][BI(0x8f0)];
            try {
              const s3 = JSON[BI(0xcb7)](s2);
              qP(s3);
            } catch (s4) {
              console[BI(0xd86)](BI(0x453), s4);
            }
          }),
            s0[BH(0x244)](rZ);
        }
      }),
      (document[uf(0xde9)][uf(0x33f)] = function (rY) {
        const BJ = uf;
        rY[BJ(0xaa4)]();
      }),
      Object[uf(0x308)](window, uf(0xc21), {
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
