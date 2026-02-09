#!/bin/bash

# 备份原文件
cp components/FeedbackModal.tsx components/FeedbackModal.tsx.backup

# 在第516行后添加分页控件
sed -i '' '516a\
\
            {/* Pagination */}\
            {totalCount > pageSize && (\
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/10">\
                <div className="text-sm text-gray-600 dark:text-gray-400">\
                  共 {totalCount} 条，第 {currentPage} / {Math.ceil(totalCount / pageSize)} 页\
                </div>\
                <div className="flex items-center gap-2">\
                  <button\
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}\
                    disabled={currentPage === 1}\
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"\
                  >\
                    上一页\
                  </button>\
                  <button\
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}\
                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}\
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"\
                  >\
                    下一页\
                  </button>\
                </div>\
              </div>\
            )}
' components/FeedbackModal.tsx

echo "修复完成！"
