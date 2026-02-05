'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  FolderOpen, 
  Tag, 
  MessageSquare, 
  Users, 
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface DashboardNavProps {
  items: NavItem[]
}

const iconMap = {
  LayoutDashboard,
  FileText,
  Image,
  FolderOpen,
  Tag,
  MessageSquare,
  Users,
  Settings,
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActive(item.href)
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
              active
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className={cn('w-5 h-5', active && 'text-purple-600')} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
