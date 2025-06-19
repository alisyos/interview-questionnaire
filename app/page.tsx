'use client';

import { useState } from 'react';
import QuestionnaireForm from '@/components/QuestionnaireForm';
import QuestionnaireResult from '@/components/QuestionnaireResult';
import { QuestionnaireOutput } from '@/types';

export default function HomePage() {
  const [result, setResult] = useState<QuestionnaireOutput | null>(null);

  const handleFormSubmit = (data: QuestionnaireOutput) => {
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="h-full grid grid-cols-5">
          {/* 좌측 입력 영역 (2/5) */}
          <div className="col-span-2 bg-white border-r border-gray-200 overflow-y-auto">
            <QuestionnaireForm onSubmit={handleFormSubmit} />
          </div>
        
          {/* 우측 결과 영역 (3/5) */}
          <div className="col-span-3 overflow-y-auto">
            {result ? (
              <QuestionnaireResult data={result} onReset={handleReset} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    면접 질문지가 여기에 표시됩니다
                  </h3>
                  <p className="text-gray-600">
                    좌측에서 정보를 입력하고 '면접 질문 생성' 버튼을 클릭하세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
} 