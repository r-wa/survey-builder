export interface Question {
  id: string;
  type: 'text' | 'multiChoice' | 'checkbox' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  status: 'draft' | 'published';
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
}

export interface MockAPIResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface SurveyFormData {
  title: string;
  description: string;
  questions: Question[];
}