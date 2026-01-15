import React, { useState } from 'react';
import PolicyForm from './components/PolicyForm';
import ResultDisplay from './components/ResultDisplay';
import { generatePolicyRecommendations } from './services/geminiService';
import { UserProfile, AppState } from './types';
import { Sparkles, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.FORM);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFormSubmit = async (data: UserProfile) => {
    setAppState(AppState.LOADING);
    setErrorMsg('');
    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing in the environment.");
      }
      const response = await generatePolicyRecommendations(data);
      setResult(response);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setErrorMsg("정책을 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.FORM);
    setResult('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              청년 정책 길잡이 <span className="text-blue-600 font-extrabold">Agent</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center text-sm text-slate-500 gap-1 bg-slate-100 px-3 py-1 rounded-full">
            <MapPin className="w-3 h-3" />
            <span>대구·경북 특화</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {appState === AppState.FORM && (
          <div className="animate-fade-in">
             <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                  나에게 딱 맞는 <br className="hidden md:block" />
                  <span className="text-blue-600">청년 정책</span>을 찾아보세요
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  복잡한 정책 공고, 일일이 찾아볼 필요 없습니다.<br/>
                  AI가 대구·경북 지역의 핵심 정책을 분석하여 맞춤형 로드맵을 제공합니다.
                </p>
             </div>
             <PolicyForm onSubmit={handleFormSubmit} isLoading={false} />
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800">최적의 정책을 분석하고 있습니다...</h3>
            <p className="text-slate-500 mt-2">조건 충족 여부 확인 중 | 리스크 평가 중 | 로드맵 생성 중</p>
          </div>
        )}

        {appState === AppState.RESULT && (
          <ResultDisplay markdown={result} onReset={resetApp} />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <h3 className="text-red-700 font-bold text-lg mb-2">오류 발생</h3>
            <p className="text-red-600 mb-6">{errorMsg || "알 수 없는 오류가 발생했습니다."}</p>
            <button 
              onClick={resetApp}
              className="px-6 py-2 bg-white border border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
