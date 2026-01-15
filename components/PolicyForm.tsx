import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onSubmit: (data: UserProfile) => void;
  isLoading: boolean;
}

const PolicyForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserProfile>({
    age: '',
    region: '',
    status: '구직',
    goals: '취업',
    primaryGoal: '',
    timeCapacity: '5시간',
    docLevel: '기본'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          맞춤형 정책 찾기
        </h2>
        <p className="mt-2 text-blue-100">
          간단한 정보를 입력하면 대구·경북 최고의 청년 정책을 찾아드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              나이 (만)
            </label>
            <input
              type="number"
              name="age"
              required
              value={formData.age}
              onChange={handleChange}
              placeholder="예: 25"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              거주 지역
            </label>
            <input
              type="text"
              name="region"
              required
              value={formData.region}
              onChange={handleChange}
              placeholder="예: 대구시 수성구"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              현재 상태
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="재학">재학</option>
              <option value="휴학">휴학</option>
              <option value="구직">구직 (취준생)</option>
              <option value="재직">재직 (직장인)</option>
              <option value="창업준비">창업준비</option>
            </select>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              주요 관심 분야
            </label>
            <select
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="취업">취업</option>
              <option value="훈련">직업 훈련/교육</option>
              <option value="창업">창업</option>
              <option value="생활지원">생활지원 (월세/수당)</option>
              <option value="학업">학업 (장학금)</option>
            </select>
          </div>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            최우선 목표 (구체적으로)
          </label>
          <input
            type="text"
            name="primaryGoal"
            required
            value={formData.primaryGoal}
            onChange={handleChange}
            placeholder="예: 3개월 내 취업, 월세 부담 완화, 창업 자금 마련"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              주당 투입 가능 시간
            </label>
            <input
              type="text"
              name="timeCapacity"
              required
              value={formData.timeCapacity}
              onChange={handleChange}
              placeholder="예: 5시간, 주말만 가능"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Doc Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              제출 가능 서류 수준
            </label>
            <select
              name="docLevel"
              value={formData.docLevel}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="기본">기본 (신분증/등본)</option>
              <option value="중간">중간 (소득증명/재학증명)</option>
              <option value="고급">고급 (사업계획서/포트폴리오)</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
              ${isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.99]'
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                정책 분석 중...
              </>
            ) : (
              <>
                맞춤 정책 조회하기
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;
