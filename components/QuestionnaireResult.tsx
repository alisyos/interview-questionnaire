'use client';

import { QuestionnaireOutput, Question, IndividualQuestion } from '@/types';

interface QuestionnaireResultProps {
  data: QuestionnaireOutput;
}

export default function QuestionnaireResult({ data }: QuestionnaireResultProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateTextContent(data);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `면접질문지_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full p-6 bg-white questionnaire-result">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">면접 질문지</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            인쇄
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            다운로드
          </button>
        </div>
      </div>

      {/* 공통 질문 섹션 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2 section-title">
          공통 질문 ({data.commonQuestions?.length || 0}개)
        </h2>
        <div className="space-y-6">
          {data.commonQuestions?.map((question, index) => (
            <QuestionCard key={index} question={question} index={index + 1} />
          ))}
        </div>
      </div>

      {/* 개별 질문 섹션 */}
      {data.individualQuestions && data.individualQuestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 section-title">
            개별 질문 ({data.individualQuestions.length}개)
          </h2>
          <div className="space-y-6">
            {data.individualQuestions.map((question, index) => (
              <IndividualQuestionCard key={index} question={question} index={index + 1} />
            ))}
          </div>
        </div>
      )}
      
      {/* 하단 여백 */}
      <div className="pb-8"></div>
    </div>
  );
}

function QuestionCard({ question, index }: { question: Question; index: number }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg question-card">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">
        Q{index}. {question.question}
      </h3>
      <div className="mt-3">
        <h4 className="font-medium text-gray-700 mb-2">후속 질문:</h4>
        <ul className="space-y-1">
          {question.followUps?.map((followUp, idx) => (
            <li key={idx} className="text-gray-600 ml-4">
              • {followUp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IndividualQuestionCard({ question, index }: { question: IndividualQuestion; index: number }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg question-card">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">
        Q{index}. {question.question}
      </h3>
      <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-sm text-gray-700">
          <strong>이력서 근거:</strong> {question.resumeSource || '-'}
        </p>
      </div>
      <div className="mt-3">
        <h4 className="font-medium text-gray-700 mb-2">후속 질문:</h4>
        <ul className="space-y-1">
          {question.followUps?.map((followUp, idx) => (
            <li key={idx} className="text-gray-600 ml-4">
              • {followUp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function generateTextContent(data: QuestionnaireOutput): string {
  let content = `면접 질문지\n`;
  content += `생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;
  
  content += `=== 공통 질문 (${data.commonQuestions?.length || 0}개) ===\n\n`;
  data.commonQuestions?.forEach((question, index) => {
    content += `Q${index + 1}. ${question.question}\n`;
    content += `후속 질문:\n`;
    question.followUps?.forEach((followUp, idx) => {
      content += `  ${idx + 1}) ${followUp}\n`;
    });
    content += `\n`;
  });

  // 개별 질문이 있을 때만 개별 질문 섹션 추가
  if (data.individualQuestions && data.individualQuestions.length > 0) {
    content += `=== 개별 질문 (${data.individualQuestions.length}개) ===\n\n`;
    data.individualQuestions.forEach((question, index) => {
      content += `Q${index + 1}. ${question.question}\n`;
      content += `이력서 근거: ${question.resumeSource || '-'}\n`;
      content += `후속 질문:\n`;
      question.followUps?.forEach((followUp, idx) => {
        content += `  ${idx + 1}) ${followUp}\n`;
      });
      content += `\n`;
    });
  }

  return content;
} 