'use client';

import { useState, useEffect } from 'react';
import { POSITIONS, EXPERIENCES, COMPANY_TYPES } from '@/types';

interface PromptData {
  basePrompts: {
    noResumeNoJobPosting: string;
    resumeNoJobPosting: string;
    noResumeJobPosting: string;
    resumeJobPosting: string;
  };
  positionPrompts: { [key: string]: string };
  experiencePrompts: { [key: string]: string };
  companyTypePrompts: { [key: string]: string };
  outputFormats: {
    noResumeNoJobPosting: string;
    resumeNoJobPosting: string;
    noResumeJobPosting: string;
    resumeJobPosting: string;
  };
}

export default function PromptEditor() {
  const [prompts, setPrompts] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'base' | 'position' | 'experience' | 'company' | 'output'>('base');

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      } else {
        throw new Error('프롬프트를 불러올 수 없습니다.');
      }
    } catch (error) {
      setMessage('프롬프트 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const savePrompts = async () => {
    if (!prompts) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'admin123', // 테스트용 고정 비밀번호
          ...prompts
        }),
      });

      if (response.ok) {
        setMessage('프롬프트가 성공적으로 저장되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '저장에 실패했습니다.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updatePrompt = (type: string, key: string, value: string) => {
    if (!prompts) return;

    setPrompts(prev => {
      if (!prev) return prev;
      
      if (type === 'base') {
        return {
          ...prev,
          basePrompts: {
            ...prev.basePrompts,
            [key]: value
          }
        };
      } else if (type === 'output') {
        return {
          ...prev,
          outputFormats: {
            ...prev.outputFormats,
            [key]: value
          }
        };
      } else {
        const promptType = `${type}Prompts` as keyof PromptData;
        const currentPrompts = prev[promptType] as { [key: string]: string };
        return {
          ...prev,
          [promptType]: {
            ...currentPrompts,
            [key]: value
          }
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">프롬프트 로딩 중...</div>
      </div>
    );
  }

  if (!prompts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">프롬프트를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 저장 버튼 영역 */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-end">
          <button
            onClick={savePrompts}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className={`p-3 rounded-md ${message.includes('성공') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'base', label: '기본 프롬프트' },
              { key: 'position', label: '직무별 프롬프트' },
              { key: 'experience', label: '경력별 프롬프트' },
              { key: 'company', label: '기업형태별 프롬프트' },
              { key: 'output', label: '출력 형식' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'base' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">기본 시스템 프롬프트</h2>
            
            <div>
              <h3 className="text-md font-medium mb-2">이력서 미업로드 + 채용공고 미업로드</h3>
              <textarea
                value={prompts.basePrompts.noResumeNoJobPosting}
                onChange={(e) => updatePrompt('base', 'noResumeNoJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="이력서와 채용공고가 모두 없을 때 사용되는 기본 프롬프트를 입력하세요..."
              />
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">이력서 업로드 + 채용공고 미업로드</h3>
              <textarea
                value={prompts.basePrompts.resumeNoJobPosting}
                onChange={(e) => updatePrompt('base', 'resumeNoJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="이력서만 있을 때 사용되는 기본 프롬프트를 입력하세요..."
              />
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">이력서 미업로드 + 채용공고 업로드</h3>
              <textarea
                value={prompts.basePrompts.noResumeJobPosting}
                onChange={(e) => updatePrompt('base', 'noResumeJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="채용공고만 있을 때 사용되는 기본 프롬프트를 입력하세요..."
              />
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">이력서 업로드 + 채용공고 업로드</h3>
              <textarea
                value={prompts.basePrompts.resumeJobPosting}
                onChange={(e) => updatePrompt('base', 'resumeJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="이력서와 채용공고가 모두 있을 때 사용되는 기본 프롬프트를 입력하세요..."
              />
            </div>
          </div>
        )}

        {activeTab === 'position' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">직무별 프롬프트</h2>
            {POSITIONS.map(position => (
              <div key={position}>
                <label className="block font-medium mb-2">{position}</label>
                <textarea
                  value={prompts.positionPrompts[position] || ''}
                  onChange={(e) => updatePrompt('position', position, e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder={`${position} 프롬프트를 입력하세요...`}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">경력별 프롬프트</h2>
            {EXPERIENCES.map(experience => (
              <div key={experience}>
                <label className="block font-medium mb-2">{experience}</label>
                <textarea
                  value={prompts.experiencePrompts[experience] || ''}
                  onChange={(e) => updatePrompt('experience', experience, e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder={`${experience} 프롬프트를 입력하세요...`}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">기업형태별 프롬프트</h2>
            {COMPANY_TYPES.map(type => (
              <div key={type}>
                <label className="block font-medium mb-2">{type}</label>
                <textarea
                  value={prompts.companyTypePrompts[type] || ''}
                  onChange={(e) => updatePrompt('company', type, e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder={`${type} 프롬프트를 입력하세요...`}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">출력 형식</h2>
            
            <div>
              <h3 className="text-md font-medium mb-2">이력서 미업로드 + 채용공고 미업로드</h3>
              <textarea
                value={prompts.outputFormats.noResumeNoJobPosting}
                onChange={(e) => updatePrompt('output', 'noResumeNoJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="이력서와 채용공고가 모두 없을 때의 출력 형식을 입력하세요..."
              />
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">이력서 업로드 + 채용공고 미업로드</h3>
              <textarea
                value={prompts.outputFormats.resumeNoJobPosting}
                onChange={(e) => updatePrompt('output', 'resumeNoJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="이력서만 있을 때의 출력 형식을 입력하세요..."
              />
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">이력서 미업로드 + 채용공고 업로드</h3>
              <textarea
                value={prompts.outputFormats.noResumeJobPosting}
                onChange={(e) => updatePrompt('output', 'noResumeJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="채용공고만 있을 때의 출력 형식을 입력하세요..."
              />
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">이력서 업로드 + 채용공고 업로드</h3>
              <textarea
                value={prompts.outputFormats.resumeJobPosting}
                onChange={(e) => updatePrompt('output', 'resumeJobPosting', e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="이력서와 채용공고가 모두 있을 때의 출력 형식을 입력하세요..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 