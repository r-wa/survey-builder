import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Survey, Answer, Question } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { SurveyReview } from '../components/SurveyReview';

export function TakeSurvey() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.getSurveyById(id);
        const surveyData = response.data;
        
        // If the survey doesn't have pages, create a default page with all questions
        if (!surveyData.pages || surveyData.pages.length === 0) {
          surveyData.pages = [{
            id: 'default-page',
            order: 0,
            questionIds: surveyData.questions.map(q => q.id)
          }];
        }
        
        // Sort pages by order
        surveyData.pages.sort((a, b) => a.order - b.order);
        
        setSurvey(surveyData);
        
        // Initialize answers
        const initialAnswers = surveyData.questions.map(q => ({
          questionId: q.id,
          value: q.type === 'checkbox' ? [] : q.type === 'rating' ? 0 : '',
          sectionId: q.sectionId
        }));
        
        setAnswers(initialAnswers);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Failed to fetch survey:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const updateAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => 
      prev.map(a => a.questionId === questionId ? { ...a, value } : a)
    );
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validatePage = (pageIndex: number): boolean => {
    if (!survey) return false;
    
    const page = survey.pages[pageIndex];
    const newErrors: Record<string, string> = {};
    
    // Find questions on this page
    page.questionIds.forEach(questionId => {
      const question = survey.questions.find(q => q.id === questionId);
      if (!question) return;
      
      const answer = answers.find(a => a.questionId === questionId);
      
      if (question.required) {
        if (!answer || 
            (typeof answer.value === 'string' && answer.value.trim() === '') ||
            (Array.isArray(answer.value) && answer.value.length === 0) ||
            (typeof answer.value === 'number' && answer.value === 0)) {
          newErrors[questionId] = 'This question is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    if (!survey) return false;
    
    const newErrors: Record<string, string> = {};
    
    survey.questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      
      if (question.required) {
        if (!answer || 
            (typeof answer.value === 'string' && answer.value.trim() === '') ||
            (Array.isArray(answer.value) && answer.value.length === 0) ||
            (typeof answer.value === 'number' && answer.value === 0)) {
          newErrors[question.id] = 'This question is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextPage = () => {
    if (!survey) return;
    
    if (validatePage(currentPage)) {
      if (currentPage < survey.pages.length - 1) {
        setCurrentPage(currentPage + 1);
        window.scrollTo(0, 0);
      } else {
        // Last page, move to review
        setIsReviewing(true);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBackFromReview = () => {
    setIsReviewing(false);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !survey || !id) return;
    
    try {
      setSubmitting(true);
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      await api.submitSurveyResponse(id, answers, completionTime);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentPageQuestions = (): Question[] => {
    if (!survey) return [];
    
    const currentPageData = survey.pages[currentPage];
    if (!currentPageData) return [];
    
    return survey.questions.filter(q => 
      currentPageData.questionIds.includes(q.id)
    );
  };

  const getProgress = (): number => {
    if (!survey) return 0;
    return Math.round(((currentPage + 1) / survey.pages.length) * 100);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!survey) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Found</h1>
        <p className="text-gray-600 mb-6">The survey you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/surveys')}>View All Surveys</Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
        <Button onClick={() => navigate('/surveys')}>View More Surveys</Button>
      </div>
    );
  }

  if (isReviewing) {
    return (
      <SurveyReview 
        survey={survey}
        answers={answers}
        onBack={handleBackFromReview}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    );
  }

  const currentQuestions = getCurrentPageQuestions();
  const progress = getProgress();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        <p className="mt-2 text-gray-600">{survey.description}</p>
        
        {survey.pages.length > 1 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-1 text-sm text-gray-500 flex justify-between">
              <span>Page {currentPage + 1} of {survey.pages.length}</span>
              <span>{progress}% completed</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {currentQuestions.map((question, index) => (
          <div key={question.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-3">
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                
                {question.type === 'text' && (
                  <textarea
                    value={answers.find(a => a.questionId === question.id)?.value as string || ''}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your answer..."
                  />
                )}
                
                {question.type === 'multiChoice' && question.options && (
                  <div className="mt-2 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`${question.id}-option-${optionIndex}`}
                          name={question.id}
                          checked={(answers.find(a => a.questionId === question.id)?.value as string) === option}
                          onChange={() => updateAnswer(question.id, option)}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`${question.id}-option-${optionIndex}`} className="ml-3 block text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'checkbox' && question.options && (
                  <div className="mt-2 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${question.id}-option-${optionIndex}`}
                          checked={(answers.find(a => a.questionId === question.id)?.value as string[])?.includes(option) || false}
                          onChange={(e) => {
                            const currentValue = answers.find(a => a.questionId === question.id)?.value as string[] || [];
                            const newValue = e.target.checked
                              ? [...currentValue, option]
                              : currentValue.filter(v => v !== option);
                            updateAnswer(question.id, newValue);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`${question.id}-option-${optionIndex}`} className="ml-3 block text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'rating' && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => updateAnswer(question.id, rating)}
                          className={`h-10 w-10 rounded-md border ${
                            (answers.find(a => a.questionId === question.id)?.value as number) >= rating
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                )}
                
                {errors[question.id] && (
                  <p className="mt-1 text-sm text-red-600">{errors[question.id]}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 pb-10 flex justify-between">
          {currentPage > 0 ? (
            <Button 
              variant="outline" 
              onClick={handlePrevPage}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate('/surveys')}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            onClick={handleNextPage}
            className="flex items-center"
          >
            {currentPage < survey.pages.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Review Answers
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 