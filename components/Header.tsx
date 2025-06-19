'use client';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {isAdminPage ? '프롬프트 관리 시스템' : '면접 질문지 생성 시스템'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              사내 인사담당자용 도구
            </div>
            <button
              onClick={() => window.location.href = isAdminPage ? '/' : '/admin'}
              className="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700 transition-colors"
            >
              {isAdminPage ? '사용자 페이지' : '관리자 페이지'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 