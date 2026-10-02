# 清算前端

原生 HTML、CSS、JavaScript，无构建依赖。支持按钮和键盘输入、结果展示、数据库历史、单条删除、搜索分页、记录复用及主题切换。核心计算全部在后端。

## 运行与配置

需要 Python 3.11+ 用于本地静态服务，浏览器需支持 fetch、AbortSignal.timeout。在仓库目录运行 `python -m http.server 5500 --bind 127.0.0.1`，打开 http://localhost:5500。

在 `src/config.js` 设置后端 API 地址，默认 http://localhost:8000；启动后端并将 FRONTEND_ORIGIN 配置为前端的实际来源。localhost 与 127.0.0.1 是不同来源，请保持一致。

前端无需数据库初始化。数据由后端 SQLite 保存，刷新页面时从 API 获取。后端停止时输入仍可编辑，但无法得到新结果。

## 部署

将此目录部署为静态站点（例如 GitHub Pages 或 Nginx），修改 config.js 为已部署的 HTTPS API 地址，同时更新后端允许的来源。HTTPS 页面必须调用 HTTPS API，避免混合内容被拦截。前后端分别提交到两个 GitHub 仓库；当前目录是前端仓库根目录。


## 已发布地址

[在线计算器](https://qingsuan-sun-832401315.bold-clove-0728.chatgpt.site)。云端使用 Sites 与 D1 SQLite；兼容平台的完整部署源码、依赖锁文件、路由与数据库迁移见后端仓库 deployment/source.zip，可下载解压检查和复现。deployment/calculator.mjs 为线上计算器解析器，原 src/calculator.py 为 Python 本地版。云端有理数运算最后舍入为 28 位有效数字，Python 版则使用 Decimal 每步舍入。
