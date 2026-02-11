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
  MessageCircle,
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
  MessageCircle,
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
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = isActive(item.href)
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold relative overflow-hidden',
              active
                ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg shadow-[#FF4D94]/20'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 hover:text-[#FF4D94]'
            )}
          >
            {active && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] opacity-100"></div>
            )}
            <Icon className={cn('w-5 h-5 relative z-10 transition-colors', active ? 'text-white' : 'text-gray-500 group-hover:text-[#FF4D94]')} />
            <span className="relative z-10">{item.label}</span>
            {active && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/40 rounded-l-full"></div>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
