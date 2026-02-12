# 谷歌广告审计报告

## 当前广告位置

### 1. 文章详情页 (`/blog/[slug].vue`)
- **位置**: 右侧边栏顶部
- **状态**: ✅ 已配置
- **组件**: `<BannerAd />`
- **AdSense 脚本**: ✅ 已加载

### 2. 论坛列表页 (`/blog/index.vue`)
- **位置**: 右侧边栏（热门主题和最新主题之间）
- **状态**: ✅ 已配置
- **组件**: `<BannerAd />`

### 3. 首页 (`/pages/index.vue`)
- **位置**: ❌ 未配置
- **建议**: 应该添加广告位

## 问题和建议

### 问题 1: 首页缺少广告位
**影响**: 首页是流量最大的页面，缺少广告会损失收入

**建议位置**:
1. 右侧边栏 - 在"热门主题"和"最新主题"之间
2. 主内容区 - 在"精选文章"和"讨论板块"之间（横幅广告）

### 问题 2: BannerAd 组件配置
**当前状态**: 
- 使用 `data-ad-format="auto"` 和 `data-full-width-responsive="true"`
- 这是响应式广告，会自动适应容器大小

**建议**: 
- 为不同位置创建不同的广告单元
- 使用不同的 slot ID 以便追踪效果

### 问题 3: 广告加载时机
**当前**: 在 `onMounted` 时推送广告
**建议**: 保持当前方式，这是正确的做法

## 优化建议

### 1. 创建多个广告组件

```vue
<!-- components/ads/SidebarAd.vue -->
<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6">
    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">广告</div>
    <BannerAd slot-type="sidebar" />
  </div>
</template>

<!-- components/ads/InArticleAd.vue -->
<template>
  <div class="my-8">
    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">广告</div>
    <BannerAd slot-type="article" />
  </div>
</template>

<!-- components/ads/BannerAd.vue -->
<template>
  <div class="my-6">
    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">广告</div>
    <BannerAd slot-type="banner" />
  </div>
</template>
```

### 2. 更新 BannerAd 组件支持不同 slot

```vue
<script setup lang="ts">
const props = defineProps<{
  slotType?: 'banner' | 'sidebar' | 'article'
}>()

const config = useRuntimeConfig()
const adClient = config.public.adsenseClientId

// 根据类型选择不同的 slot
const adSlot = computed(() => {
  switch (props.slotType) {
    case 'sidebar':
      return config.public.adsenseSidebarSlot
    case 'article':
      return config.public.adsenseArticleSlot
    default:
      return config.public.adsenseBannerSlot
  }
})
</script>
```

### 3. 在首页添加广告

**位置 1: 右侧边栏**
```vue
<!-- 在"热门主题"和"最新主题"之间 -->
<div class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
  <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">广告</div>
  <BannerAd slot-type="sidebar" />
</div>
```

**位置 2: 主内容区（可选）**
```vue
<!-- 在"精选文章"和"讨论板块"之间 -->
<div class="my-8">
  <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">广告</div>
  <BannerAd slot-type="banner" />
</div>
```

### 4. 广告位置最佳实践

#### 高效位置（推荐）:
1. ✅ 文章详情页右侧边栏顶部（当前已有）
2. ✅ 论坛列表页右侧边栏（当前已有）
3. ⭐ 首页右侧边栏（建议添加）
4. ⭐ 文章内容中间（文章详情页，建议添加）

#### 避免的位置:
- ❌ 页面顶部（影响用户体验）
- ❌ 导航栏附近（可能被误点）
- ❌ 页面底部（可见度低）

### 5. 环境变量配置

确保 `.env` 文件包含所有必要的配置:

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=xxxxxxxxxx
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=xxxxxxxxxx
NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=xxxxxxxxxx
```

## 实施优先级

### 高优先级 (立即实施)
1. ✅ 在首页右侧边栏添加广告
2. ✅ 更新 BannerAd 组件支持多个 slot

### 中优先级 (本周实施)
1. 在文章详情页内容中添加文章内广告
2. 创建不同类型的广告组件

### 低优先级 (可选)
1. A/B 测试不同广告位置的效果
2. 添加广告性能追踪

## 注意事项

1. **AdSense 政策合规**:
   - 不要在广告附近放置误导性内容
   - 不要鼓励用户点击广告
   - 确保广告标签清晰（"广告"字样）

2. **用户体验**:
   - 广告不应影响页面加载速度
   - 广告不应遮挡主要内容
   - 移动端广告应适当调整大小

3. **性能优化**:
   - 使用懒加载（当前已实现）
   - 避免在首屏加载过多广告
   - 使用 `async` 加载 AdSense 脚本（当前已实现）

## 预期收益

添加首页广告后，预计可以提升 30-50% 的广告收入，因为:
- 首页通常是流量最大的页面
- 用户在首页停留时间较长
- 首页访问频率高
