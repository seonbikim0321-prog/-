import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  markdown: string;
  onReset: () => void;
}

const ResultDisplay: React.FC<Props> = ({ markdown, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          다시 검색하기
        </button>
        <button
          onClick={onReset} 
           className="flex items-center gap-2 text-slate-500 text-sm hover:text-blue-500"
        >
          <RefreshCw className="w-3 h-3" />
          조건 변경
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-blue-700 prose-h3:text-slate-800 prose-a:text-blue-600">
           {/* 
             Custom Markdown Rendering
             We use remark-gfm to support tables which are critical for Section A and B 
           */}
           <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({node, ...props}) => (
                <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm text-left text-slate-600" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => (
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200" {...props} />
              ),
              th: ({node, ...props}) => (
                <th className="px-6 py-3 font-bold" {...props} />
              ),
              td: ({node, ...props}) => (
                <td className="px-6 py-4 border-b border-slate-100 last:border-0" {...props} />
              ),
              a: ({node, ...props}) => (
                <a className="text-blue-600 hover:underline font-medium break-all" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              h1: ({node, ...props}) => <h1 className="text-3xl border-b pb-4 mb-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl mt-10 mb-4 text-blue-800 border-l-4 border-blue-600 pl-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl mt-8 mb-3 font-semibold text-slate-800" {...props} />,
            }}
           >
             {markdown}
           </ReactMarkdown>
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-500 text-sm pb-10">
        <p>본 결과는 AI 모델(Gemini)이 생성한 참고용 자료입니다. 반드시 최종 공고를 해당 기관 홈페이지에서 확인하세요.</p>
      </div>
    </div>
  );
};

export default ResultDisplay;
