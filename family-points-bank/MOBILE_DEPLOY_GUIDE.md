# 📱 移动端部署与消息修复指南

## 1. 修复消息发送失败 (Critical) 🚨

您遇到手机端无法发送消息的问题，是因为 Supabase 的数据库权限策略 (RLS) 配置有误。
请必须执行以下 SQL 修复脚本：

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入 **SQL Editor**
3. 复制文件 `supabase/migrations/005_fix_messages_rls.sql` 的全部内容
4. 在 SQL Editor 中执行 (Run)

这将：
- ✅ 修复 `messages` 表的 RLS 策略 (允许家庭成员读写)
- ✅ 统一字段类型为 UUID (提高兼容性)
- ✅ 确保 ID 和 时间戳有默认值

## 2. 更新安卓图标与通知

我已经更新了项目配置，现在请在终端运行以下命令来构建最新的 App：

```bash
# 1. 构建 Web 资源 (确保 manifest 和代码更新)
yarn build

# 2. 同步到 Android 项目
npx cap sync android

# 3. (可选) 如果之前没生成好图标，再次强制生成
npx @capacitor/assets generate --android
```

## 3. 安卓通知测试

新版代码已支持系统原生通知：
- **头像显示**: 通知栏将尝试显示发送者的头像 (需网络加载)。
- **分组折叠**: 多条消息会自动折叠在 "家庭群聊" 组下。
- **点击消除**: 点击通知后会自动从状态栏消失，并打开聊天窗口。

⚠️ **注意**: 安卓 13+ 需要用户在首次启动时点击 "允许发送通知"。如果之前拒绝过，请在系统设置中手动开启。
