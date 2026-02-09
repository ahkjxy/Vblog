import React from 'react';
import { Icon } from './Icon';
import { Language, useTranslation } from '../i18n/translations';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  language?: Language;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
  language = 'zh',
}: PaginationProps) {
  const { t, replace } = useTranslation(language);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-4">
      {/* Info Text */}
      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        {t.pagination.showing} <span className="text-[#FF4D94] font-black">{startItem}</span> {t.pagination.to} <span className="text-[#FF4D94] font-black">{endItem}</span> {t.pagination.ofTotal} <span className="text-[#7C4DFF] font-black">{totalItems}</span> {t.pagination.items}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
          aria-label={t.pagination.previous}
        >
          <Icon name="chevron-left" size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-300 dark:text-gray-600 font-black">
                  ···
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg shadow-[#FF4D94]/30 scale-110'
                    : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-[#FF4D94]/30'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
          aria-label={t.pagination.next}
        >
          <Icon name="chevron-right" size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
