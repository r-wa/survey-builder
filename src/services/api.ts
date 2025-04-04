import { Survey, MockAPIResponse, SurveyResponse, Answer, SurveyStatistics } from '../types';
import { storageService } from './localStorage';

// Add some simulated network delay for a more realistic experience
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize mock data in localStorage
storageService.initMockData();

export const api = {
  async getSurveys(): Promise<MockAPIResponse<Survey[]>> {
    await delay(800); // Simulate network delay
    const surveys = storageService.getSurveys();
    return {
      data: surveys,
      status: 200,
      message: 'Success'
    };
  },

  async getSurveyById(id: string): Promise<MockAPIResponse<Survey>> {
    await delay(600);
    const survey = storageService.getSurveyById(id);
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
      id: `survey-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
      completionCount: 0,
      shareableLink: ''
    };
    
    // Generate the shareable link
    newSurvey.shareableLink = storageService.generateShareableLink(newSurvey.id);
    
    // Save to localStorage
    storageService.saveSurvey(newSurvey);
    
    return {
      data: newSurvey,
      status: 201,
      message: 'Survey created successfully'
    };
  },

  async deleteSurvey(id: string): Promise<MockAPIResponse<void>> {
    await delay(800);
    storageService.deleteSurvey(id);
    
    return {
      data: undefined,
      status: 200,
      message: 'Survey deleted successfully'
    };
  },

  async submitSurveyResponse(surveyId: string, answers: Answer[], completionTime?: number): Promise<MockAPIResponse<SurveyResponse>> {
    await delay(1000);
    
    // Check if survey exists
    const survey = storageService.getSurveyById(surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    // Create new response
    const newResponse: SurveyResponse = {
      id: `response-${Math.random().toString(36).substring(2, 11)}`,
      surveyId,
      answers,
      submittedAt: new Date().toISOString(),
      completionTime: completionTime || 0,
      userAgent: navigator.userAgent
    };
    
    // Save response
    storageService.saveSurveyResponse(newResponse);
    
    return {
      data: newResponse,
      status: 201,
      message: 'Survey response submitted successfully'
    };
  },

  async getSurveyResponses(surveyId: string): Promise<MockAPIResponse<SurveyResponse[]>> {
    await delay(800);
    
    const responses = storageService.getSurveyResponses(surveyId);
    
    return {
      data: responses,
      status: 200,
      message: 'Success'
    };
  },

  async getSurveyStatistics(surveyId: string): Promise<MockAPIResponse<SurveyStatistics>> {
    await delay(1200);
    
    const survey = storageService.getSurveyById(surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    const responses = storageService.getSurveyResponses(surveyId);
    
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
    
    const survey = storageService.getSurveyById(surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    // Generate shareable link if it doesn't exist
    if (!survey.shareableLink) {
      survey.shareableLink = storageService.generateShareableLink(surveyId);
      storageService.saveSurvey(survey);
    }
    
    return {
      data: survey.shareableLink,
      status: 200,
      message: 'Shareable link generated successfully'
    };
  }
};