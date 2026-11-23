# 每日花费排行

DeepSeek Harness Web GUI 插件：按天查看每个会话当天花了多少钱，并按花费从高到低排行。

## 功能

- **按天切换**：前一天/后一天、回到今天，以及 21 天柱状时间线，点柱子直接切到那一天。柱高用对数刻度，单个大额日不会把其他日子压平。
- **四格概览**：当天花费、活跃会话数、计费 Token、请求数；花费旁标出「已计价 / 总会话」。
- **会话排行**：名次、标题、工作区、模型、请求数、Token、花费与占比；行内进度条按当天花费占最高会话的比例绘制。
- **子代理折叠**：默认把子会话的花费折进主会话，也可以摊开单独看，行上会标出折叠了几个。
- **点行进入**：点任意一行直接在对话面板打开那个会话。
- **跟随目录**：会话目录变化时自动刷新；历史回填进行期间会持续重读目录。

## 安装

需要：

- DeepSeek Harness `0.2.0-rc.2` 或更新版本；
- 同一 profile 里装了 [dsh-context](https://github.com/bowenliang123/dsh-context)——每日花费桶来自它的 `contextActivity` 投影。

克隆并链接进你运行 GUI 的 profile：

```sh
git clone https://github.com/sandwich-xz/dsh-spend-rank.git
dsh plugin --profile desktop add link:$(pwd)/dsh-spend-rank
```

Windows PowerShell 用绝对路径：`link:D:\path\to\dsh-spend-rank`。

刷新 GUI，侧边栏会出现「花费排行」。也可以在 GUI 地址后加 `#spend-rank` 再刷新，直接打开面板。

## 费用怎么算

费用不是重新扫日志算的，而是直接复用 dsh-context 已按会话、按天折叠好的计费 Token 桶（`contextActivity.days[YYYY-MM-DD].cost`）：未缓存输入、缓存读、缓存写、输出，峰谷分开。再按 models.dev 挂牌价折算：

- DeepSeek 高峰时段（工作日 9:00–12:00、14:00–18:00）按挂牌价 2 倍计费，其余时段按挂牌价。
- 人民币按 `1 元 = 0.15 美元` 换算，和 dsh-context 同口径。
- 价格表里没有收录的模型显示「未计价」（`—`），这部分 Token 不计入合计，面板会说明影响了几个会话。

**第一次打开会触发一次回填。** 只有折叠过投影的会话带每日花费。面板挂载时会调用 dsh-context 的 `POST /api/dsh-context/backfill`，并在此后几分钟里每 20 秒刷新一次会话目录，让历史随折叠完成逐批出现。几百个会话通常一两分钟；之后回填是增量的。

## 限制

- 只统计会话目录里还在的会话；已删除的会话不在排行榜里。
- 费用是估算，不含未上报用量的请求。
- 正常情况下当天合计与 dsh-usage 账本只差几分钱。
- 界面目前只有中文。

## 开发

纯 JavaScript，没有构建步骤。

```sh
node --check client.js
node --check index.js
```

客户端半在 `client.js`，通过 `window.__ModuleLoader__` 注册：读会话目录，注册一个 `sidebar.panellist` 入口和一个带 key 的 `main` 面板。改完刷新 GUI 页面即可。

## 隐私

全部在本地。插件只读会话目录并调用同源的 dsh-context 回填路由，没有遥测，也不向第三方发请求。

## 许可

MIT，见 [LICENSE](LICENSE)。
