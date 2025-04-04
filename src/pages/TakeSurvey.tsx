import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Survey, Answer, Question } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { SurveyReview } from '../components/SurveyReview';
import { MotivationalMessage } from '../components/MotivationalMessage';
import { SuccessCelebration } from '../components/SuccessCelebration';

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
  const [completionTime, setCompletionTime] = useState<number>(0);

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
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      setCompletionTime(timeSpent);
      await api.submitSurveyResponse(id, answers, timeSpent);
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
      <div className="max-w-4xl mx-auto">
        <SuccessCelebration 
          timeElapsed={completionTime}
          onClose={() => navigate('/')}
        />
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        <p className="text-gray-600">{survey.description}</p>
        
        <div className="mt-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Page {currentPage + 1} of {survey.pages.length}</span>
            <span className="text-sm font-medium text-gray-900">{progress}% Complete</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Add motivational message */}
        <MotivationalMessage progress={progress} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {currentQuestions.map((question) => (
          <div key={question.id} className="mb-8 last:mb-0">
            <div className="mb-2 flex items-start">
              <span className="text-base font-medium text-gray-900">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
            
            {/* Question inputs based on type */}
            {question.type === 'text' && (
              <textarea
                value={answers.find(a => a.questionId === question.id)?.value as string || ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                className={`w-full p-3 border rounded-md ${errors[question.id] ? 'border-red-500' : 'border-gray-300'}`}
                rows={4}
              />
            )}
            
            {question.type === 'multiChoice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers.find(a => a.questionId === question.id)?.value === option}
                      onChange={() => updateAnswer(question.id, option)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {question.type === 'checkbox' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={(answers.find(a => a.questionId === question.id)?.value as string[] || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = [...(answers.find(a => a.questionId === question.id)?.value as string[] || [])];
                        if (e.target.checked) {
                          updateAnswer(question.id, [...currentValues, option]);
                        } else {
                          updateAnswer(question.id, currentValues.filter(v => v !== option));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {question.type === 'rating' && (
              <div className="flex space-x-4 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateAnswer(question.id, rating)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      answers.find(a => a.questionId === question.id)?.value === rating
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}
            
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={handleNextPage}
        >
          {currentPage < survey.pages.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Review Answers
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 