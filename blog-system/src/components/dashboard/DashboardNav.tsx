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
    <nav className="space-y-2">
      {items.map((item) => {
        const active = isActive(item.href)
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold relative overflow-hidden',
              active
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
            )}
          >
            {active && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100"></div>
            )}
            <Icon className={cn('w-5 h-5 relative z-10', active ? 'text-white' : 'text-gray-500 group-hover:text-purple-600')} />
            <span className="relative z-10">{item.label}</span>
            {active && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full"></div>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
