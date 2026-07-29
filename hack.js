//getInfo
//复制最前面的代码
function getInfoIndex(getInfo, string) {
  for (var i = 0; i < 0x10000; i++) {
    if (getInfo(i) == string) {
      return i.toString(16);
    }
  }
}

//hack主类
//代码最前部分不变
//onload:（kH）
//搜索.play-btn，在其onclick事件的方法开头插入
if(方法的第一个参数) hack.onload();

//preload:
//搜索输出'running...'，在对应的输出语句下方插入（此处为preload处）
//搜索'Loaded Build #'，参数是它的方法为toastFunc
hack.toastFunc = toastFunc;
//搜索mobsEl，它的参数定义使用的方法为（nW）
hack.mobFunc = mobFunc;
//找到存储mob的列表 位于mob定义下方，形式为 xxx1 = xxx2();
hack.mobList = xxx1;
//找到存储petal的列表
hack.petalList = xxx;
hack.chatFunc = 下方所示chatFunc;
hack.numFunc = 下方参数为一个数字的方法; // 见“经验相关”
hack.updatePlayerList = 下方所示func1; // 见“自定义player list”
hack.createPetalDiv();
//搜索'spin'，在带有setTimeout的地方为func1（og）
hack.showPetal = func1;
//搜索'Connecting!'方法（hY）中插入
hack.preload();

//伤害显示：（iU）
//搜索show_damage，方法中插入
let baseHP = hack.getHP(方法的第一个参数, hack.moblst);
let decDmg = 方法的第一个参数['nHealth'] - 方法的第二个参数;
let dmg = Math.round(decDmg * 10000) / 100 + '%';
if(baseHP && hack.isEnabled('DDenableNumber')) dmg = Math.round(decDmg * baseHP);
if(isNaN(dmg)) dmg = '';
//替换下方text键对应的值
{
  text: hack.isEnabled('damageDisplay') ? dmg : 原来的变量
}

//血量显示：（m0）
//搜索'Lvl '，在if语句的else最后插入
let genCanvas = xxx; // xxx 为一个7个参数的方法，参考上方drawImage第一个参数
let mob = 方法的第一个参数;
let ctx = 方法的第二个参数;
hack.updateMob(mob);
const health = genCanvas(
  ctx,
  `${Math.round(mob.health * hack.getHP(mob, hack.moblst))} (${Math.round(mob.health * 100)}%)`,
  30,
  hack.getColor(mob),
  3,
  true
);
if(hack.isEnabled('healthDisplay')) ctx.drawImage(
  health,
  -60,
  -150,
  health.worldW,
  health.worldH
);
const health2 = genCanvas(
  ctx,
  `/ ${hack.getHP(mob, hack.moblst)} `,
  30,
  hack.getColor(mob),
  3,
  true
);
if(hack.isEnabled('healthDisplay')) ctx.drawImage(
  health2,
  -60,
  -120,
  health2.worldW,
  health2.worldH
);/*
const entityId = genCanvas(
    ctx,
    'ID: ' + hack.convertID(mob.id),
    20,
    '#fff',
    3,
    true
);
ctx.drawImage(
    entityId,
    -60,
    -90,
    entityId.worldW,
    entityId.worldH
);*/
//在'Lvl '对应调用的方法参数前插入
hack.updatePlayer(方法的第一个参数);
let hp = Math.round(hack.player.health * hack.hp);
let shield = Math.round(hack.player.shield * hack.hp);
(方法的第一个参数.username == hack.player.entity.username ? `HP ${hp}${shield ? " + " + shield : ""} ` : '') + 第二个参数后面内容

//聊天界面控制：搜索'/profile'
//下方输出'Invalid username.'方法为chatFunc（2个参数，内部为另一个4个参数方法的调用）
//startWith的调用者为field1
let inputChat = field1;
hack.chatHistory.push(inputChat);
if(inputChat.startsWith('/toggle')){
    hack.commandMultiArg('toggle', 2, inputChat);
}else if(inputChat.startsWith('/list')){
    hack.addChat('List of module and configs:');
    hack.listModule();
}else if(inputChat.startsWith('/help')){
    hack.getHelp();
}else if(inputChat.startsWith('/open')){
    hack.openGUI();
}else if(inputChat.startsWith('/bind')){
    hack.commandMultiArg('bindKey', 3, inputChat);
    hack.saveModule();
}else if(inputChat.startsWith('/delBuild')){
    hack.commandMultiArg('delBuild', 2, inputChat);
}else if(inputChat.startsWith('/viewPetal')){
    hack.commandMultiArg('viewPetal', 2, inputChat);
}else if(inputChat.startsWith('/viewMob')){
    hack.commandMultiArg('viewMob', 2, inputChat);
}else if(inputChat.startsWith('/track')){
    hack.commandMultiArg('onTrack', 2, inputChat);
}/*else if(inputChat.startsWith('/change')){
    hack.commandMultiArg('changeServer', 2, inputChat);
}*/else if(!hack.isEnabled('allowInvalidCommand') && hack.notCommand(inputChat.split(' ')[0])){
    hack.addError('Invalid command!');
}else
//下方if改成else if！！
//下方if语句改为
hack.speak = txt => {
    field1 = txt;
  //原来的内容（将field1替换为txt）
};
hack.speak(inputChat);

