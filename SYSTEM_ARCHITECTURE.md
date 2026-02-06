# 系统架构说明

## 两个系统的数据模型 - 正确理解

### 共同点：都创建家庭
- **Blog 系统**和**Family 系统**都会创建 families 记录
- 一个家庭可以有多个成员（家长 + 孩子）
- 数据结构完全相同，共享同一个数据库

### Blog 系统（博客系统）
- **使用范围**：只使用家庭中的**家长**
- **注册流程**：
  1. 用户注册 → 创建 `auth.user`
  2. 触发器自动创建 `families` 记录（"XX的家庭"）
  3. 触发器自动创建 `profiles` 记录（家长，role='parent' 或 'admin'）
- **特点**：
  - 只有家长可以登录博客系统
  - 只有家长可以发布文章
  - 孩子成员对博客系统不可见
  - 用户管理页面：显示所有家庭的家长（不显示孩子）
- **显示逻辑**：
  - Header 显示：家长名字（如"王僚原"）
  - 文章列表显示：家长名字 + "的家庭"（如"王僚原的家庭"）

### Family 系统（家庭积分银行）
- **使用范围**：使用家庭中的**所有成员**（家长 + 孩子）
- **成员结构**：
  - 家长（role='parent' 或 'admin'）：可以登录，管理家庭
  - 孩子（role='child' 或 'moppet'）：不能登录，只是家庭成员
- **特点**：
  - 家长登录后可以看到所有家庭成员
  - 可以添加/删除孩子成员
  - 孩子有积分、任务、奖励等数据
  - 成员管理页面：显示当前家庭的所有成员（家长 + 孩子）
- **显示逻辑**：
  - 成员列表：显示家长和所有孩子
  - 积分排行：包含所有成员

## 数据库表结构

### families 表
```sql
- id (UUID, PK)
- name (TEXT) -- 家庭名称，如"王僚原的家庭"
- created_at
```

### profiles 表
```sql
- id (UUID, PK) -- 对于家长，这个 ID = auth.user.id
- family_id (UUID, FK -> families.id)
- name (TEXT) -- 成员名字
- role (TEXT) -- 'admin'/'parent'(家长) 或 'child'/'moppet'(孩子)
- balance (INT) -- 积分余额（Family系统使用）
- avatar_color, avatar_url, level, experience, bio
- created_at
```

### auth.users 表（Supabase 内置）
```sql
- id (UUID, PK)
- email (TEXT)
- 只有家长有 auth.user 记录
- 孩子没有 auth.user 记录，不能登录
```

## 关键关系

### 家长（Parent）
- 有 `auth.user` 记录（可以登录）
- 有 `profiles` 记录（profile.id = auth.user.id）
- 有 `families` 记录（是家庭的创建者）
- **在 Blog 系统中**：可以发布文章，管理内容
- **在 Family 系统中**：可以管理家庭成员，分配任务和奖励

### 孩子（Child）
- 没有 `auth.user` 记录（不能登录）
- 有 `profiles` 记录（profile.id 是独立的 UUID）
- 属于某个家庭（profile.family_id 指向家长的家庭）
- **在 Blog 系统中**：不可见，不参与任何功能
- **在 Family 系统中**：有积分、任务、奖励等数据

### 数据共享
- 两个系统共享同一个 `families` 表和 `profiles` 表
- Blog 系统只查询 role='parent' 或 'admin' 的 profiles
- Family 系统查询所有 profiles（包括家长和孩子）

## 当前问题与解决方案

### Blog 系统 - 用户管理页面

**需求**：
- 显示所有家庭的**家长**（不显示孩子）
- 每个家长都是独立的博客作者
- 只有超级管理员可以访问

**实现逻辑**：
```typescript
// 查询所有 profiles
const { data } = await supabase
  .from('profiles')
  .select('*, families:family_id(id, name)')
  .order('created_at', { ascending: false })

// 过滤：只显示家长（role='parent' 或 'admin'）
// 不显示孩子（role='child' 或 'moppet'）
```

**显示内容**：
- 用户名
- 家庭名称
- 角色（家长/超级管理员）
- 注册时间
- 操作按钮（编辑、删除）

### Family 系统 - 成员管理

**需求**：
- 显示当前登录家长所在家庭的**所有成员**（家长 + 孩子）
- 家长可以添加/删除孩子
- 家长可以管理成员的积分和权限

