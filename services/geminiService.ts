import {
  GoogleGenAI,
  FunctionDeclaration,
  Type,
  GenerateContentResponse,
  FunctionCall,
  FunctionResponse
} from "@google/genai";
import { UserProfile } from '../types';
import { MOCK_POLICIES } from '../data/policies';

// 1. Initialize Gemini
// Note: In a real app, do not expose API Key in client code.
// For this demo structure, we assume process.env.API_KEY is available or injected.
// Since the prompt instructs to use process.env.API_KEY directly.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 2. Define System Instruction (Prompt Engineering)
const SYSTEM_INSTRUCTION = `
아래는 모델의 역할/규칙/출력 강제/환각 방지/랭킹 기준을 포함합니다.

당신은 “청년 정책·지원금·진로/창업 길잡이 Agent”다. 목표는 사용자의 입력(전국 사용자)을 바탕으로, 제공된 정책 데이터(대구·경북 샘플 정책 15개 및 정책 API 응답)에 한해, 사용자가 실행 가능한 정책을 상위 5개로 추천하고 실행 계획까지 제공하는 것이다.

[핵심 원칙]
1) 근거 제한: 정책 추천과 모든 사실(조건, 혜택, 절차, 마감/주의)은 반드시 정책 API 응답에 포함된 필드/내용을 근거로 작성한다. API에 없는 사실을 만들어내지 말 것(환각 금지).
2) 질문 최소화: 필수 질문만 받는다. 추가 질문은 “정확도에 필수”일 때만 1~2개까지 한다.
3) 전국 입력 처리: 사용자는 전국 어디든 될 수 있으나, 추천은 ‘대구·경북 정책 샘플 데이터’에서만 뽑는다. 따라서 결과에는 “데이터 범위 한계(대구·경북 샘플 기반)”를 명확히 고지하고, 사용자의 지역이 대구·경북이 아닐 경우 ‘적용 가능성 낮음’ 경고를 포함한다.
4) 결과 포맷 준수: 반드시 지정된 출력 섹션과 표/항목 구조를 유지한다.
5) 안전/정확성 고지: 각 정책마다 ‘출처 링크(가능 시)’와 ‘최종 공고 확인 필요’ 고지문을 포함한다.

[정책 API 사용 규칙]
- 정책 목록/상세는 정책 API를 통해 조회한다.
- API에서 받은 정책 객체(정책명, 대상, 요건, 혜택, 절차, 소요시간, 난이도, 주의사항, 링크 등)만을 사용한다.
- 필드가 누락되면 “API 응답에 정보 없음”으로 표시하고 추정하지 않는다.

[랭킹(상위 5개 선정) 기준: 설명가능해야 함]
정책마다 0~100점으로 점수화하고, 각 정책에 ‘추천 이유(근거)’를 2~3개 제시한다.
- 1순위 적합성(0~45): 나이/상태/목표/지역(대구·경북 해당 여부)/대상 조건 충족
- 2순위 기대효과(0~25): 혜택 규모·직접성·목표와의 연결
- 3순위 실행가능성(0~20): 사용자의 시간여력/서류 수준 대비 절차 난이도·소요시간
- 4순위 리스크(0~10 감점): 마감 임박, 경쟁/선착순, 요건 불확실/예외 많음

[출력 형식(반드시 이 구조 유지)]
A. 사용자 요약(표)
B. 추천 TOP5 목록(표: 순위/정책명/적합도(High·Med·Low)/점수/한줄 근거)
C. 정책별 상세(1~5번 각각 아래 항목)
   1) 정책 이름
   2) 추천 이유(근거 2~3개, API 기반)
   3) 예상 혜택(정량/정성, API 기반)
   4) 실행 단계(3~6단계)
   5) 소요시간(예상, API 기반 / 없으면 “정보 없음”)
   6) 난이도(쉬움/보통/어려움 + 근거 1줄)
   7) 주의사항/리스크(2~4개)
   8) 출처/링크(가능 시)
D. 다음 행동 7일 플랜(사용자 기준 To-do 5개)
E. 고지문(데이터 범위: 대구·경북 샘플 기반, 최신 공고 확인 필요)

[톤]
- 전문가 톤, 간결하지만 실행 중심. 과장 금지.
`;

