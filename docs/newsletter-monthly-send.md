# Bluven Monthly — 月报发送手册（CSV → 外部邮件平台）

站内只**收集**订阅邮箱（/news 订阅横幅 → Subscribers 集合），**不做群发**。
月报通过外部邮件平台发送，退订合规也由平台承担。每月流程如下（约 15 分钟）。

## 每月发送流程

1. **导出订阅名单**
   后台 → 📥 Leads → Subscribers → 列表页顶部 **Export CSV**。
   得到含 `email / source / status / createdAt` 的 CSV。

2. **导入邮件平台**（Mailchimp / Brevo / MailerLite 任选，免费档都够用）
   - 新建/更新 Audience，把 CSV 里的 email 列导入；
   - 平台会自动去重（Subscribers 本身 email 唯一，重复导入安全）。

3. **写内容并发送**
   - 素材来源：当月 /news 新文章 + 补贴变化（Policy & Rebates 分类）；
   - 口径红线与网站一致：**不写具体价格 / 不写补贴到手金额 / 不编造安装数字**；
   - 平台模板底部必须保留**自动退订链接**（Mailchimp 等默认强制，勿删）——
     隐私政策（/privacy）向订阅者承诺了每封营销邮件都有退订入口。

4. **同步退订（发送后 1-2 天回来做一次）**
   在平台查看 unsubscribed 名单 → 回到 CMS Subscribers 删除对应记录，
   保证下月导出的 CSV 不再包含他们。

## 注意

- 平台是"退订状态"的唯一权威。如果嫌每月手动同步麻烦，也可以只维护平台
  Audience、CMS 仅当"新增来源"用——每月只导入 `createdAt` 晚于上次导出的新行。
- Spam 法规（Spam Act 2003）三要素：经同意（订阅表单 ✓）、可识别发件人
  （用 @bluven.com.au 发件地址）、可退订（平台链接 ✓）。
- 频率承诺是 "One email a month, no fluff" —— 宁可跳过一个月，不要发凑数内容。