//禁用聊天检查：搜索'[censored]'
//在方法开头插入（fa）
if(hack.isEnabled('disableChatCheck')) return 方法的第一个参数;

//禁用Adblocker检查：
//搜索'.ad-blocker'，删除附近所有代码，并替换为then中的代码
//提高加载速度：搜索'/hqdefault.jpg)'，替换为空字符串

//经验相关：搜索' XP'，在第二个调用方法下方插入（oR）
hack.hp = 0xc8 * 变量;
在参数为一个数字的方法中插入 // （iK）
if(hack.isEnabled('numberNoSuffix')) return Math.round(方法的第一个参数);

//掉落物显示：
//搜索'collected-petals，下方方法为func1（oE），preload处
hack.updatePetals = func1;
//在func1方法的const xx = yy(zz)下方插入
xx.classList.remove('spin');

//自杀检测：搜索'.leave-btn'，在onclick事件方法开头插入（jv）
hack.isSuicide = true;

//自定义player list：搜索'playerList'，找到下方return前的方法记为func（jn）
//在preload中插入
hack.updatePlayerList = jn;
//下方方法func(p)改为（func=jq）
if(var1.checked) func(p);
else hack.viewProfile(p);
//搜索'.censor-cb'，对应变量为var1，将var1.onchange语句删除
//func方法删除最后一行xxx.show();
//快速查看profile：搜索'iReqUserProfile'，对应方法为func1（mA），preload处
hack.viewProfile = func1;

//修改petal key：搜索'petal-key'的第一个（在nP上面）
//将if(var1 >= var2)（rS >= iO）中的(var1 - var2 + 1) % 10替换为
(var1 - var2 >= 10 ? 'Shift+' : '') + (var1 - var2 + 1) % 10

//解锁缩放大小：搜索'onwheel'，最后一行改为
if(hack.isEnabled('extendedZoom'));//原来内容

//防掉线：搜索'iPing'，将其中代码替换为
const workerScript = `
    setInterval(function () {
      postMessage('execute');
    }, 0x3e8); // 每 1000ms 发送 'execute'
  `;
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerURL = URL.createObjectURL(blob);
  const myWorker = new Worker(workerURL);
  myWorker.onmessage = function (e) {
        if (e.data === 'execute') {
            im(new Uint8Array([cH.iPing])); //方法原来的内容
        }
  };

//自动阴阳：搜索'isTrusted'并删除

//显示wave进度：搜索'killsNeeded'，下方加入
'Kills Needed' + ' ' + Math.round(j7.prog * 10000) / 100 + "%"
//搜索'You are in'，后方加入
hack.getServer()
// deprecated:
/*class CanvasUtil{
    constructor(hack){
        this.canvas = this.getCompatibleCanvas();
        this.hack = hack;
    }
    getCompatibleCanvas(){
        if (typeof (OffscreenCanvasRenderingContext2D) == 'undefined') return [CanvasRenderingContext2D];
        return [OffscreenCanvasRenderingContext2D, CanvasRenderingContext2D];
    }
    init(){
        for(const { prototype } of this.canvas){
            if(prototype.rewriteStrokeText == undefined){
                prototype.rewriteStrokeText = prototype.strokeText;
                prototype.rewriteFillText = prototype.fillText;
            }else break;
        }
        let that = this;
        for(const { prototype } of this.canvas) {
            prototype.strokeText = function(text, x, y) {
                return this.rewriteStrokeText(that.getTranslate(text), x, y);
            }
            prototype.fillText = function(text, x, y) {
                return this.rewriteFillText(that.getTranslate(text), x, y);
            }
        }
    }
    getTranslate(text){
        if(hack.isEnabled('numberNoSuffix')) return text;
        text = text + '';
        let num = this.matchNumber(text);
        if(num == null) return text;
        //num = num.map(n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        for(let i = 0; i < num.length; i++){
            text = text.replace(new RegExp(num[i].toString(), 'g'), this.hack.numFunc(parseFloat(num[i])));
        }
        return text;
    }
    matchNumber(text){
        let num = text.match(/(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?/g);
        if(num == null) return null;
        return num.map(n => parseFloat(n.replace(/,/g, '')));
    }
}  */