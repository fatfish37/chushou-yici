# 出手一次

一个本地优先的行动工具。核心原则：

> 没有现实发生，就不算进展。

它不是待办清单、番茄钟、项目管理软件或 AI 聊天助手。它只做一件事：在用户卡住时，把一个脑内想法推进到一次现实动作。

## 本地运行

```bash
npm install
npm run dev
```

## 本地构建

```bash
npm run build
```

## GitHub Pages 部署

1. 创建 GitHub 仓库 `chushou-yici`
2. 上传项目代码
3. 进入仓库 `Settings` -> `Pages`
4. `Source` 选择 `GitHub Actions`
5. 推送到 `main` 后等待 Actions 成功
6. 访问：

```text
https://<你的GitHub用户名>.github.io/chushou-yici/
```

## 注意

如果仓库名不是 `chushou-yici`，需要同步修改 `vite.config.js` 里的 `base`。

## 数据说明

当前版本没有登录、后端、数据库或云同步。记录只保存在当前浏览器的 `localStorage` 中。换设备、换浏览器或清理浏览器数据后，记录可能丢失，建议定期使用“导出 JSON”备份。
