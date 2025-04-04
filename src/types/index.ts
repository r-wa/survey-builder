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