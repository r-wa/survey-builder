import { Survey, MockAPIResponse, SurveyResponse, Answer } from '../types';
import { mockSurveys } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store survey responses
const mockSurveyResponses: SurveyResponse[] = [];

export const api = {
  async getSurveys(): Promise<MockAPIResponse<Survey[]>> {
    await delay(800); // Simulate network delay
    return {
      data: mockSurveys,
      status: 200,
      message: 'Success'
    };
  },

  async getSurveyById(id: string): Promise<MockAPIResponse<Survey>> {
    await delay(600);
    const survey = mockSurveys.find(s => s.id === id);
    if (!survey) {
      throw new Error('Survey not found');
    }
    return {
      data: survey,
      status: 200,
      message: 'Success'
    };
  },

  async createSurvey(survey: Omit<Survey, 'id' | 'createdAt'>): Promise<MockAPIResponse<Survey>> {
    await delay(1000);
    const newSurvey: Survey = {
      ...survey,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    mockSurveys.push(newSurvey);
    return {
      data: newSurvey,
      status: 201,
      message: 'Survey created successfully'
    };
  },

  async deleteSurvey(id: string): Promise<MockAPIResponse<void>> {
    await delay(800);
    const index = mockSurveys.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Survey not found');
    }
    
    mockSurveys.splice(index, 1);
    
    return {
      data: undefined,
      status: 200,
      message: 'Survey deleted successfully'
    };
  },

  async submitSurveyResponse(surveyId: string, answers: Answer[]): Promise<MockAPIResponse<SurveyResponse>> {
    await delay(1000);
    
    // Check if survey exists
    const survey = mockSurveys.find(s => s.id === surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    // Create new response
    const newResponse: SurveyResponse = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId,
      answers,
      submittedAt: new Date().toISOString()
    };
    
    mockSurveyResponses.push(newResponse);
    
    return {
      data: newResponse,
      status: 201,
      message: 'Survey response submitted successfully'
    };
  },

  async getSurveyResponses(surveyId: string): Promise<MockAPIResponse<SurveyResponse[]>> {
    await delay(800);
    
    const responses = mockSurveyResponses.filter(r => r.surveyId === surveyId);
    
    return {
      data: responses,
      status: 200,
      message: 'Success'
    };
  }
};