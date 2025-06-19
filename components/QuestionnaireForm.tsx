'use client';

import { useState } from 'react';
import { QuestionnaireInput, QuestionnaireOutput, POSITIONS, EXPERIENCES, COMPANY_TYPES } from '@/types';

interface QuestionnaireFormProps {
  onSubmit: (data: QuestionnaireOutput) => void;
}

export default function QuestionnaireForm({ onSubmit }: QuestionnaireFormProps) {
  const [formData, setFormData] = useState<QuestionnaireInput>({
    position: '',
    experience: '',
    companyType: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof QuestionnaireInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      
      // 파일 형식 검증
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('PDF 또는 이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setResumeFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 필수 필드 검증
      if (!formData.position || !formData.experience || !formData.companyType) {
        throw new Error('직무, 경력, 기업형태는 필수 입력 항목입니다.');
      }

      const submitFormData = new FormData();
      submitFormData.append('position', formData.position);
      submitFormData.append('experience', formData.experience);
      submitFormData.append('companyType', formData.companyType);
      
      if (resumeFile) {
        submitFormData.append('resume', resumeFile);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '질문 생성에 실패했습니다.');
      }

      const result: QuestionnaireOutput = await response.json();
      onSubmit(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        면접 질문지 생성
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 직무 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            직무 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">직무를 선택해주세요</option>
            {POSITIONS.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* 경력 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경력 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">경력을 선택해주세요</option>
            {EXPERIENCES.map(experience => (
              <option key={experience} value={experience}>
                {experience}
              </option>
            ))}
          </select>
        </div>

        {/* 기업형태 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업형태 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.companyType}
            onChange={(e) => handleInputChange('companyType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">기업형태를 선택해주세요</option>
            {COMPANY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 이력서 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이력서 업로드
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            PDF 또는 이미지 파일 (최대 10MB)
          </p>
          {resumeFile && (
            <p className="text-sm text-green-600 mt-1">
              선택된 파일: {resumeFile.name}
            </p>
          )}
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '질문 생성 중...' : '면접 질문 생성'}
        </button>
      </form>
      
      {/* 하단 여백 */}
      <div className="pb-8"></div>
    </div>
  );
} 