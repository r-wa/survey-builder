export interface Question {
  id: string;
  type: 'text' | 'multiChoice' | 'checkbox' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
  sectionId?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface Page {
  id: string;
  title?: string;
  order: number;
  questionIds: string[];
  sectionId: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  sections: Section[];
  pages: Page[];
  createdAt: string;
  status: 'draft' | 'published';
  shareableLink?: string;
  completionCount: number;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
  sectionId?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
  completionTime?: number;
  userAgent?: string;
}

export interface SurveyStatistics {
  totalResponses: number;
  averageCompletionTime: number;
  completionRate: number;
  questionStats: {
    [questionId: string]: {
      responseCount: number;
      textResponses?: string[];
      optionCounts?: {
        [option: string]: number;
      };
      averageRating?: number;
    }
  };
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
  sections: Section[];
  pages: Page[];
}