# 贪吃蛇游戏部署指南

> 本文档介绍如何将游戏部署到生产环境

## 目录

- [部署选项](#部署选项)
- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [自定义服务器](#自定义服务器)
- [部署后检查](#部署后检查)

---

## 部署选项

游戏为纯前端静态项目，可选择以下任意方式部署：

| 方式 | 难度 | 成本 | 推荐 |
|------|------|------|------|
| GitHub Pages | ⭐ | 免费 | ✅ 首选 |
| Netlify | ⭐ | 免费 | ✅ 简单 |
| Vercel | ⭐ | 免费 | ✅ 快速 |
| 自有服务器 | ⭐⭐⭐ | 视情况 | 企业用户 |

---

## GitHub Pages

### 前置条件

- 代码已推送到 GitHub 仓库

### 部署步骤

```mermaid
graph LR
    A[仓库 Settings] --> B[Pages 菜单]
    B --> C[选择分支]
    C --> D[保存]
    D --> E[等待部署]
    E --> F[获取 URL]
```

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `master`，文件夹选择 `/(root)`
4. 点击 **Save**
5. 等待 1-2 分钟，访问生成的 URL

### 访问地址

```
https://{username}.github.io/{repo-name}/snake/
```

### 自定义域名（可选）

在 **Pages** → **Custom domain** 中输入你的域名：

```
game.example.com
```

---

## Netlify

### 方法一：Git 集成（推荐）

1. 登录 [Netlify](https://netlify.com)
2. 点击 **Add new site** → **Import an existing project**
3. 选择 GitHub 仓库
4. 设置：
   - **Branch**: `master`
   - **Publish directory**: `snake`
   - **Build command**: （留空）
5. 点击 **Deploy site**

### 方法二：拖拽部署

```bash
# 直接拖拽 snake/ 文件夹到 Netlify Drop
# https://app.netlify.com/drop
```

### 访问地址

```
https://{random-name}.netlify.app
```

---

## Vercel

### 部署步骤

1. 安装 Vercel CLI（可选）：
   ```bash
   npm i -g vercel
   ```

2. 在 `snake/` 目录执行：
   ```bash
   vercel
   ```

3. 或登录 [Vercel](https://vercel.com) 导入 GitHub 仓库

### 访问地址

```
https://{repo-name}.vercel.app
```

---

## 自定义服务器

### Nginx 配置

```nginx
server {
    listen 80;
    server_name game.example.com;

    root /var/www/snake;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript;
}
```

### 上传文件

```bash
# 使用 scp 上传
scp -r snake/* user@server:/var/www/snake/

# 或使用 rsync
rsync -avz snake/ user@server:/var/www/snake/
```

---

## 部署后检查

### 检查清单

- [ ] 页面可以正常加载
- [ ] 游戏可以正常启动
- [ ] 分数显示正常
- [ ] 最高分持久化正常（localStorage）
- [ ] 难度切换生效
- [ ] 暂停功能正常
- [ ] 移动端适配（如需要）

### 性能检查

使用浏览器 DevTools：

```
Lighthouse → 运行性能测试
目标分数：Performance ≥ 90
```

### 常见故障

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 404 Not Found | 路径错误 | 检查 publish directory 设置 |
| 游戏无法启动 | JS 加载失败 | 检查 script 标签路径 |
| localStorage 失效 | 跨域问题 | 确保使用 HTTPS |

---

## CI/CD 集成

### GitHub Actions 示例

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./snake
```

---

## 安全建议

1. **启用 HTTPS** - 所有现代托管平台默认支持
2. **设置 CSP 头** - 防止 XSS 攻击
3. **定期备份** - 使用 Git 版本控制

---

## 联系方式

遇到问题？请提交 [Issue](https://github.com/xingzhuangtang/Study_CC_Snake/issues)
