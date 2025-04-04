import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Survey, Answer } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function TakeSurvey() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.getSurveyById(id);
        setSurvey(response.data);
        
        // Initialize answers
        const initialAnswers = response.data.questions.map(q => ({
          questionId: q.id,
          value: q.type === 'checkbox' ? [] : q.type === 'rating' ? 0 : '',
        }));
        
        setAnswers(initialAnswers);
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!survey) return false;
    
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

  const handleSubmit = async () => {
    if (!validateForm() || !survey || !id) return;
    
    try {
      setSubmitting(true);
      await api.submitSurveyResponse(id, answers);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey:', error);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        <p className="mt-2 text-gray-600">{survey.description}</p>
      </div>

      <div className="space-y-6">
        {survey.questions.map((question, index) => (
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

        <div className="pt-4 pb-10 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/surveys')}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </div>
      </div>
    </div>
  );
} 