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
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe your approach to test automation',
        required: true
      },
      {
        id: 'q3',
        type: 'rating',
        question: 'Rate your experience with API testing',
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    status: 'published'
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
        required: true
      },
      {
        id: 'q2',
        type: 'multiChoice',
        question: 'Which API testing tool do you have the most experience with?',
        options: ['Postman', 'Insomnia', 'SoapUI', 'JMeter'],
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    status: 'published'
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
        required: true
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'Rate your proficiency in performance testing',
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    status: 'draft'
  }
];