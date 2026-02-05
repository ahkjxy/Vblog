import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  // Remove special characters and convert to lowercase
  let slug = title
    .toLowerCase()
    .trim()
    // Replace Chinese characters and special chars with hyphen
    .replace(/[\u4e00-\u9fa5]/g, '') // Remove Chinese characters
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  // If slug is empty or too short after processing, use timestamp
  if (!slug || slug.length < 3) {
    slug = `post-${Date.now()}`
  }
  
  return slug
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
