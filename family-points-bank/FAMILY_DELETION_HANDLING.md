# 家庭删除后的处理逻辑

## 问题描述
当家庭被删除后，用户尝试同步时会遇到外键约束错误：
```json
{
  "code": "23503",
  "message": "insert or update on table \"family_members\" violates foreign key constraint \"family_members_family_id_fkey\""
}
```

之前的行为是显示错误提示："同步失败家庭未开通或链接失效，请检查 Sync ID。"

## 新的处理逻辑
现在当检测到家庭已被删除时，系统会：
1. **不显示任何错误提示**
2. **自动退出登录**
3. **清除本地数据**
4. **直接跳转到登录页面**

## 实现细节

### 1. 在 `ensureFamilyForSession` 函数中
- 捕获 `family_members` 表的 upsert 操作错误
- 检测错误码是否为 `23503`（外键约束失败）
- 如果是，执行清理和跳转操作

### 2. 在 `fetchData` 函数中
- 当查询 `families` 表失败时（家庭不存在）
- 直接执行清理和跳转操作，不设置 `fatalError`

## 代码位置
- 文件：`family-points-bank/App.tsx`
- 函数：
  - `ensureFamilyForSession` (约第 430 行)
  - `fetchData` (约第 550 行)

## 用户体验
用户删除家庭后：
1. 其他设备上的用户尝试同步时
2. 不会看到任何错误提示
3. 自动返回登录页面
4. 可以重新登录并创建新的家庭

## 测试场景
1. 用户 A 在设备 1 上删除家庭
2. 用户 B 在设备 2 上尝试同步
3. 设备 2 应该自动跳转到登录页面，不显示错误

## 相关文件
- `family-points-bank/App.tsx` - 主要逻辑实现
- `family-points-bank/supabase/FIX_DELETE_FUNCTION_FINAL.sql` - 删除家庭的数据库函数
- `family-points-bank/supabase/FORCE_DELETE_FAMILY.sql` - 强制删除家庭的脚本
