import { Survey, SurveyResponse } from '../types';

const STORAGE_KEYS = {
  SURVEYS: 'survey-builder-surveys',
  RESPONSES: 'survey-builder-responses',
};

/**
 * LocalStorage service for storing survey data
 */
export const storageService = {
  /**
   * Get all surveys from local storage
   */
  getSurveys: (): Survey[] => {
    try {
      const surveys = localStorage.getItem(STORAGE_KEYS.SURVEYS);
      return surveys ? JSON.parse(surveys) : [];
    } catch (error) {
      console.error('Error retrieving surveys from localStorage:', error);
      return [];
    }
  },

  /**
   * Save a survey to local storage
   */
  saveSurvey: (survey: Survey): void => {
    try {
      const surveys = storageService.getSurveys();
      const existingIndex = surveys.findIndex(s => s.id === survey.id);
      
      if (existingIndex >= 0) {
        surveys[existingIndex] = survey;
      } else {
        surveys.push(survey);
      }
      
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
    } catch (error) {
      console.error('Error saving survey to localStorage:', error);
    }
  },

  /**
   * Delete a survey from local storage
   */
  deleteSurvey: (id: string): void => {
    try {
      const surveys = storageService.getSurveys();
      const filteredSurveys = surveys.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(filteredSurveys));
    } catch (error) {
      console.error('Error deleting survey from localStorage:', error);
    }
  },

  /**
   * Get a specific survey by ID
   */
  getSurveyById: (id: string): Survey | null => {
    try {
      const surveys = storageService.getSurveys();
      return surveys.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Error retrieving survey from localStorage:', error);
      return null;
    }
  },

  /**
   * Save a survey response to local storage
   */
  saveSurveyResponse: (response: SurveyResponse): void => {
    try {
      const responses = storageService.getSurveyResponses();
      const existingIndex = responses.findIndex(r => r.id === response.id);
      
      if (existingIndex >= 0) {
        responses[existingIndex] = response;
      } else {
        responses.push(response);
      }
      
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));

      // Update the survey completion count
      const survey = storageService.getSurveyById(response.surveyId);
      if (survey) {
        survey.completionCount += 1;
        storageService.saveSurvey(survey);
      }
    } catch (error) {
      console.error('Error saving survey response to localStorage:', error);
    }
  },

  /**
   * Get all responses for a specific survey
   */
  getSurveyResponses: (surveyId?: string): SurveyResponse[] => {
    try {
      const responses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
      const allResponses = responses ? JSON.parse(responses) : [];
      
      if (surveyId) {
        return allResponses.filter((r: SurveyResponse) => r.surveyId === surveyId);
      }
      
      return allResponses;
    } catch (error) {
      console.error('Error retrieving survey responses from localStorage:', error);
      return [];
    }
  },

  /**
   * Generate a shareable link for a survey
   */
  generateShareableLink: (surveyId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/survey/${surveyId}/take`;
  },

  /**
   * Clear all data (for testing purposes)
   */
  clearAllData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SURVEYS);
    localStorage.removeItem(STORAGE_KEYS.RESPONSES);
  },

  /**
   * Initialize with mock data if storage is empty
   */
  initMockData: (): void => {
    const surveys = storageService.getSurveys();
    
    if (surveys.length === 0) {
      const mockSurveys: Survey[] = [
        {
          id: 'mock-survey-1',
          title: 'QA Automation Assessment',
          description: 'Evaluate technical skills and automation knowledge',
          createdAt: new Date().toISOString(),
          status: 'published',
          shareableLink: '',
          completionCount: 0,
          questions: [
            {
              id: 'q1',
              type: 'text',
              question: 'Describe your experience with Selenium or similar tools',
              required: true,
              sectionId: 's1'
            },
            {
              id: 'q2',
              type: 'multiChoice',
              question: 'Which of these testing frameworks have you used?',
              options: ['Jest', 'Mocha', 'Cypress', 'TestNG'],
              required: true,
              sectionId: 's1'
            }
          ],
          sections: [
            {
              id: 's1',
              title: 'Automation Experience',
              description: 'Questions about your testing automation background',
              order: 0
            }
          ],
          pages: [
            {
              id: 'p1',
              title: 'Automation Skills',
              order: 0,
              questionIds: ['q1', 'q2']
            }
          ]
        },
        {
          id: 'mock-survey-2',
          title: 'Manual Testing Knowledge',
          description: 'Assessment of manual testing techniques and methodologies',
          createdAt: new Date().toISOString(),
          status: 'published',
          shareableLink: '',
          completionCount: 0,
          questions: [
            {
              id: 'q1',
              type: 'text',
              question: 'Explain the difference between black box and white box testing',
              required: true,
              sectionId: 's1'
            },
            {
              id: 'q2',
              type: 'checkbox',
              question: 'Which test case design techniques have you used?',
              options: ['Boundary Value Analysis', 'Equivalence Partitioning', 'Decision Tables', 'State Transition Testing'],
              required: true,
              sectionId: 's1'
            }
          ],
          sections: [
            {
              id: 's1',
              title: 'Testing Fundamentals',
              description: 'Core concepts of software testing',
              order: 0
            }
          ],
          pages: [
            {
              id: 'p1',
              title: 'Testing Concepts',
              order: 0,
              questionIds: ['q1', 'q2']
            }
          ]
        }
      ];
      
      // Set the shareable links
      mockSurveys.forEach(survey => {
        survey.shareableLink = storageService.generateShareableLink(survey.id);
        storageService.saveSurvey(survey);
      });
    }
  }
}; 