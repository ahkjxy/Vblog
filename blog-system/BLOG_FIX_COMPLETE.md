# Blog 列表页筛选功能修复完成

## 修复日期
2026-02-12

## 问题描述
在 `/blog` 页面添加分类筛选、搜索和分页功能后，页面出现 500 服务器错误。

## 根本原因

### 1. computed 值在 SSR 中的问题
```typescript
// ❌ 错误的方式
const currentPage = computed(() => Number(route.query.page) || 1)
const { data } = await useAsyncData(
  `key-${currentPage.value}`,  // computed.value 在 SSR 中可能未初始化
  async () => { ... }
)
```

### 2. useSupabaseClient 的作用域问题
```typescript
// ❌ 错误的方式
const client = useSupabaseClient()  // 在 setup 顶层
const { data } = await useAsyncData(
  'key',
  async () => {
    client.from('posts')...  // 使用外部 client
  }
)
```

## 解决方案

### 1. 直接读取 route.query，不使用 computed
```typescript
// ✅ 正确的方式
const currentPage = Number(route.query.page) || 1
const selectedCategory = (route.query.category as string) || ''
const searchQuery = (route.query.search as string) || ''

const { data } = await useAsyncData(
  `key-${currentPage}-${selectedCategory}-${searchQuery}`,
  async () => { ... }
)
```

### 2. 在 useAsyncData 内部调用 useSupabaseClient
```typescript
// ✅ 正确的方式
const { data } = await useAsyncData(
  'key',
  async () => {
    const client = useSupabaseClient()  // 在内部调用
    const { data } = await client.from('posts')...
    return data
  }
)
```

## 工作原理

### 页面导航流程
1. 用户点击"应用筛选"按钮
2. `router.push({ path: '/blog', query: { ... } })` 更新 URL
3. 页面重新渲染
4. `route.query` 的值更新
5. `currentPage`、`selectedCategory`、`searchQuery` 重新计算
6. useAsyncData 的 key 变化
7. Nuxt 自动重新获取数据

### 为什么不需要 computed 或 watch
- Nuxt 的页面导航会触发完整的重新渲染
- 每次渲染时，`route.query` 都是最新的值
- 直接读取比 computed 更简单、更可靠
- useAsyncData 的 key 变化会自动触发数据重新获取

## 功能特性

### 1. 分类筛选
- 下拉选择器显示所有分类
- 选择分类后只显示该分类的文章
- "全部分类"选项显示所有文章

### 2. 搜索功能
- 搜索框支持按标题和摘要搜索
- 使用 PostgreSQL 的 `ilike` 进行模糊搜索
- 支持回车键快速搜索

### 3. 分页功能
- 每页显示 10 条文章
- 智能页码显示（最多 7 个页码）
- 上一页/下一页按钮
- 当前页高亮显示
- 分页保持筛选条件

### 4. 筛选条件显示
- 实时显示当前筛选条件
- 彩色标签显示活动筛选
- "清除筛选"按钮

### 5. 结果统计
- 显示找到的主题总数
- 显示当前页码和总页数

## URL 参数

- `page`: 当前页码（默认 1）
- `category`: 分类 ID（可选）
- `search`: 搜索关键词（可选）

### 示例 URL
```
/blog                                    # 所有文章
/blog?category=xxx                       # 按分类筛选
/blog?search=关键词                      # 搜索
/blog?category=xxx&search=关键词&page=2  # 组合筛选
```

## 代码变更

### 修改的文件
- `blog-system/pages/blog/index.vue` - 主要修复
- `blog-system/BLOG_500_FIX.md` - 更新文档

### 关键代码片段

#### 参数读取
```typescript
const route = useRoute()
const currentPage = Number(route.query.page) || 1
const selectedCategory = (route.query.category as string) || ''
const searchQuery = (route.query.search as string) || ''
```

#### 数据获取
```typescript
const { data: blogData, pending } = await useAsyncData(
  `blog-list-${currentPage}-${selectedCategory}-${searchQuery}`,
  async () => {
    const client = useSupabaseClient()
    // ... 查询逻辑
  }
)
```

#### 筛选应用
```typescript
const applyFilters = () => {
  const query: any = {}
  if (localSearch.value) query.search = localSearch.value
  if (localCategory.value) query.category = localCategory.value
  query.page = 1
  router.push({ path: '/blog', query })
}
```

## 测试清单

- [x] 访问 `/blog` - 显示所有文章
- [x] 选择分类 - 只显示该分类的文章
- [x] 输入搜索关键词 - 显示匹配的文章
- [x] 组合使用分类和搜索 - 正确筛选
- [x] 点击分页 - 保持筛选条件
- [x] 点击"清除筛选" - 显示所有文章
- [x] 页面不再出现 500 错误

## 性能优化

1. **自动缓存**
   - useAsyncData 自动缓存结果
   - 相同的 key 不会重复请求

2. **智能查询**
   - 只查询必要的字段
   - 使用 `count: 'exact'` 获取总数
   - 使用 `range` 进行分页

3. **并行请求**
   - 侧边栏数据并行获取
   - 减少总体加载时间

## 注意事项

1. **TypeScript 错误**
   - 编辑器可能显示 `useRoute`、`useSupabaseClient` 等未定义
   - 这些是误报，Nuxt 3 会自动导入
   - 运行时不会有问题

2. **SSR 兼容性**
   - 所有查询都在服务端和客户端执行
   - 确保查询是幂等的

3. **移动端优化**
   - 筛选器在小屏幕上堆叠显示
   - 分页按钮在移动端简化

## 相关文档

- `blog-system/BLOG_LIST_FEATURES.md` - 功能说明
- `blog-system/BLOG_500_FIX.md` - 错误修复详情

## 总结

通过移除 computed 值和将 useSupabaseClient 移到 useAsyncData 内部，成功修复了 500 错误。现在 `/blog` 页面可以正常工作，支持分类筛选、搜索和分页功能。
