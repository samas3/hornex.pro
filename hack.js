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
const $$ = (i) => document.getElementsByClassName(i);
const $_ = (i) => document.querySelector(i);
class HornexHack{
  constructor(){
    this.version = '1.6';
    this.config = {
      damageDisplay: true, // 是否启用伤害显示修改
      DDenableNumber: true, // 是否显示伤害数值而不是百分比（若可用）
      healthDisplay: true, // 是否启用血量显示
      disableChatCheck: true // 是否禁用聊天内容检查
    };
    this.configKeys = Object.keys(this.config);
    this.chatFunc = null;
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
  setStatus(){
    this.status.innerHTML = content;
  }
  onload(){
    this.addChat(`${this.name} enabled!`);
    this.addChat('Type /help in chat box to get help');
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
      this.addChat(`${item}: ${this.config[item]}`, '#ffffff');
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
    var server = localStorage.getItem('server');
    this.addChat(`Current server: ${server.substring(0, 2).toUpperCase()}${server[server.length - 1]}`);
  }
  getColor(r){
    return this.rarityColor[r['tier']];
  }
  getWave(){
    var name = $$('zone-name')[0].getAttribute('stroke');
    var status = $_('body > div.hud > div.zone > div.progress > span').getAttribute('stroke');
    var prog = $_('body > div.hud > div.zone > div.progress > div').style.transform;
    var start = prog.indexOf('calc(') + 5;
    prog = prog.substring(start, prog.indexOf('%'));
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
      func(args[1]);
    }
  }
}
var hack = new HornexHack();
function getHP(mob, lst) {
  var tier = mob['tier'],
    type = mob['type'];
  if(mob['typeStr'].includes('centipedeBody')) type--;
  if (!(tier && tier < lst.length)) return;
  for (var i = 0; i < lst[tier].length; i++) {
    var j = lst[tier][i];
    if (type == j['type']) return j['health']; // hack identifier
  }
}
//onload:
//搜索.play-btn，在其onclick事件的方法开头插入
hack.chatFunc = 下方所示chatFunc;
hack.onload();
//找到存储mob的列表(lst) 位于mob定义下方，形式为 xxx1 = xxx2();
hack.moblst = xxx1;
//onload end

//伤害显示：
//搜索show_damage，方法中插入
var baseHP = getHP(方法的第一个参数, hack.moblst);
var decDmg = 方法的第一个参数['nHealth'] - 方法的第二个参数;
var dmg = Math.floor(decDmg * 10000) / 100 + '%';
if (baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
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
if(hack.isEnabled('healthDisplay')) _0x392420.drawImage(
  health2,
  -60,
  -120,
  health2.worldW,
  health2.worldH
);

//聊天界面控制：搜索'/profile'
//下方输出'Invalid username.'方法为chatFunc（2个参数，内部为另一个4个参数方法的调用）
//startWith的调用者为field1
var inputChat = field1;
if(inputChat.startsWith('/toggle')){
  hack.command2Arg(hack.toggle, inputChat);
}else if(inputChat.startsWith('/list')){
  hack.addChat('List of module and configs:');
  hack.list();
}else if(inputChat.startsWith('/help')){
  hack.getHelp();
}else if(inputChat.startsWith('/server')){
  hack.getServer();
}else if(inputChat.startsWith('/wave')){
  hack.getWave();
}
//下方if改成else if！！

//禁用聊天检查：搜索'[censored]'
//在方法开头插入
if(hack.isEnabled('disableChatCheck')) return 方法的第一个参数;

//禁用Adblocker检查：允许访问https://hornex.pro/weborama.js
//uBlock Origin:
/*
@@||hornex.pro/weborama.js$xhr,1p
*/