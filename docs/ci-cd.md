# Git Hooks / 自定义 Git 钩子

## 安装 Pre-commit Hook

```bash
# 复制 hook 到本地
cp .githooks/pre-commit .git/hooks/pre-commit

# 添加执行权限
chmod +x .git/hooks/pre-commit
```

## 检查内容

Pre-commit hook 会执行以下检查：

1. **JavaScript 语法检查** - 使用 `node --check`
2. **必需文件检查** - 确保核心文件存在
3. **文档检查** - 确保基础文档完整
4. **文件大小检查** - 警告超过 1MB 的文件
5. **敏感信息扫描** - 检测可能的密码、密钥等

## 绕过检查（不推荐）

```bash
git commit -m "your message" --no-verify
```

## CI/CD 流水线

### GitHub Actions

项目配置了两条流水线：

| 流水线 | 触发条件 | 说明 |
|--------|----------|------|
| `quality-checks.yml` | Push / PR | 代码质量检查 |
| `deploy.yml` | Push to master | 部署到 GitHub Pages |

### 本地验证

在提交前可以手动运行类似检查：

```bash
# JavaScript 语法
node --check snake/game.js

# 文件结构
ls -la snake/
```

## 部署

推送到 master 后，GitHub Actions 会自动：

1. 运行质量检查
2. 部署 `snake/` 目录到 GitHub Pages
3. 生成部署 URL

部署地址：`https://{username}.github.io/{repo-name}/`
