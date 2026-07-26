# CMS 上线操作手册 — Cloudflare R2 + Railway + 域名

> 2026-07-26 编写。目标：把 `cms/`（Payload 2 + Express + PostgreSQL）部署到 Railway，
> 媒体文件存 Cloudflare R2，最终绑定 `cms.bluven.com.au`。
> 代码侧的准备（初始迁移、`migrate:prod`、`railway.json`、`.npmrc`）已全部完成并在本地
> 用空数据库彩排通过 —— 你只需要做下面这些**网页上的操作**。
>
> ⚠️ 全程会产生 6 个秘密值（R2 四个 + PAYLOAD_SECRET + 数据库密码）。
> 它们**只贴进 Railway 的 Variables 面板**，永远不要提交到 git、不要发到聊天群。

---

## 第一部分：Cloudflare R2（≈10 分钟，产出 4 个值）

R2 是 Cloudflare 的对象存储（类似 AWS S3），用来放 CMS 上传的图片。
不用 R2 的话，图片会写到 Railway 的临时磁盘，**每次重新部署全部丢失**——所以这步不能跳。

### 1.1 注册 / 登录

1. 打开 <https://dash.cloudflare.com>
2. 没有账号就 **Sign up** 注册（邮箱 + 密码），有就直接登录。

### 1.2 开通 R2

1. 登录后看**左侧边栏**，找到 **R2 Object Storage**（在 Workers & Pages 附近），点进去。
2. 第一次用会出现开通页面。**R2 需要绑一张银行卡**才能开通——免费额度很大
   （存储 10 GB/月、下载流量完全免费），正常使用这个项目**不会产生费用**，
   绑卡只是 Cloudflare 的防滥用要求。
3. 按提示完成开通。

### 1.3 创建桶（bucket）

1. 进入 R2 页面后点 **Create bucket**（蓝色按钮）。
2. **Bucket name** 填：`bluven-media`
3. **Location** 选 **Asia-Pacific (APAC)**（离澳洲用户最近）。
   如果界面显示的是 "Automatic"，展开选择 APAC 即可；找不到就保持默认，影响不大。
4. 其余全部保持默认，点 **Create bucket**。
5. 创建完成后**什么都不要再设置**——尤其是：
   - ❌ 不要开 "Public access" / "R2.dev subdomain"
   - ❌ 不要绑自定义域名
   桶保持**私有**。图片由 CMS 从 `cms.bluven.com.au/uploads/...` 代理出去，
   桶本身永远不直接对公网。

### 1.4 创建 API Token（拿到 3 个值）

1. 回到 R2 首页（左侧边栏点 R2 Object Storage），找到
   **API → Manage API tokens**（有的界面叫 "Manage R2 API Tokens"，
   一般在右上角或 API 下拉菜单里）。
2. 点 **Create API token**。
3. 按下面填：
   - **Token name**：`bluven-cms`
   - **Permissions**：选 **Object Read & Write**
     （⚠️ 不要选 Admin Read & Write，权限太大）
   - **Specify bucket(s)**：选 **Apply to specific buckets only**，勾选 `bluven-media`
   - **TTL**：Forever
4. 点 **Create API Token**。
5. 现在屏幕上会显示一批值。**这个页面只出现一次**，把下面三个立刻复制到本地记事本：


   | 屏幕上的名字 | 对应的环境变量 |
   |---|---|
   | Access Key ID | `R2_ACCESS_KEY_ID` |
   | Secret Access Key | `R2_SECRET_ACCESS_KEY` |
   | 页面下方 "Use jurisdiction-specific endpoints..." 里形如 `https://xxxxxxxx.r2.cloudflarestorage.com` 的 URL | `R2_ENDPOINT` |

   > 端点如果没显示，也可以自己拼：`https://<账户ID>.r2.cloudflarestorage.com`，
   > 账户 ID 在 R2 首页右侧 "Account details" 里（Account ID）。
   > 注意端点**不带**桶名 —— 桶名是单独的变量。

6. 第 4 个值不用找：`R2_BUCKET` 就是 `bluven-media`。

