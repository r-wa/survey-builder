import React from 'react';
import { SurveyStatistics as SurveyStatsType, Survey, Question } from '../types';
import { cn } from '../lib/utils';

interface SurveyStatisticsProps {
  survey: Survey;
  statistics: SurveyStatsType;
}

export function SurveyStatistics({ survey, statistics }: SurveyStatisticsProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min${minutes !== 1 ? 's' : ''} ${remainingSeconds} sec${remainingSeconds !== 1 ? 's' : ''}`;
  };

  const getQuestionStatistics = (question: Question) => {
    const stats = statistics.questionStats[question.id];
    if (!stats) return null;

    switch (question.type) {
      case 'text':
        return (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Text Responses ({stats.textResponses?.length || 0})
            </h4>
            {stats.textResponses && stats.textResponses.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stats.textResponses.map((response, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                    "{response}"
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No text responses</p>
            )}
          </div>
        );

      case 'multiChoice':
      case 'checkbox': {
        if (!question.options || !stats.optionCounts) return null;

        const totalResponses = Object.values(stats.optionCounts).reduce((sum, count) => sum + count, 0);

        return (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Response Distribution
            </h4>
            <div className="space-y-3">
              {question.options.map(option => {
                const count = stats.optionCounts?.[option] || 0;
                const percentage = totalResponses ? Math.round((count / totalResponses) * 100) : 0;
                
                return (
                  <div key={option} className="flex items-center">
                    <span className="text-sm text-gray-700 w-1/3 truncate" title={option}>
                      {option}
                    </span>
                    <div className="w-2/3 flex items-center">
                      <div className="relative h-4 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 min-w-[60px]">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      
      case 'rating':
        return (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Average Rating
            </h4>
            <div className="flex items-center">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div
                    key={rating}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-md border text-sm",
                      (stats.averageRating || 0) >= rating
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    )}
                  >
                    {rating}
                  </div>
                ))}
              </div>
              <span className="ml-3 text-lg font-medium text-gray-900">
                {stats.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                (from {stats.responseCount} responses)
              </span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
          <h2 className="text-lg font-medium text-indigo-800">
            Survey Overview
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Responses</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.totalResponses}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Average Completion Time</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {formatTime(statistics.averageCompletionTime || 0)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Rate</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
          <h2 className="text-lg font-medium text-indigo-800">
            Question Analysis
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="p-6">
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-900">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {question.type === 'text' ? 'Text input' : 
                      question.type === 'multiChoice' ? 'Multiple choice' : 
                      question.type === 'checkbox' ? 'Checkbox' : 'Rating'}
                  </p>
                  
                  {getQuestionStatistics(question)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 