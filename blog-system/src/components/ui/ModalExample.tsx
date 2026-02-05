'use client'

import { useState } from 'react'
import { Modal, ModalBody, ModalFooter } from './Modal'

/**
 * Example component demonstrating Modal usage
 * This can be used for testing and as a reference for implementation
 */
export function ModalExample() {
  const [isBasicOpen, setIsBasicOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLargeOpen, setIsLargeOpen] = useState(false)
  const [isNoCloseOpen, setIsNoCloseOpen] = useState(false)

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Modal Component Examples</h1>

      {/* Basic Modal */}
      <div>
        <button
          onClick={() => setIsBasicOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-lg hover:shadow-lg transition-all"
        >
          Open Basic Modal
        </button>

        <Modal
          isOpen={isBasicOpen}
          onClose={() => setIsBasicOpen(false)}
          title="基本模态框"
          size="md"
        >
          <ModalBody>
            <p className="text-gray-600">
              这是一个基本的模态框示例。点击背景或按 ESC 键可以关闭。
            </p>
            <p className="text-gray-600">
              模态框支持多种尺寸和配置选项。
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setIsBasicOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => setIsBasicOpen(false)}
              className="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-lg hover:shadow-lg transition-all"
            >
              确认
            </button>
          </ModalFooter>
        </Modal>
      </div>

      {/* Form Modal */}
      <div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Form Modal
        </button>

        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="创建新分类"
          size="md"
        >
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类名称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入分类名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="输入分类描述"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                // Handle form submission
                setIsFormOpen(false)
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-lg hover:shadow-lg transition-all"
            >
              创建
            </button>
          </ModalFooter>
        </Modal>
      </div>

      {/* Large Modal */}
      <div>
        <button
          onClick={() => setIsLargeOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Open Large Modal
        </button>

        <Modal
          isOpen={isLargeOpen}
          onClose={() => setIsLargeOpen(false)}
          title="大型模态框"
          size="xl"
        >
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-600">
                这是一个大型模态框，适合显示更多内容。
              </p>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">内容块 {i + 1}</h3>
                  <p className="text-sm text-gray-600">
                    这是一些示例内容。模态框会自动处理滚动。
                  </p>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setIsLargeOpen(false)}
              className="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-lg hover:shadow-lg transition-all"
            >
              关闭
            </button>
          </ModalFooter>
        </Modal>
      </div>

      {/* No Close on Backdrop Click */}
      <div>
        <button
          onClick={() => setIsNoCloseOpen(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Open Modal (No Backdrop Close)
        </button>

        <Modal
          isOpen={isNoCloseOpen}
          onClose={() => setIsNoCloseOpen(false)}
          title="重要操作"
          size="md"
          closeOnBackdropClick={false}
          closeOnEscape={false}
        >
          <ModalBody>
            <p className="text-gray-600">
              这个模态框不能通过点击背景或按 ESC 键关闭。
            </p>
            <p className="text-gray-600">
              必须点击按钮才能关闭，适合重要操作确认。
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setIsNoCloseOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => setIsNoCloseOpen(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              确认删除
            </button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}
