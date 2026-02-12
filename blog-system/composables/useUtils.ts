import { pinyin } from 'pinyin-pro'

export const useUtils = () => {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    if (days < 30) return `${Math.floor(days / 7)}周前`
    if (days < 365) return `${Math.floor(days / 30)}个月前`
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatAuthorName = (profile: any) => {
    if (!profile) return '匿名用户'
    const name = Array.isArray(profile) ? profile[0]?.name : profile?.name
    return name || '匿名用户'
  }

  const generateSlug = (title: string): string => {
    try {
      const pinyinResult = pinyin(title, {
        toneType: 'none',
        separator: '-',
      })
      
      let slug = pinyinResult
        .toLowerCase()
        .trim()
        .replace(/[^\w-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      if (!slug || slug.length < 2) {
        slug = `post-${Date.now()}`
      }
      
      if (slug.length > 100) {
        slug = slug.substring(0, 100).replace(/-[^-]*$/, '')
      }
      
      return slug
    } catch (error) {
      console.error('Error generating slug:', error)
      return `post-${Date.now()}`
    }
  }

  return {
    formatDate,
    formatRelativeDate,
    formatAuthorName,
    generateSlug,
  }
}
