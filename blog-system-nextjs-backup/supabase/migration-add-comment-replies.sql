-- 添加评论回复功能
-- 为 comments 表添加 parent_id 字段，用于支持评论回复

-- 1. 添加 parent_id 字段
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 2. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 3. 添加评论以确保不会出现循环引用（可选，但推荐）
-- 评论的回复深度限制为1层（只能回复顶级评论，不能回复回复）
-- 这个约束可以在应用层实现，这里只是添加字段

COMMENT ON COLUMN comments.parent_id IS '父评论ID，如果为NULL则是顶级评论，否则是回复';
