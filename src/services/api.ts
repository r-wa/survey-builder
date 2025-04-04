import { Survey, MockAPIResponse, SurveyResponse, Answer, SurveyStatistics } from '../types';
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
      createdAt: new Date().toISOString(),
      completionCount: 0,
      shareableLink: `${window.location.origin}/s/${Math.random().toString(36).substr(2, 8)}`
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

  async submitSurveyResponse(surveyId: string, answers: Answer[], completionTime?: number): Promise<MockAPIResponse<SurveyResponse>> {
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
      submittedAt: new Date().toISOString(),
      completionTime: completionTime || 0,
      userAgent: navigator.userAgent
    };
    
    mockSurveyResponses.push(newResponse);
    
    // Update completion count
    const surveyIndex = mockSurveys.findIndex(s => s.id === surveyId);
    if (surveyIndex !== -1) {
      mockSurveys[surveyIndex].completionCount = (mockSurveys[surveyIndex].completionCount || 0) + 1;
    }
    
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
  },

  async getSurveyStatistics(surveyId: string): Promise<MockAPIResponse<SurveyStatistics>> {
    await delay(1200);
    
    const survey = mockSurveys.find(s => s.id === surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    const responses = mockSurveyResponses.filter(r => r.surveyId === surveyId);
    
    // Calculate statistics
    const totalResponses = responses.length;
    
    // Average completion time
    const completionTimes = responses.map(r => r.completionTime || 0).filter(t => t > 0);
    const averageCompletionTime = completionTimes.length 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;
    
    // For simplicity, assume 100% completion rate in mock
    const completionRate = 100;
    
    // Question statistics
    const questionStats: SurveyStatistics['questionStats'] = {};
    
    survey.questions.forEach(question => {
      const questionAnswers = responses
        .map(r => r.answers.find(a => a.questionId === question.id))
        .filter(Boolean) as Answer[];
      
      const stats: SurveyStatistics['questionStats'][string] = {
        responseCount: questionAnswers.length
      };
      
      if (question.type === 'text') {
        stats.textResponses = questionAnswers
          .map(a => a.value as string)
          .filter(v => v.trim() !== '');
      } 
      else if (question.type === 'multiChoice' || question.type === 'checkbox') {
        stats.optionCounts = {};
        
        questionAnswers.forEach(answer => {
          const values = Array.isArray(answer.value) ? answer.value : [answer.value as string];
          values.forEach(value => {
            stats.optionCounts![value] = (stats.optionCounts![value] || 0) + 1;
          });
        });
      }
      else if (question.type === 'rating') {
        const ratings = questionAnswers.map(a => a.value as number).filter(r => r > 0);
        stats.averageRating = ratings.length 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;
      }
      
      questionStats[question.id] = stats;
    });
    
    return {
      data: {
        totalResponses,
        averageCompletionTime,
        completionRate,
        questionStats
      },
      status: 200,
      message: 'Success'
    };
  },

  async generateShareableLink(surveyId: string): Promise<MockAPIResponse<string>> {
    await delay(600);
    
    const survey = mockSurveys.find(s => s.id === surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    // Generate shareable link if it doesn't exist
    if (!survey.shareableLink) {
      survey.shareableLink = `${window.location.origin}/s/${Math.random().toString(36).substr(2, 8)}`;
    }
    
    return {
      data: survey.shareableLink,
      status: 200,
      message: 'Shareable link generated successfully'
    };
  }
};