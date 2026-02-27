# 打赏和定时发布功能设置

## 数据库迁移

在 Supabase Dashboard 的 SQL Editor 中依次执行：

1. `supabase/add-tips-system.sql` - 打赏系统
2. `supabase/add-scheduled-publish.sql` - 定时发布

## 定时任务设置

定时发布需要定期调用 `auto_publish_scheduled_posts()` 函数。

### 方案 1: Supabase Cron (推荐)

在 Supabase Dashboard 启用 pg_cron 扩展，然后执行：

```sql
SELECT cron.schedule(
  'auto-publish-posts',
  '* * * * *',
  $$SELECT auto_publish_scheduled_posts()$$
);
```

### 方案 2: Vercel Cron Job

在 `vercel.json` 添加：

```json
{
  "crons": [{
    "path": "/api/cron/publish-posts",
    "schedule": "* * * * *"
  }]
}
```

创建 API 路由调用函数。

## 功能说明

- 打赏：用户可用虚拟积分打赏文章作者
- 定时发布：设置未来时间自动发布文章