**✅ 第一部分完成的标志**：记事本里有 4 个值
（`R2_BUCKET` / `R2_ENDPOINT` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`）。

---

## 第二部分：Railway（≈20 分钟）

### 2.1 注册

1. 打开 <https://railway.com>，点 **Login**，选 **Login with GitHub**，
   用 `DDuu123321` 那个 GitHub 账号授权。
2. 新账号会要求验证（可能要绑卡或先用 Trial）。Hobby 计划 $5/月，
   包含 $5 用量，这个 CMS + 数据库的规模大约就在这个数上下。

### 2.2 从 GitHub 创建项目

1. 进入控制台，点 **+ New Project**（或右上角 New）。
2. 选 **Deploy from GitHub repo**。
3. 第一次会提示 **Configure GitHub App**：跳到 GitHub 授权页，
   选 **Only select repositories** → 勾选 `Website-Restructuring` → Install & Authorize。
4. 回到 Railway，在列表里点 **DDuu123321/Website-Restructuring**。
5. 它会立刻开始第一次构建——**这次必然失败或跑错**，不用管，
   因为还没告诉它代码在 `cms/` 子目录。继续往下。

### 2.3 设置 Root Directory（关键步骤）

1. 画布上点刚创建的服务卡片（名字就是仓库名）。
2. 打开 **Settings** 标签。
3. 找到 **Source** 区块 → **Root Directory** → 填 `cms` → 保存（按 ✓ 或回车）。
4. 顺便确认 **Branch** 是 `main`。

> 这一步和当年 Vercel 踩的坑是同一件事：这个仓库是 monorepo，
> 根目录没有 package.json，不设 Root Directory 一切都是错的。
>
> 构建、迁移、启动命令**不用填**——仓库里的 `cms/railway.json` 已经定义好了
> （build → `npm run build`；每次部署前自动跑 `npm run migrate:prod` 建表/升级表；
> start → `npm run start`；健康检查 `/api/globals/site-settings`）。

### 2.4 添加 PostgreSQL

1. 回到项目画布（左上角项目名），点 **+ Create**（或右键空白处）。
2. 选 **Database → Add PostgreSQL**。
3. 画布上会多一个 Postgres 卡片，等它变成绿色 Active。
   （不需要进去做任何设置，连接串会用变量引用的方式传给 CMS。）

### 2.5 填环境变量

1. 点 CMS 服务卡片 → **Variables** 标签。
2. 推荐点右上角 **Raw Editor**，一次性粘贴下面整块，然后把 `<...>` 换成真实值：

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=8080
PAYLOAD_SECRET=<用下面 2.6 的命令生成；生成后只贴 Railway，不要写进这份文档 —— 本文档会提交到公开仓库>
SERVER_URL=<先填 Railway 域名，见 2.7；绑定正式域名后改成 https://cms.bluven.com.au>
FRONTEND_URL=https://www.bluven.com.au

R2_BUCKET=bluven-media
R2_ENDPOINT=<R2 端点，https://xxxx.r2.cloudflarestorage.com>
R2_ACCESS_KEY_ID=<R2 的 Access Key ID>
R2_SECRET_ACCESS_KEY=<R2 的 Secret Access Key>

SMTP_HOST=<从本地 cms/.env 抄>
SMTP_PORT=<从本地 cms/.env 抄>
SMTP_USER=<从本地 cms/.env 抄>
SMTP_PASS=<从本地 cms/.env 抄>
EMAIL_FROM=<从本地 cms/.env 抄>
NOTIFY_EMAIL=<从本地 cms/.env 抄>

GEMINI_API_KEY=<从本地 cms/.env 抄；不用 AI 客服可先不填>
CRM_SYNC_KEY=<从本地 cms/.env 抄；不用 CRM 同步可先不填>
```

要点：
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` **原样粘贴**，双花括号是 Railway 的
  变量引用语法，它会自动解析成数据库真实连接串。
- SMTP 六个值在本地 `cms/.env` 文件里都有（Zoho 邮箱那套），直接照抄。
- `PORT=8080` 必须和 Generate Domain 时填的端口一致（都用 8080）——
  应用监听的端口和域名路由到的端口对不上会 502。
- ⚠️ R2 四个值**一个都不能少**。少任何一个，代码会静默退回本地磁盘模式，
  上传的图片在下一次部署时全部消失，而且没有任何报错。

3. 保存后 Railway 会自动触发重新部署。

### 2.6 生成 PAYLOAD_SECRET

在自己电脑上开 PowerShell，运行：

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

输出的 64 位随机字符串就是 `PAYLOAD_SECRET`。它是后台登录 cookie 的签名密钥，
泄露等于后台失守——只贴进 Railway，别存在别处。

### 2.7 生成临时域名并冒烟测试

1. 服务 → **Settings → Networking → Public Networking** → 点 **Generate Domain**，
   得到一个 `xxxx.up.railway.app` 域名。
2. 把 Variables 里的 `SERVER_URL` 暂时改成这个域名（带 `https://`），会自动重新部署。
3. 看 **Deployments** 标签里最新一次部署的日志，成功的标志按顺序是：
   - Build 阶段：`payload build` + `tsc` 完成
   - Pre-deploy 阶段：`Migrating: 20260725_162629_initial` → `Done.`
     （第二次以后部署这里只有 `Done.`，属正常——迁移是幂等的）
   - Deploy 阶段：`🚀 CMS API running`，健康检查变绿