// 3. Define Tools (Function Declarations)
const fetchPoliciesDeclaration: FunctionDeclaration = {
  name: 'fetchPolicyList',
  description: 'Fetches the list of 15 sample policies for Daegu and Gyeongbuk regions.',
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No params needed for fetching the static list in this demo
  },
};

// 4. Helper to construct User Prompt
export const constructUserPrompt = (data: UserProfile): string => {
  return `
다음 사용자 입력을 기반으로 정책 API를 조회하고, 대구·경북 샘플 정책(총 15개) 중에서 상위 5개를 추천해줘.

[사용자 입력]
- 나이(만): ${data.age}
- 거주 지역(시/도 + 시/군/구): ${data.region}
- 현재 상태(재학/휴학/구직/재직/창업준비): ${data.status}
- 관심 목표(취업/훈련/창업/생활지원/학업): ${data.goals}
- 최우선 목표 1개: ${data.primaryGoal}
- 시간 여력(주당): ${data.timeCapacity}
- 서류 수준(기본/중간/고급): ${data.docLevel}

[정책 데이터 조회 지시]
1) 정책 API에서 “대구·경북 샘플 정책 15개”를 불러와라(목록 조회).
2) 목록만으로 정보가 부족하면, TOP 후보들에 대해 상세 조회를 수행하라.
3) API 응답에 있는 정보만 사용하여 추천하라. 없는 내용은 추정하지 말고 ‘정보 없음’으로 표시하라.
4) 사용자의 거주지가 대구·경북이 아니라면, 추천은 하되 “적용 가능성 낮음(지역 제한)”을 명확히 표기하라.

[출력]
System Instruction에 정의된 A~E 출력 구조를 반드시 지켜서 결과를 작성하라.
`;
};

// 5. Main Service Function
export const generatePolicyRecommendations = async (userProfile: UserProfile): Promise<string> => {
  const ai = getClient();
  
  // Using gemini-3-flash-preview as recommended for text tasks, or gemini-2.5-flash
  // Since we need reasoning for ranking, flash is capable enough with the system instruction.
  const modelId = 'gemini-3-flash-preview';

  const userPrompt = constructUserPrompt(userProfile);

  // Initial request with tools
  const response = await ai.models.generateContent({
    model: modelId,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [fetchPoliciesDeclaration] }],
    },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
  });

  // Handle Function Calls
  // The model should decide to call `fetchPolicyList`.
  const functionCalls = response.functionCalls;
  
  if (functionCalls && functionCalls.length > 0) {
    const functionResponses: FunctionResponse[] = [];

    for (const call of functionCalls) {
      if (call.name === 'fetchPolicyList') {
        // Execute local mock function
        const result = { policies: MOCK_POLICIES };
        functionResponses.push({
          id: call.id,
          name: call.name,
          response: { result: result }, // Must match format expected by API
        });
      }
    }

    // Send the tool response back to the model
    if (functionResponses.length > 0) {
      const finalResponse = await ai.models.generateContent({
        model: modelId,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: [fetchPoliciesDeclaration] }],
        },
        contents: [
            { role: 'user', parts: [{ text: userPrompt }] },
            { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
            { role: 'tool', parts: [{ functionResponse: { name: 'fetchPolicyList', response: { result: { policies: MOCK_POLICIES } } } }] }
            // Note: The SDK's strict types sometimes require careful construction of tool responses.
            // Using the `functionResponses` map directly in a new turn usually works best in chat, 
            // but here we are in single-turn + tool loop.
            // Let's rely on the SDK's chat-like history construction or simply passing the tool response.
        ]
      });

      // Simple handling for this specific single-turn tool use case:
      // We reconstruct the history manually for the second turn.
      // Actually, let's use the `chat` abstraction which handles history easier, 
      // but the prompt implies a single "agent" task.
      
      // Let's do the manual history construction for the second call.
      const secondTurnResponse = await ai.models.generateContent({
        model: modelId,
        config: { systemInstruction: SYSTEM_INSTRUCTION }, // Tools not strictly needed in 2nd turn if we provide data, but good to keep context
        contents: [
           { role: 'user', parts: [{ text: userPrompt }] },
           { role: 'model', parts: response.candidates![0].content.parts },
           { role: 'user', parts: [{ 
               functionResponse: {
                   name: 'fetchPolicyList',
                   response: { result: MOCK_POLICIES } 
               }
           }]}
        ]
      });
      
      return secondTurnResponse.text || "No response generated.";
    }
  }

  return response.text || "No response generated (and no tool called).";
};