**实现逻辑**：
```typescript
// 获取当前用户的 family_id
const { data: currentProfile } = await supabase
  .from('profiles')
  .select('family_id')
  .eq('id', auth.uid())
  .single()

// 查询该家庭的所有成员
const { data: members } = await supabase
  .from('profiles')
  .select('*')
  .eq('family_id', currentProfile.family_id)
```

**显示内容**：
- 成员名字
- 角色（家长/孩子）
- 积分余额
- 等级
- 操作按钮（编辑、调整积分、删除）

## 自动注册触发器

### 当前触发器（需要修复）
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_family_id UUID;
  v_user_name TEXT;
BEGIN
  -- 从 email 或 metadata 中获取用户名
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- 为新用户创建一个家庭
  INSERT INTO public.families (name)
  VALUES (v_user_name || '的家庭')
  RETURNING id INTO v_family_id;
  
  -- 创建用户的 profile，关联到新创建的家庭
  INSERT INTO public.profiles (id, family_id, name, role)
  VALUES (
    NEW.id,
    v_family_id,
    v_user_name,
    'parent'  -- 默认角色为家长
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 触发器说明
- 当新用户注册时自动触发
- 创建一个新家庭（"XX的家庭"）
- 创建家长的 profile 记录（profile.id = auth.user.id）
- 默认角色为 'parent'

## 超级管理员

### 特殊家庭
- Family ID: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`
- 家长：王僚原
- Role: 'admin'（超级管理员）
- 邮箱：ahkjxy@qq.com

### 权限
- 可以审核所有文章
- 可以管理所有分类和标签
- 但用户管理页面也只显示自己家庭的成员

## 最佳实践

### Blog 系统
1. **用户注册**：自动创建家庭和家长 profile
2. **用户管理**：显示所有家长（过滤掉孩子）
3. **文章作者**：只有家长可以发布文章
4. **显示格式**："XX的家庭"
5. **权限控制**：
   - 超级管理员：可以管理所有内容
   - 普通家长：只能管理自己的文章
6. **查询模式**：
   ```sql
   -- 获取所有博客作者（只要家长）
   SELECT * FROM profiles
   WHERE role IN ('parent', 'admin')
   ORDER BY created_at DESC;
   ```

### Family 系统
1. **家长登录**：看到自己家庭的所有成员
2. **添加成员**：家长可以添加孩子（不需要 auth.user）
3. **成员管理**：显示当前家庭的所有成员（家长 + 孩子）
4. **多成员功能**：
   - 积分管理
   - 任务分配
   - 奖励兑换
   - 成员角色管理
5. **查询模式**：
   ```sql
   -- 获取当前家庭的所有成员
   SELECT * FROM profiles
   WHERE family_id = (
     SELECT family_id FROM profiles WHERE id = auth.uid()
   );
   ```

## 数据隔离

### RLS 策略
- profiles 表：用户只能看到自己家庭的成员
- posts 表：作者可以看到自己的文章，公开文章所有人可见
- comments 表：所有人可以看到已批准的评论
- storage：用户只能访问自己的文件夹

### 查询模式
```sql
-- 获取当前用户的家庭成员
SELECT * FROM profiles
WHERE family_id = (
  SELECT family_id FROM profiles WHERE id = auth.uid()
);

-- 获取当前用户的家庭信息
SELECT f.* FROM families f
JOIN profiles p ON p.family_id = f.id
WHERE p.id = auth.uid();
```

## 注意事项

1. **数据结构相同，使用方式不同**：
   - 两个系统共享 families 和 profiles 表
   - Blog 系统：只使用家长（role='parent'/'admin'）
   - Family 系统：使用所有成员（家长 + 孩子）

2. **孩子成员的可见性**：
   - Blog 系统：孩子不可见，查询时需要过滤掉
   - Family 系统：孩子是核心数据，必须显示

3. **登录权限**：
   - 只有家长（有 auth.user）可以登录
   - 孩子（没有 auth.user）不能登录任何系统

4. **查询时的过滤**：
   - Blog 系统查询用户：`WHERE role IN ('parent', 'admin')`
   - Family 系统查询成员：`WHERE family_id = current_family_id`

5. **角色命名统一**：
   - 家长：'parent' 或 'admin'（超级管理员）
   - 孩子：'child' 或 'moppet'

6. **用户管理页面的区别**：
   - Blog 系统：显示所有家长（跨家庭）
   - Family 系统：显示当前家庭的所有成员（家长+孩子）

7. **数据一致性**：
   - 在 Family 系统中添加的孩子，Blog 系统不会显示
   - 在 Blog 系统中注册的家长，Family 系统可以看到并添加孩子