4. 浏览器测试：
   - `https://xxxx.up.railway.app/api/globals/site-settings` → 应返回 JSON
   - `https://xxxx.up.railway.app/admin` → 应出现 **Create first user** 页面

### 2.8 ⚠️ 立刻创建第一个管理员

空数据库的 Payload 后台，**谁先打开 /admin 谁就能注册成第一个管理员**。
所以生成域名后不要闲置，马上：

1. 打开 `/admin`，填邮箱 + 强密码（**不要**用本地开发那套 admin/Bluven123），
   创建第一个用户。
2. 登录进后台 → **Media** → 上传一张测试图片。
3. 回 Cloudflare R2 → `bluven-media` 桶 → Objects，**确认能看到刚上传的文件**。
   看得到 = R2 链路通；看不到 = R2 变量有错，回 2.5 检查四个值。
4. （可选但推荐）Railway 里手动 Redeploy 一次，再回后台看那张图还在不在。
   在 = 图片确实存在 R2 而不是临时磁盘，这一课就算过了。

---

## 第三部分：绑定 cms.bluven.com.au（≈10 分钟 + DNS 生效等待）

### 3.1 在 Railway 添加自定义域名

1. CMS 服务 → **Settings → Networking → Public Networking** → **+ Custom Domain**。
2. 填 `cms.bluven.com.au`，确认。
3. Railway 会显示一条要求你添加的 **CNAME 记录**，形如：
   `cms  CNAME  xxxx.up.railway.app`。保持这个页面开着。

### 3.2 到 DNS 服务商添加记录

`bluven.com.au` 的 DNS 在哪管，就去哪加（就是当年把 www 指到 Netlify 的那个地方——
可能是域名注册商的 DNS 面板，也可能是 Netlify DNS）：

- **如果在 Netlify 管 DNS**：Netlify → Domains → `bluven.com.au` → Add a record →
  Type `CNAME`、Name `cms`、Value 填 Railway 给的 `xxxx.up.railway.app`。
- **如果在注册商（如 GoDaddy/Crazy Domains/VentraIP）**：进 DNS 管理，
  添加 CNAME：主机名 `cms`，指向 `xxxx.up.railway.app`。
- **如果 DNS 在 Cloudflare**：添加记录时把橙色云☁️点成**灰色（DNS only）**，
  否则 Railway 签发证书会卡住。

### 3.3 等待生效并收尾

1. Railway 的 Custom Domain 页面会自动检测，DNS 生效后状态变绿、证书自动签发
   （几分钟到几小时不等，澳洲域名一般很快）。
2. 状态变绿后，把 Railway Variables 里的 `SERVER_URL` 改成
   `https://cms.bluven.com.au`（自动重新部署）。
3. 最终验证：
   - `https://cms.bluven.com.au/api/globals/site-settings` → JSON
   - `https://cms.bluven.com.au/admin` → 登录页（用 2.8 建的账号能登录）
   - 后台随便打开一张已上传图片 → 图片 URL 是 `cms.bluven.com.au/uploads/...` 且能显示

---

## 完成后的状态 & 下一步

到这里 CMS 就是正式生产状态了：数据在 Railway Postgres，图片在 R2，
域名 `cms.bluven.com.au`，每次 `git push origin main` 会自动重新构建部署
（迁移自动跑，幂等安全）。

**下一步（回来找我做）**：Netlify 部署前端 → 前端环境变量指向
`https://cms.bluven.com.au` → 在临时域名上完整验证（表单、图片、新闻）→
一切通过后才把 `www.bluven.com.au` 从旧站切到新站。切换前旧站不受任何影响。

## 常见问题

| 症状 | 原因 / 解法 |
|---|---|
| 部署卡在 Pre-deploy 报错 | 看日志。多半是 `DATABASE_URL` 引用没写对（必须是 `${{Postgres.DATABASE_URL}}` 原文） |
| 健康检查一直红 | `SERVER_URL` 是否带了 `https://`；Deployments 日志里服务是否真的启动 |
| /admin 打开是 404 | 用浏览器打开（不是 curl）；还不行就看构建日志里 `payload build` 是否成功 |
| 上传图片后 R2 桶里没东西 | R2 四个变量有缺失或拼错——缺一个就整体静默禁用 |
| 后台登录不上 / 一直跳回登录页 | `SERVER_URL` 和你实际访问的域名不一致（CSRF 拦截）。用哪个域名访问，`SERVER_URL` 就填哪个 |
| 邮件收不到 | SMTP 六个值和本地 `.env` 逐个核对；Zoho 可能要在邮箱后台允许 SMTP |
