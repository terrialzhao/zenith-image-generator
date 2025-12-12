## 本地开发与贡献指南

### 1. Fork 并克隆仓库

1. 访问 [https://github.com/WuMingDao/zenith-image-generator](https://github.com/WuMingDao/zenith-image-generator)
2. 点击右上角的 **Fork** 按钮
3. 克隆你 Fork 后的仓库：

```bash
git clone https://github.com/你的用户名/zenith-image-generator.git
cd zenith-image-generator
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp apps/web/.env.example apps/web/.env
```

### 4. 启动开发服务器

**选项 A：使用 Cloudflare Pages 启动全栈服务**

> ⚠️ **征求帮助**: 此方法与 wrangler 4.x 存在兼容性问题。欢迎提交 PR 进行修复！详见 [问题追踪器](https://github.com/WuMingDao/zenith-image-generator/issues/10)。

**选项 B：分别启动前端和 API（推荐）**

在不同的终端中分别运行前端和 API。

```bash
# 步骤 1：在 apps/web/.env 中设置 VITE_API_URL
# VITE_API_URL=http://localhost:8787

# 步骤 2：启动 API（终端 1）
pnpm dev:api

# 步骤 3：启动 Web 前端（终端 2）
pnpm dev:web
```

访问 `http://localhost:5173`

> **注意**：请确保在 `apps/web/.env` 中设置了 `VITE_API_URL=http://localhost:8787`

### 5. 打开浏览器

访问 `http://localhost:5173`

### 6. 局域网访问（可选）

如果你想从本地网络中的其他设备访问开发服务器（例如在手机上进行测试）：

**问题**：默认情况下，前端和 API 仅监听 `localhost`，其他设备无法访问。

**解决方案**：

1. **更新 `.env`** - 将 API 地址指向你机器的局域网 IP：

```bash
# apps/web/.env
VITE_API_URL=http://192.168.1.9:8787 # 替换为你的实际 IP
```

2. **更新 `wrangler.toml`** - 使 API 监听所有网口：

```toml
# apps/api/wrangler.toml
[dev]
port = 8787
ip = "0.0.0.0"

[vars]
CORS_ORIGINS = "http://localhost:5173,http://192.168.1.9:5173" # 添加你的局域网 IP
```

3. **使用 host 标志启动**：

```bash
# 终端 1：启动 API
pnpm dev:api

# 终端 2：启动 Web 前端并开启局域网访问
pnpm dev:web -- --host=0.0.0.0
```

4. **从其他设备访问**：`http://192.168.1.9:5173`

> **提示**：你可以通过 `ip addr` (Linux) 或 `ipconfig` (Windows) 命令查看你的局域网 IP
