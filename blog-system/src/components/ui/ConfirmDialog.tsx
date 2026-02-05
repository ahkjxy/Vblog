'use client'

import { Modal, ModalFooter, ModalBody } from './Modal'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <ModalBody>
        <div className="flex items-start gap-4">
          {variant === 'danger' && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            'text-gray-700 bg-white border border-gray-300',
            'hover:bg-gray-50',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variant === 'danger'
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500'
          )}
        >
          {isLoading ? '处理中...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}
