# 客服聊天功能

## ✅ 已完成的功能

### 1. 客服聊天组件
- **文件**: `src/components/CustomerSupport.tsx`
- **位置**: 页面右下角浮动按钮
- **功能**:
  - 浮动按钮（带红点提示）
  - 展开/收起聊天窗口
  - 实时消息显示
  - 常见问题快捷回复
  - 联系方式卡片
  - 消息输入和发送

### 2. 设计特点

#### 浮动按钮
- 紫粉渐变背景
- 悬浮阴影效果
- 红点提示（animate-pulse）
- 悬浮时显示提示气泡
- 缩放动画效果

#### 聊天窗口
- **尺寸**: 384px × 600px
- **位置**: 右下角固定
- **动画**: slide-up 进入动画
- **样式**: 
  - 圆角 2xl
  - 阴影 2xl
  - 紫色边框

#### Header
- 紫粉渐变背景
- 客服头像（Sparkles 图标）
- 在线状态指示（绿点）
- 关闭按钮

#### 消息区域
- 渐变背景（from-purple-50/30 to-white）
- 用户消息：紫粉渐变背景，右对齐
- 机器人消息：白色背景，左对齐
- 时间戳显示
- 自动滚动到底部

#### 常见问题
- 4个预设问题
- 点击快速发送
- 自动回复答案
- 图标装饰（HelpCircle）

#### 联系方式卡片
- 邮箱：ahkjxy@qq.com
- 网站：familybank.chat
- 渐变背景装饰

#### 输入区域
- 文本输入框
- 发送按钮（渐变背景）
- Enter 键发送
- 24小时回复提示

### 3. 集成方式

#### 前台布局
```tsx
// src/app/(frontend)/layout.tsx
import { CustomerSupport } from '@/components/CustomerSupport'

export default function FrontendLayout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
      <CustomerSupport /> {/* 添加客服组件 */}
    </div>
  )
}
```

#### 外部调用
```tsx
// 从任何页面打开客服聊天
import { openCustomerSupport } from '@/components/CustomerSupport'

<button onClick={() => openCustomerSupport()}>
  联系客服
</button>
```

### 4. 支持页面集成

**文件**: `src/app/(frontend)/support/page.tsx`

"在线客服"卡片的"开始对话"按钮现在会打开客服聊天窗口，而不是跳转到联系页面。

```tsx
{
  icon: MessageCircle,
  title: '在线客服',
  desc: '实时聊天支持',
  action: '开始对话',
  onClick: () => openCustomerSupport(), // 打开客服聊天
}
```

### 5. 常见问题预设

1. **如何开始使用元气银行？**
   - 访问 familybank.chat 即可免费体验

2. **支持哪些平台？**
   - 网页版和安卓应用，iOS 开发中

3. **如何联系技术支持？**
   - 邮箱 ahkjxy@qq.com，24小时内回复

4. **数据安全吗？**
   - 使用 Supabase 企业级安全保障

### 6. 响应式设计

#### 桌面端
- 固定宽度：384px
- 固定高度：600px
- 右下角定位：bottom-6 right-6

#### 移动端
- 自动适配屏幕宽度
- 保持良好的可读性
- 触摸友好的按钮大小

### 7. 交互流程

1. **用户打开聊天**
   - 点击浮动按钮
   - 或点击支持页面的"开始对话"
   - 窗口展开，显示欢迎消息

2. **查看常见问题**
   - 显示4个快捷问题
   - 点击问题自动发送
   - 机器人自动回复答案

3. **输入自定义问题**
   - 在输入框输入问题
   - 点击发送或按 Enter
   - 消息显示在聊天区域
   - 机器人回复引导联系客服

4. **查看联系方式**
   - 消息超过2条后显示联系卡片
   - 包含邮箱和网站链接
   - 点击直接跳转

5. **关闭聊天**
   - 点击 X 按钮
   - 窗口收起，显示浮动按钮

### 8. 技术实现

#### 状态管理
```tsx
const [isOpen, setIsOpen] = useState(false)
const [messages, setMessages] = useState<Message[]>([])
const [inputValue, setInputValue] = useState('')
const [showFAQ, setShowFAQ] = useState(true)
```

#### 消息类型
```tsx
interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}
```

#### 全局事件
```tsx
// 触发打开
window.dispatchEvent(new CustomEvent('openCustomerSupport'))

// 监听事件
window.addEventListener('openCustomerSupport', handleOpen)
```

#### 自动滚动
```tsx
const messagesEndRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
```

### 9. 样式特点

#### 颜色方案
- 主色：紫色 (#7C4DFF) 到粉色 (#FF4D94)
- 用户消息：渐变背景
- 机器人消息：白色背景
- 输入框：灰色边框，紫色聚焦

#### 动画效果
- 浮动按钮：hover 缩放
- 聊天窗口：slide-up 进入
- 消息：平滑滚动
- 按钮：hover 阴影和缩放

#### 圆角规范
- 浮动按钮：rounded-full
- 聊天窗口：rounded-2xl
- 消息气泡：rounded-2xl
- 输入框：rounded-xl
- 按钮：rounded-xl

### 10. 未来扩展

可以考虑添加的功能：

- [ ] 真实的后端消息系统
- [ ] 文件上传功能
- [ ] 表情符号支持
- [ ] 消息已读状态
- [ ] 客服在线/离线状态
- [ ] 历史消息记录
- [ ] 多语言支持
- [ ] 语音消息
- [ ] 视频通话
- [ ] 智能机器人回复（AI）

### 11. 使用示例

#### 在任何页面添加客服按钮
```tsx
'use client'

import { openCustomerSupport } from '@/components/CustomerSupport'

export default function MyPage() {
  return (
    <button onClick={() => openCustomerSupport()}>
      联系客服
    </button>
  )
}
```

#### 自定义触发时机
```tsx
useEffect(() => {
  // 用户停留超过30秒自动打开
  const timer = setTimeout(() => {
    openCustomerSupport()
  }, 30000)
  
  return () => clearTimeout(timer)
}, [])
```

### 12. 注意事项

1. **性能优化**
   - 消息列表使用虚拟滚动（如果消息很多）
   - 图片懒加载
   - 防抖输入

2. **可访问性**
   - 键盘导航支持
   - ARIA 标签
   - 屏幕阅读器友好

3. **安全性**
   - XSS 防护
   - 输入验证
   - 敏感信息过滤

4. **用户体验**
   - 快速响应
   - 清晰的视觉反馈
   - 友好的错误提示

## 📱 移动端适配

- 浮动按钮：w-14 h-14（56px × 56px）
- 聊天窗口：自适应宽度，固定高度
- 触摸友好：按钮最小 44px × 44px
- 输入框：自动聚焦（桌面端）

## 🎨 品牌一致性

- 使用统一的紫粉渐变主题
- 圆角和阴影与整站一致
- 图标风格统一（Lucide Icons）
- 字体和间距规范

## 📊 数据统计（可选）

未来可以添加：
- 聊天会话数
- 平均响应时间
- 用户满意度
- 常见问题点击率
