import { Survey } from '../types';

export const mockSurveys: Survey[] = [
  {
    id: '1',
    title: 'Frontend Development Skills',
    description: 'Assessment for frontend development knowledge',
    questions: [
      {
        id: 'q1',
        type: 'multiChoice',
        question: 'What is your preferred testing framework?',
        options: ['Jest', 'Cypress', 'Playwright', 'TestCafe'],
        required: true,
        sectionId: 'sec1'
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe your approach to test automation',
        required: true,
        sectionId: 'sec1'
      },
      {
        id: 'q3',
        type: 'rating',
        question: 'Rate your experience with API testing',
        required: true,
        sectionId: 'sec2'
      }
    ],
    sections: [
      {
        id: 'sec1',
        title: 'Testing Frameworks',
        description: 'Questions about your experience with testing frameworks',
        order: 0
      },
      {
        id: 'sec2',
        title: 'API Testing',
        description: 'Your experience with API testing tools',
        order: 1
      }
    ],
    pages: [
      {
        id: 'page1',
        title: 'Testing Basics',
        order: 0,
        questionIds: ['q1', 'q2']
      },
      {
        id: 'page2',
        title: 'Advanced Testing',
        order: 1,
        questionIds: ['q3']
      }
    ],
    createdAt: new Date().toISOString(),
    status: 'published',
    shareableLink: 'http://localhost:5173/s/abc123',
    completionCount: 5
  },
  {
    id: '2',
    title: 'Backend Testing Assessment',
    description: 'Comprehensive evaluation of backend testing capabilities',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Explain your experience with database testing',
        required: true,
        sectionId: 'sec1'
      },
      {
        id: 'q2',
        type: 'multiChoice',
        question: 'Which API testing tool do you have the most experience with?',
        options: ['Postman', 'Insomnia', 'SoapUI', 'JMeter'],
        required: true,
        sectionId: 'sec1'
      }
    ],
    sections: [
      {
        id: 'sec1',
        title: 'Database Testing',
        description: 'Questions about database testing experience',
        order: 0
      }
    ],
    pages: [
      {
        id: 'page1',
        title: 'Backend Basics',
        order: 0,
        questionIds: ['q1', 'q2']
      }
    ],
    createdAt: new Date().toISOString(),
    status: 'published',
    completionCount: 2
  },
  {
    id: '3',
    title: 'Performance Testing Skills',
    description: 'Assessment focused on performance testing knowledge',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Describe your experience with load testing tools',
        required: true,
        sectionId: 'sec1'
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'Rate your proficiency in performance testing',
        required: true,
        sectionId: 'sec1'
      }
    ],
    sections: [
      {
        id: 'sec1',
        title: 'Load Testing',
        description: 'Questions about load testing experience',
        order: 0
      }
    ],
    pages: [
      {
        id: 'page1',
        title: 'Performance Testing',
        order: 0,
        questionIds: ['q1', 'q2']
      }
    ],
    createdAt: new Date().toISOString(),
    status: 'draft',
    completionCount: 0
  }
];