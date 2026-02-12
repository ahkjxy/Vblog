# Blog 页面 500 错误修复

## 问题
访问 `/blog` 页面时出现 500 服务器错误。

## 原因分析

1. **computed 值在 SSR 中的问题**
   - 使用 `computed(() => route.query.page)` 在服务端渲染时可能导致问题
   - computed 值在 useAsyncData 的 key 中使用时，服务端可能还未完全初始化

2. **useSupabaseClient 的作用域问题**
   - 在 setup 顶层定义 `const client = useSupabaseClient()` 可能导致 SSR 问题
   - 应该在 useAsyncData 内部调用

## 解决方案

### 1. 移除 computed，直接读取 route.query

**之前的代码：**
```typescript
const client = useSupabaseClient()

const currentPage = computed(() => Number(route.query.page) || 1)
const selectedCategory = computed(() => (route.query.category as string) || '')
const searchQuery = computed(() => (route.query.search as string) || '')

const localSearch = ref(searchQuery.value)
const localCategory = ref(selectedCategory.value)

const { data: blogData, pending } = await useAsyncData(
  `blog-list-${currentPage.value}-${selectedCategory.value}-${searchQuery.value}`,
  async () => {
    const offset = (currentPage.value - 1) * POSTS_PER_PAGE
    let query = client.from('posts')...  // ❌ 使用外部的 client
  }
)
```

**修复后：**
```typescript
// ✅ 直接读取，不使用 computed
const currentPage = Number(route.query.page) || 1
const selectedCategory = (route.query.category as string) || ''
const searchQuery = (route.query.search as string) || ''

const localSearch = ref(searchQuery)
const localCategory = ref(selectedCategory)

const { data: blogData, pending } = await useAsyncData(
  `blog-list-${currentPage}-${selectedCategory}-${searchQuery}`,
  async () => {
    const client = useSupabaseClient()  // ✅ 在内部调用
    const offset = (currentPage - 1) * POSTS_PER_PAGE
    let query = client.from('posts')...
  }
)
```

### 2. 简化 SEO 配置

保持简单的 SEO 配置，不使用复杂的函数调用：

```typescript
useSeoMeta({
  title: '社区讨论 - 元气银行社区',
  description: '浏览元气银行社区的所有讨论主题...',
})
```

## 工作原理

### useAsyncData 的 key 机制

Nuxt 3 的 `useAsyncData` 会根据 key 的变化自动重新获取数据：

```typescript
const key = `blog-list-${currentPage}-${selectedCategory}-${searchQuery}`
```

当 URL 参数变化时：
1. 页面重新渲染，`route.query` 的值会变化
2. `currentPage`、`selectedCategory`、`searchQuery` 会重新计算
3. key 会自动更新
4. Nuxt 会检测到 key 变化，自动重新执行数据获取函数
5. 不需要 computed 或 watch 选项

### 筛选功能流程

1. 用户输入搜索关键词或选择分类
2. 点击"应用筛选"按钮
3. `applyFilters()` 函数更新 URL 参数
4. URL 变化触发页面重新渲染
5. `useAsyncData` 的 key 变化，自动重新获取数据

```typescript
const applyFilters = () => {
  const query: any = {}
  
  if (localSearch.value) {
    query.search = localSearch.value
  }
  
  if (localCategory.value) {
    query.category = localCategory.value
  }
  
  query.page = 1  // 重置到第一页
  
  router.push({ path: '/blog', query })  // 更新 URL
}
```

## 关键修复点

1. **移除 computed**
   - 不使用 `computed(() => route.query.page)`
   - 直接读取 `Number(route.query.page) || 1`
   - 让页面重新渲染时自然更新值

2. **useSupabaseClient 在内部调用**
   - 不在 setup 顶层定义 client
   - 在 useAsyncData 内部调用 `useSupabaseClient()`
   - 避免 SSR 作用域问题

3. **简化 ref 初始化**
   - `ref(searchQuery)` 而不是 `ref(searchQuery.value)`
   - 因为 searchQuery 已经是普通值，不是 computed

4. **简化类型标注**
   - `(c: any)` 而不是依赖类型推断
   - 避免 TypeScript 在 SSR 中的类型问题

## 测试步骤

1. 访问 `/blog` - 应该显示所有文章
2. 选择一个分类 - 应该只显示该分类的文章
3. 输入搜索关键词 - 应该显示匹配的文章
4. 组合使用分类和搜索 - 应该正确筛选
5. 点击分页 - 应该保持筛选条件
6. 点击"清除筛选" - 应该显示所有文章

## 注意事项

1. **TypeScript 错误**
   - 编辑器可能显示 `useRoute`、`useSupabaseClient` 等未定义的错误
   - 这些是误报，Nuxt 3 会自动导入这些函数
   - 运行时不会有问题

2. **服务端渲染**
   - 数据获取在服务端和客户端都会执行
   - 确保所有查询都是幂等的（多次执行结果相同）

3. **性能优化**
   - `useAsyncData` 会自动缓存结果
   - 相同的 key 不会重复请求
   - 页面导航时会复用缓存的数据

## 相关文件

- `blog-system/pages/blog/index.vue` - Blog 列表页面
- `blog-system/BLOG_LIST_FEATURES.md` - 功能说明文档
