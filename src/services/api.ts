import { Survey, MockAPIResponse } from '../types';
import { mockSurveys } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  }
};