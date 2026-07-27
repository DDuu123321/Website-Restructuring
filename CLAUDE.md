# 项目概要

用途：Bluven Energy（澳大利亚太阳能 + 储能服务商）官网重构。对外是营销展示站（视频 Hero / 产品 / Who We Are / 新闻等），对内用 Payload CMS 管理内容，并收集三类销售线索：询价（/quote）、客户评价（reviews）、新闻订阅。

技术栈：
- 前端 `frontend/`：Next.js 14.2（App Router）+ React 18 + TypeScript 5 + TanStack Query，部署在 Vercel。
- 后端 `cms/`：Payload CMS 2.32 + PostgreSQL（@payloadcms/db-postgres）+ Express + Nodemailer（Zoho SMTP）+ webpack bundler。
- 结构：monorepo 风格，`frontend/` 与 `cms/` 是两个独立 npm 包，**根目录没有 package.json**；另有 `uploads/`（CMS 运行时上传，不入 git）。旧站存档已于 2026-07-27 从 HEAD 删除，需要时从 tag 取回：`git checkout legacy-archive-2026-07-27 -- legacy/`。

跑测试：项目无自动化测试框架。改动后用以下命令自检——
- 前端：`cd frontend && npm run type-check`（tsc --noEmit）+ `npm run lint`，必要时 `npm run build`
- CMS：`cd cms && npm run build`（tsc 类型检查）
- 本地运行：前端 `cd frontend && npm run dev`（:3000）；CMS `cd cms && npm run dev`

# 行为准则（Karpathy 原则）

## Think Before Coding
- 假设必须说清楚，不确定就问
- 有多个方案时列出，不要默默选一个
- 有更简单的方法就说出来

## 消除信息差
- **追问**：用户描述有歧义或缺失关键信息时，先追问再动手
- **质疑**：即使指令看似完整，也多想一步——有没有逻辑漏洞？有没有被忽略的前提？
- 质疑要带证据：说出你观察到的问题 + 给出替代方案
- 用户说"就这样做"不意味着就是对的——双方可能存在你看不到的盲区

## 讨论与执行分离
- 讨论阶段只分析、提问、列方案，不修改文件
- 不要自己判断"讨论已经够了"——问出口才算数
- 用户明确同意执行后才动手，一次只做一件事

## Simplicity First
- 不多写一行没被要求的代码
- 不加不需要的抽象、配置、灵活性
- 如果写了 200 行但能缩成 50 行，重写

## Surgical Changes
- 只动必须动的代码，不顺手"改善"无关代码
- 不重构没坏的东西
- 每行改动的代码都应能追溯到用户请求

## Goal-Driven Execution
- 每个任务转成可验证的目标
- 多步骤任务先列计划再动手

# 全局约定

- **规则放 CLAUDE.md，工作流放 Skills**
- 涉及文件操作先问用户意图
- 每次对话只给 AI 看需要的内容，避免无关上下文稀释注意力

## 项目特定约定
- monorepo：前端改动落 `frontend/`，CMS 改动落 `cms/`，跑命令前先 `cd` 到对应子目录
- 直推 main 是本项目既定工作流（单人开发，已授权 `git push origin main`），无需开 PR
- `.env` / `.env.local` 由 PreToolUse Hook 硬保护，AI 不能直接写；改环境变量请手动编辑
- CMS 上传（`uploads/`）、`cms/src/payload-types.ts` 等生成物不入 git

# 自动审查闭环

- SessionStart 自动注入 git 状态
- PreToolUse 自动拦截危险操作（写 .env / rm -rf / git push --force）
- Stop 自动生成审查报告至 .claude/reviews/（按日期累积）
- 下次 SessionStart 自动加载最近几次审查记录

# Skill 路由

根据项目技术栈和任务类型，优先调用以下 Skill（仅列当前会话实际可用的）：

| 任务类型 | Skill | 触发条件 |
|---------|-------|---------|
| 改完代码要验证效果 | verify | 改了前端/CMS 功能，需在浏览器或服务端确认行为 |
| 启动 App / 截图 | run | 要把前端或 CMS 跑起来看实际效果 |
| 提交前审查 diff | code-review | push 前查 bug / 复用与简化机会 |
| 清理与精简 | simplify | 想精简刚写的代码（只做质量清理，不查 bug） |
| 安全检查 | security-review | 改动涉及鉴权 / 表单 / 上传 / SMTP / 环境变量 |
| 调整 Harness | harness-init / harness-mode | 调整 Harness 配置或切换工作模式/阶段 |

> Agent 遇到对应任务时，应优先调用路由表中的 Skill。随时可增删。

# 成熟度路线图

自评你当前的 Harness 工程水平，每级都是上行台阶：

| 级别 | 名称 | 标志 | 你缺什么 |
|:---:|---|----|----|
| L0 | 裸用 | 没有 CLAUDE.md | 一切 |
| L1 | 规则层 | 有 CLAUDE.md + 行为准则 | hooks、自动化 |
| **L2** | **反馈回路** | **PreToolUse + SessionStart + Stop 已激活** | **← 当前在此** |
| **L3** | **自动修正** | **加上 PostToolUse 后自动格式化** | **取消 settings.json 中 PostToolUse 注释即可** |
| L4 | 自治系统 | Agent 定期扫描代码/文档一致性，自动发起修复 PR | 垃圾回收 Agent、定时任务 |

# 扩展方向

以下内容不包含在 Starter 里，按需自行添加：

**PostToolUse 自动格式化** — hook 文件已预设（.claude/hooks/post-tool-check.mjs），在 settings.json 的 `hooks` 中加入 PostToolUse 注册即可启用。检测项目中的 prettier / biome 等工具，每次编辑后自动格式化。无对应工具时静默跳过。

**垃圾回收 Agent**（L4 方向）— 设一个定期运行的 Agent，扫描代码与文档的一致性（比如 README 的 API 示例是否还能跑通），发现不一致就自动创建修复 PR。可以用 MCP + 定时任务实现。
