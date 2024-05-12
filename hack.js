//getInfo（全版本）
//复制最前面的代码
function getInfoIndex(getInfo, string) {
  for (var i = 0; i < 0x10000; i++) {
    if (getInfo(i) == string) {
      return i.toString(16);
    }
  }
}

//hack主类
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
//onload:
//搜索.play-btn，在其onclick事件的方法开头插入
hack.chatFunc = 下方所示chatFunc;
//搜索'Loaded Build #'，参数是它的方法为toastFunc
hack.toastFunc = toastFunc;
hack.onload();
//找到存储mob的列表(lst) 位于mob定义下方，形式为 xxx1 = xxx2();
hack.moblst = xxx1;
//onload end
//preload:
//搜索输出'Connected!'，在下方插入
hack.preload();
//preload end

//伤害显示：
//搜索show_damage，方法中插入
var baseHP = getHP(方法的第一个参数, hack.moblst);
var decDmg = 方法的第一个参数['nHealth'] - 方法的第二个参数;
var dmg = Math.floor(decDmg * 10000) / 100 + '%';
if(baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
//替换下方text键对应的值
{
  text: hack.isEnabled('damageDisplay') ? dmg : 原来的变量
}

//血量显示：
//搜索'Lvl '，在if语句的else最后插入
var genCanvas = xxx; // xxx 为一个7个参数的方法，参考上方drawImage第一个参数
const health = genCanvas(
  方法的第二个参数,
  `${Math.floor(方法的第一个参数['health'] * getHP(方法的第一个参数, hack.moblst))} (${Math.floor(方法的第一个参数['health'] * 100)}%)`,
  30,
  hack.getColor(方法的第一个参数),
  3,
  true
);
if(hack.isEnabled('healthDisplay')) 方法的第二个参数.drawImage(
  health,
  -60,
  -150,
  health.worldW,
  health.worldH
);
const health2 = genCanvas(
  方法的第二个参数,
  `/ ${getHP(方法的第一个参数, hack.moblst)} `,
  30,
  hack.getColor(方法的第一个参数),
  3,
  true
);
if(hack.isEnabled('healthDisplay')) 方法的第二个参数.drawImage(
  health2,
  -60,
  -120,
  health2.worldW,
  health2.worldH
);
//在'Lvl '对应调用的方法参数前插入
if(方法的第一个参数.username == hack.player.name) hack.player.entity = 方法的第一个参数;
var hp = Math.round(方法的第一个参数.health * hack.hp);
var shield = Math.round(方法的第一个参数.shield * hack.hp);
`HP ${hp}${shield ? " + " + shield : ""} ` + 第二个参数后面内容

//聊天界面控制：搜索'/profile'
//下方输出'Invalid username.'方法为chatFunc（2个参数，内部为另一个4个参数方法的调用）
//startWith的调用者为field1
var inputChat = field1;
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
}
//下方if改成else if！！
//下方if语句改为
hack.speak = txt => {
  //原来的内容（将field1替换为txt）
};
hack.speak(inputChat);

//禁用聊天检查：搜索'[censored]'
//在方法开头插入
if(hack.isEnabled('disableChatCheck')) return 方法的第一个参数;

//禁用Adblocker检查：允许访问https://hornex.pro/weborama.js
//uBlock Origin:
/*
@@||hornex.pro/weborama.js$xhr,1p
*/

//经验相关：搜索' XP'，在第二个调用方法下方插入
hack.hp = 0xc8 * 变量;
上方横线所在的值改为
!hack.isEnabled('betterXP') ? 原来的变量 : 修改后的变量

//玩家相关：搜索'.stats .dialog-header span'，在下方方法中调用它的位置上方插入
hack.player.name = 变量;