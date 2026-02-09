-- 修复 avatar_url 被截断的问题

-- 步骤 1: 确保 avatar_url 字段是 TEXT 类型（无长度限制）
ALTER TABLE profiles 
ALTER COLUMN avatar_url TYPE TEXT;

-- 步骤 2: 查看修复后的结果
SELECT 
    id,
    name,
    avatar_url,
    LENGTH(avatar_url) as url_length,
    CASE 
        WHEN avatar_url IS NULL THEN '无头像'
        WHEN avatar_url LIKE '%-%' AND LENGTH(avatar_url) < 50 THEN '⚠️ URL 可能被截断'
        WHEN avatar_url LIKE 'https://%' THEN '✅ URL 格式正确'
        ELSE '❓ 未知格式'
    END as status
FROM profiles
ORDER BY name;

-- 步骤 3: 如果 URL 已经被截断，需要重新上传头像
-- 提示：请在应用中重新上传头像，或者手动更新 avatar_url 字段
