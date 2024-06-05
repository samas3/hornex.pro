# Hornex.PRO assistant script
### 使用方式（Edge浏览器）：
- 将仓库中那个名字很长的js文件（当前为 `c92fa501fa27e5bd8ccf020cdc9e9e4e.js`）放在任意名为 `hornex.pro` 的文件夹中
- 打开 `hornex.pro` 网页，按下 F12 打开 `DevTools`
- 点击打开的窗口中左侧选项卡从上到下第 4 个（`源代码`）按钮
- 在右侧上方选项卡中选择 `覆盖`，点击 `选择替代文件夹`，选择 `hornex.pro` 文件夹的**上层文件夹**，若出现 `DevTools 请求对 ... 的完全访问权限` 时，点击 `确认`
- 刷新页面
- 之后每次新打开浏览器想要使用脚本时需要先按 F12 打开 DevTools 后再刷新

### 关于 v2.0 后新加入的 `style.css` 文件
- 自行下载 `Stylus` 插件并加载
- 为 `hornex.pro` 网页新建样式，并复制 `style.css` 文件中的内容到输入框中

详细步骤可参见 *<u>https://learn.microsoft.com/zh-cn/microsoft-edge/devtools-guide-chromium/javascript/overrides</u>*