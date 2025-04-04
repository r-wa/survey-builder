import React from 'react';
import { Survey, Answer, Question } from '../types';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SurveyReviewProps {
  survey: Survey;
  answers: Answer[];
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function SurveyReview({ survey, answers, onBack, onSubmit, submitting }: SurveyReviewProps) {
  // Group questions by section if sections exist
  const getQuestionsBySection = () => {
    if (!survey.sections || survey.sections.length === 0) {
      return {
        default: survey.questions
      };
    }

    const sectionMap: Record<string, Question[]> = {};
    
    // Initialize sections
    survey.sections.forEach(section => {
      sectionMap[section.id] = [];
    });
    
    // Group questions by section
    survey.questions.forEach(question => {
      const sectionId = question.sectionId || 'unsectioned';
      if (!sectionMap[sectionId]) {
        sectionMap[sectionId] = [];
      }
      sectionMap[sectionId].push(question);
    });
    
    return sectionMap;
  };

  const getSectionTitle = (sectionId: string): string => {
    if (sectionId === 'unsectioned' || sectionId === 'default') {
      return 'General Questions';
    }
    
    const section = survey.sections?.find(s => s.id === sectionId);
    return section ? section.title : 'Unknown Section';
  };

  const formatAnswerValue = (question: Question, value: string | string[] | number): string => {
    if (question.type === 'text') {
      return value as string;
    } else if (question.type === 'multiChoice') {
      return value as string;
    } else if (question.type === 'checkbox') {
      return (value as string[]).join(', ');
    } else if (question.type === 'rating') {
      return `${value} out of 5`;
    }
    return String(value);
  };

  const questionsBySection = getQuestionsBySection();
  const sectionIds = Object.keys(questionsBySection);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Your Answers</h1>
        <p className="mt-2 text-gray-600">
          Please review your responses before submitting. You can go back to make changes if needed.
        </p>
      </div>

      <div className="space-y-8">
        {sectionIds.map(sectionId => (
          <div key={sectionId} className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
              <h2 className="text-lg font-medium text-indigo-800">
                {getSectionTitle(sectionId)}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {questionsBySection[sectionId].map((question, index) => {
                const answer = answers.find(a => a.questionId === question.id);
                const answerValue = answer ? answer.value : '';
                
                return (
                  <div key={question.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-md font-medium text-gray-900 mb-1">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        
                        <div className={cn(
                          "mt-2 p-3 rounded-md",
                          answerValue ? "bg-gray-50" : "bg-red-50"
                        )}>
                          {answerValue ? (
                            <p className="text-gray-700">
                              {formatAnswerValue(question, answerValue)}
                            </p>
                          ) : (
                            <p className="text-red-500 italic">No answer provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pb-10 flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Survey
        </Button>
        
        <Button 
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center"
        >
          {submitting ? (
            <>Submitting...</>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit Answers
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 