import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { pinyin } from 'pinyin-pro'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  try {
    // 将中文转换为拼音
    const pinyinResult = pinyin(title, {
      toneType: 'none', // 不带声调
      separator: '-', // 使用连字符分隔
    })
    
    // 清理和标准化
    let slug = pinyinResult
      .toLowerCase()
      .trim()
      // 移除特殊字符，只保留字母、数字和连字符
      .replace(/[^\w-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // 如果 slug 为空或太短，使用时间戳
    if (!slug || slug.length < 3) {
      slug = `post-${Date.now()}`
    }
    
    // 限制长度（最多 100 个字符）
    if (slug.length > 100) {
      slug = slug.substring(0, 100).replace(/-[^-]*$/, '') // 在最后一个完整单词处截断
    }
    
    return slug
  } catch (error) {
    console.error('Error generating slug:', error)
    // 如果拼音转换失败，使用时间戳
    return `post-${Date.now()}`
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化作者显示名称为"XX的家庭"
export function formatAuthorName(profile: any): string {
  if (!profile) return '匿名用户'
  
  // 直接在 profile.name 后面加上"的家庭"
  if (profile.name) {
    return `${profile.name}的家庭`
  }
  
  return '匿名用户'
}
