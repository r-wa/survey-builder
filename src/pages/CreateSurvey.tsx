import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowRight, ArrowLeft, Layers, FileText, Move, AlertCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FormField } from '../components/ui/form-field';
import { Tooltip } from '../components/ui/tooltip';
import { Question, SurveyFormData, Section, Page } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

const questionTypes = [
  { value: 'text', label: 'Text Response' },
  { value: 'multiChoice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Rating' },
];

export function CreateSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    questions: [],
    sections: [],
    pages: [],
  });
  
  // Validation states
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    sections?: string;
    pages?: {[key: string]: string};
    questions?: {[key: string]: {[key: string]: string}};
  }>({});
  
  // Touch tracking for validation
  const [touched, setTouched] = useState<{
    title?: boolean;
    description?: boolean;
  }>({});

  // Add a state for form validity
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Use useEffect to validate the survey when needed
  useEffect(() => {
    if (step === 3) {
      // Only validate when on step 3
      const validateForm = () => {
        const newErrors: typeof errors = {};
        let isValid = true;
        
        // Basic validation
        if (!formData.title) {
          newErrors.title = "Title is required";
          isValid = false;
        }
        
        if (!formData.description) {
          newErrors.description = "Description is required";
          isValid = false;
        }
        
        if (formData.questions.length === 0) {
          newErrors.sections = "At least one question is required";
          isValid = false;
        }

        // Ensure each section has at least one page
        if (formData.sections.length === 0) {
          newErrors.sections = "Please create at least one section";
          isValid = false;
        } else {
          const sectionErrors: {[key: string]: string} = {};
          
          for (const section of formData.sections) {
            const sectionPages = getSectionPages(section.id);
            if (sectionPages.length === 0) {
              sectionErrors[section.id] = `Section "${section.title}" has no pages`;
              isValid = false;
            }
          }
          
          if (Object.keys(sectionErrors).length > 0) {
            newErrors.pages = sectionErrors;
          }
        }

        // Ensure each page has at least one question
        const questionErrors: {[key: string]: {[key: string]: string}} = {};
        
        for (const page of formData.pages) {
          if (page.questionIds.length === 0) {
            const pageTitle = page.title || 'Untitled Page';
            if (!newErrors.pages) newErrors.pages = {};
            newErrors.pages[page.id] = `Page "${pageTitle}" has no questions`;
            isValid = false;
          }
          
          // Validate each question on the page
          const pageQuestions = getPageQuestions(page.id);
          const pageQuestionErrors: {[key: string]: string} = {};
          
          for (const question of pageQuestions) {
            if (!question.question.trim()) {
              pageQuestionErrors[question.id] = "Question text is required";
              isValid = false;
            }
            
            if ((question.type === 'multiChoice' || question.type === 'checkbox') && 
                (!question.options || question.options.length < 2)) {
              pageQuestionErrors[question.id] = "At least two options are required";
              isValid = false;
            }
          }
          
          if (Object.keys(pageQuestionErrors).length > 0) {
            if (!questionErrors[page.id]) questionErrors[page.id] = {};
            questionErrors[page.id] = pageQuestionErrors;
          }
        }
        
        if (Object.keys(questionErrors).length > 0) {
          newErrors.questions = questionErrors;
        }
        
        setErrors(newErrors);
        setIsFormValid(isValid);
      };
      
      validateForm();
    }
  }, [step, formData]);

  // Replace validateSurvey with a function that returns the current state
  const validateSurvey = (): boolean => {
    if (step === 3) {
      return isFormValid;
    }
    return true;
  };

  // Section management
  const addSection = () => {
    const newSection: Section = {
      id: `section-${Math.random().toString(36).substring(7)}`,
      title: `Section ${formData.sections.length + 1}`,
      description: '',
      order: formData.sections.length
    };
    
    // Add a default page for this section
    const newPage: Page = {
      id: `page-${Math.random().toString(36).substring(7)}`,
      title: `Page 1`,
      order: 0,
      questionIds: []
    };
    
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      pages: [...prev.pages, newPage],
    }));
    
    setActiveSection(newSection.id);
    setActivePage(newPage.id);
  };

  const removeSection = (id: string) => {
    // Get pages associated with this section
    const pagesToRemove = formData.pages.filter(p => 
      formData.questions.filter(q => q.sectionId === id)
        .some(q => p.questionIds.includes(q.id))
    );
    
    const pageIdsToRemove = pagesToRemove.map(p => p.id);
    const questionIdsToRemove = formData.questions
      .filter(q => q.sectionId === id)
      .map(q => q.id);
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
      pages: prev.pages.filter(p => !pageIdsToRemove.includes(p.id)),
      questions: prev.questions.filter(q => !questionIdsToRemove.includes(q.id))
    }));
    
    if (activeSection === id) {
      setActiveSection(formData.sections.length > 1 ? formData.sections[0].id : null);
      setActivePage(null);
    }
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  };

  // Page management
  const addPage = (sectionId: string) => {
    // Get existing pages for this section
    const sectionPages = getSectionPages(sectionId);
    
    const newPage: Page = {
      id: `page-${Math.random().toString(36).substring(7)}`,
      title: `Page ${sectionPages.length + 1}`,
      order: sectionPages.length,
      questionIds: []
    };
    
    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
    
    setActivePage(newPage.id);
  };

  const removePage = (id: string) => {
    // Get questions on this page
    const questionsToRemove = formData.questions.filter(q => 
      formData.pages.find(p => p.id === id)?.questionIds.includes(q.id)
    );
    
    const questionIdsToRemove = questionsToRemove.map(q => q.id);
    
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id),
      questions: prev.questions.filter(q => !questionIdsToRemove.includes(q.id))
    }));
    
    if (activePage === id) {
      // Set active page to another page in the same section
      const sectionPages = getSectionPages(activeSection || '');
      setActivePage(sectionPages.length > 1 ? 
        sectionPages.find(p => p.id !== id)?.id || null : null);
    }
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  // Helper to get pages associated with a section
  const getSectionPages = (sectionId: string): Page[] => {
    if (!sectionId) return [];
    
    // Find questions in this section
    const sectionQuestionIds = formData.questions
      .filter(q => q.sectionId === sectionId)
      .map(q => q.id);
    
    // Find pages that contain these questions
    return formData.pages.filter(page => 
      page.questionIds.some(qId => sectionQuestionIds.includes(qId))
    ).sort((a, b) => a.order - b.order);
  };

  // Question management
  const addQuestion = (pageId: string, sectionId: string) => {
    const newQuestion: Question = {
      id: `question-${Math.random().toString(36).substring(7)}`,
      type: 'text',
      question: '',
      required: true,
      options: [],
      sectionId
    };
    
    // Update page to include this question
    const updatedPages = formData.pages.map(page => 
      page.id === pageId ? {
        ...page,
        questionIds: [...page.questionIds, newQuestion.id]
      } : page
    );
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      pages: updatedPages
    }));
  };

  const removeQuestion = (id: string) => {
    // Remove question from questions array and any page that contains it
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
      pages: prev.pages.map(page => ({
        ...page,
        questionIds: page.questionIds.filter(qId => qId !== id)
      }))
    }));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  };

  // Helper to get questions on a specific page
  const getPageQuestions = (pageId: string): Question[] => {
    if (!pageId) return [];
    
    const page = formData.pages.find(p => p.id === pageId);
    if (!page) return [];
    
    return page.questionIds.map(qId => 
      formData.questions.find(q => q.id === qId)
    ).filter(Boolean) as Question[];
  };

  // Validate a specific field
  const validateField = (field: string, value: string): void => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value) {
          newErrors.title = "Title is required";
        } else {
          delete newErrors.title;
        }
        break;
        
      case 'description':
        if (!value) {
          newErrors.description = "Description is required";
        } else {
          delete newErrors.description;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (!validateSurvey()) {
      // Show helper message
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorMessage = errors[firstError as keyof typeof errors];
        if (typeof errorMessage === 'string') {
          alert(`Please fix the following error: ${errorMessage}`);
        } else {
          alert("Please fix all validation errors before submitting");
        }
      }
      return;
    }
    
    setLoading(true);
    try {
      await api.createSurvey({
        ...formData,
        status: 'published',
        completionCount: 0
      });
      navigate('/surveys');
    } catch (error) {
      console.error('Failed to create survey:', error);
      alert("An error occurred while creating the survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Step {step} of 3</span>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 && (
              <Button 
                onClick={() => {
                  if (step === 1) {
                    // Validate step 1 fields
                    setTouched({ title: true, description: true });
                    validateField('title', formData.title);
                    validateField('description', formData.description);
                    
                    if (!formData.title || !formData.description) {
                      return;
                    }
                  }
                  setStep(step + 1);
                }} 
                disabled={
                  (step === 1 && (!formData.title || !formData.description)) ||
                  (step === 2 && formData.sections.length === 0)
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleSubmit} disabled={!isFormValid}>
                Create Assessment
              </Button>
            )}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <FormField
              label="Title"
              htmlFor="survey-title"
              error={touched.title && errors.title}
              hint="Give your assessment a clear, descriptive title that indicates its purpose"
              required
            >
              <input
                id="survey-title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, title: value }));
                  if (touched.title) {
                    validateField('title', value);
                  }
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, title: true }));
                  validateField('title', formData.title);
                }}
                className={cn(
                  "mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition-all",
                  errors.title 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
                placeholder="e.g., Frontend Developer Assessment"
              />
            </FormField>
            
            <FormField
              label="Description"
              htmlFor="survey-description"
              error={touched.description && errors.description}
              hint="Describe what the assessment covers and what participants should expect"
              required
            >
              <textarea
                id="survey-description"
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, description: value }));
                  if (touched.description) {
                    validateField('description', value);
                  }
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, description: true }));
                  validateField('description', formData.description);
                }}
                rows={4}
                className={cn(
                  "mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition-all",
                  errors.description 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
                placeholder="Describe the purpose of this assessment..."
              />
            </FormField>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex space-x-4">
          {/* Sections Sidebar with enhanced guidance */}
          <div className="w-1/4 bg-white shadow-sm rounded-lg p-4 h-fit">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Sections
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create sections to organize your assessment
              </p>
              {errors.sections && (
                <div className="mt-2 text-sm text-red-600 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                  <span>{errors.sections}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {formData.sections.map((section, index) => (
                <div 
                  key={section.id} 
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "p-3 rounded-md cursor-pointer flex items-center justify-between group",
                    activeSection === section.id 
                      ? "bg-indigo-50 border border-indigo-200"
                      : "bg-gray-50 hover:bg-gray-100",
                    errors.pages?.[section.id] && "border border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-center">
                    <Move className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-sm">
                      {section.title || `Section ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {errors.pages?.[section.id] && (
                      <Tooltip content={errors.pages[section.id]}>
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      </Tooltip>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (formData.sections.length === 1) {
                          alert("You need at least one section in your assessment");
                        } else {
                          removeSection(section.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                onClick={addSection}
                variant="outline"
                className="w-full justify-center mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="w-3/4 space-y-4">
            {activeSection ? (
              <>
                {/* Section Edit with enhanced guidance */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      {formData.sections.find(s => s.id === activeSection)?.title || 'Section'}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Section Title"
                      htmlFor="section-title"
                      hint="Give your section a clear title that describes its content or theme"
                    >
                      <input
                        id="section-title"
                        type="text"
                        value={formData.sections.find(s => s.id === activeSection)?.title || ''}
                        onChange={(e) => updateSection(activeSection, { title: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., Technical Knowledge, Behavioral Questions"
                      />
                    </FormField>
                    
                    <FormField
                      label="Description"
                      htmlFor="section-description"
                      hint="Briefly explain what this section covers"
                    >
                      <textarea
                        id="section-description"
                        value={formData.sections.find(s => s.id === activeSection)?.description || ''}
                        onChange={(e) => updateSection(activeSection, { description: e.target.value })}
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        placeholder="Describe what this section is about..."
                      />
                    </FormField>
                  </div>
                </div>
                
                {/* Pages List with improved validation */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Pages
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Create pages to organize questions within this section
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addPage(activeSection)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Page
                    </Button>
                  </div>
                  
                  {getSectionPages(activeSection).length === 0 && (
                    <div className="rounded-md bg-blue-50 p-4 mb-4">
                      <div className="flex">
                        <Info className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            This section needs at least one page. Click "Add Page" to create one.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {getSectionPages(activeSection).map((page, index) => (
                      <div
                        key={page.id}
                        onClick={() => setActivePage(page.id)}
                        className={cn(
                          "p-3 rounded-md cursor-pointer border group transition-all",
                          activePage === page.id
                            ? "bg-indigo-50 border-indigo-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                          errors.pages?.[page.id] && "border-red-200 bg-red-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {page.title || `Page ${index + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              page.questionIds.length === 0
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-200 text-gray-700"
                            )}>
                              {page.questionIds.length} Q
                            </span>
                            {errors.pages?.[page.id] && (
                              <Tooltip content={errors.pages[page.id]}>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              </Tooltip>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (getSectionPages(activeSection).length === 1) {
                                  alert("Each section needs at least one page");
                                } else {
                                  removePage(page.id);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {page.questionIds.length === 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            This page needs at least one question
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Page Content with better guidance */}
                {activePage && (
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        {formData.pages.find(p => p.id === activePage)?.title || 'Page'}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        label="Page Title"
                        htmlFor="page-title"
                        hint="Name this page to help organize your assessment flow"
                      >
                        <input
                          id="page-title"
                          type="text"
                          value={formData.pages.find(p => p.id === activePage)?.title || ''}
                          onChange={(e) => updatePage(activePage, { title: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g., Basic Information, Technical Skills"
                        />
                      </FormField>
                      
                      {/* Questions on this page with better validation */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FormField
                            label="Questions"
                            hint="Add questions that will appear on this page"
                            className="mb-0"
                          >
                            <div></div>
                          </FormField>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestion(activePage, activeSection)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Question
                          </Button>
                        </div>
                        
                        {getPageQuestions(activePage).length === 0 && (
                          <div className="rounded-md bg-blue-50 p-4 mb-4">
                            <div className="flex">
                              <Info className="h-5 w-5 text-blue-400" />
                              <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                  This page needs at least one question. Click "Add Question" to create one.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {getPageQuestions(activePage).map((question, index) => (
                            <div key={question.id} className={cn(
                              "border rounded-md p-4",
                              errors.questions?.[activePage]?.[question.id] 
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50 border-gray-200"
                            )}>
              <div className="flex items-start justify-between">
                                <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                  {index + 1}
                </span>
                                  {errors.questions?.[activePage]?.[question.id] && (
                                    <span className="ml-2 text-sm text-red-600 flex items-center">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      {errors.questions[activePage][question.id]}
                                    </span>
                                  )}
                                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
                              
                              <div className="mt-3 space-y-3">
                                <FormField
                                  label="Question Type"
                                  htmlFor={`question-type-${question.id}`}
                                  hint="Select the type of response you want"
                                >
                  <select
                                    id={`question-type-${question.id}`}
                    value={question.type}
                                    onChange={(e) => {
                                      const newType = e.target.value as Question['type'];
                                      // If switching to multiChoice/checkbox, initialize with two options
                                      let options = question.options;
                                      if ((newType === 'multiChoice' || newType === 'checkbox') && 
                                          (!question.options || question.options.length < 2)) {
                                        options = ['Option 1', 'Option 2'];
                                      }
                                      updateQuestion(question.id, { 
                                        type: newType,
                                        options
                                      });
                                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                                </FormField>
                                
                                <FormField
                                  label="Question Text"
                                  htmlFor={`question-text-${question.id}`}
                                  error={errors.questions?.[activePage]?.[question.id] && question.question.trim() === '' ? "Question text is required" : undefined}
                                  hint="Write a clear, specific question"
                                  required
                                >
                  <input
                                    id={`question-text-${question.id}`}
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                    className={cn(
                                      "mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition-all",
                                      errors.questions?.[activePage]?.[question.id] && question.question.trim() === '' 
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    )}
                    placeholder="Enter your question..."
                  />
                                </FormField>
                                
                {(question.type === 'multiChoice' || question.type === 'checkbox') && (
                                  <FormField
                                    label="Options"
                                    htmlFor={`question-options-${question.id}`}
                                    error={errors.questions?.[activePage]?.[question.id] && (!question.options || question.options.length < 2) ? "At least two options are required" : undefined}
                                    hint="Add response options for the participant to choose from"
                                    required
                                  >
                    <div className="mt-2 space-y-2">
                      {question.options?.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(question.options || [])];
                            newOptions[optionIndex] = e.target.value;
                            updateQuestion(question.id, { options: newOptions });
                          }}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                                          {question.options && question.options.length > 2 && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const newOptions = [...question.options!];
                                                newOptions.splice(optionIndex, 1);
                                                updateQuestion(question.id, { options: newOptions });
                                              }}
                                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(question.options || []), ''];
                          updateQuestion(question.id, { options: newOptions });
                        }}
                      >
                        Add Option
                      </Button>
                    </div>
                                  </FormField>
                                )}
                                
                                {question.type === 'rating' && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                      Participants will rate on a 1-5 scale
                                    </p>
                                    <div className="flex items-center mt-2 space-x-2">
                                      {[1, 2, 3, 4, 5].map(num => (
                                        <div key={num} className="flex flex-col items-center">
                                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                                            {num}
                                          </div>
                                          <div className="text-xs mt-1">
                                            {num === 1 ? 'Poor' : num === 5 ? 'Excellent' : ''}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                  </div>
                )}
                                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                                    id={`required-${question.id}`}
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                                  <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-900">
                                    Required question
                                  </label>
                                  <Tooltip content="Participants must answer this question to proceed">
                                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                <h3 className="text-xl font-medium text-gray-700">Select or Create a Section</h3>
                <p className="text-sm text-gray-500 mt-2 mb-6">
                  Start by creating a section to organize your assessment
                </p>
                <Button
                  onClick={addSection}
                  variant="default"
                  size="lg"
                  className="px-6"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Your First Section
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Assessment Preview</h2>
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-md flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please fix validation errors before creating
                </div>
              )}
            </div>
            
            <div className="rounded-md bg-blue-50 p-4 mb-6 border border-blue-200">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="ml-3 text-sm text-blue-700">
                  <p>Review your assessment before creating it. Check for:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Clear, specific questions</li>
                    <li>Logical flow between sections</li>
                    <li>Appropriate question types</li>
                    <li>Complete required information</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-md font-medium">Basic Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Title</p>
                    <p className="text-gray-800">{formData.title || 'No title provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-gray-800">{formData.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium">Assessment Structure</h3>
                  <span className="text-sm text-gray-500">
                    {formData.sections.length} {formData.sections.length === 1 ? 'section' : 'sections'}, {formData.pages.length} {formData.pages.length === 1 ? 'page' : 'pages'}, {formData.questions.length} {formData.questions.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                
                {formData.sections.length > 0 ? (
                  <div className="mt-4 space-y-6">
                    {formData.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-indigo-50 p-3 border-b border-indigo-100">
                          <div className="font-medium">{section.title || `Section ${sectionIndex + 1}`}</div>
                          {section.description && <div className="text-sm text-gray-600 mt-1">{section.description}</div>}
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                          {getSectionPages(section.id).length > 0 ? (
                            getSectionPages(section.id).map((page, pageIndex) => (
                              <div key={page.id} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium text-sm">{page.title || `Page ${pageIndex + 1}`}</div>
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                                    {page.questionIds.length} {page.questionIds.length === 1 ? 'question' : 'questions'}
                                  </span>
                                </div>
                                
                                {getPageQuestions(page.id).length > 0 ? (
                                  <div className="pl-4 border-l-2 border-gray-200 space-y-3 mt-3">
                                    {getPageQuestions(page.id).map((question, questionIndex) => (
                                      <div key={question.id} className="text-sm">
                                        <div className="flex items-start">
                                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium mr-2 mt-0.5">
                                            {questionIndex + 1}
                                          </span>
                                          <div>
                                            <div className="font-medium">{question.question || 'Untitled question'}</div>
                                            <div className="text-xs text-gray-500 flex items-center mt-1">
                                              <span className="bg-indigo-100 text-indigo-800 rounded px-1.5 py-0.5">
                                                {questionTypes.find(t => t.value === question.type)?.label || question.type}
                                              </span>
                                              {question.required && <span className="text-red-500 ml-1">Required</span>}
                                            </div>
                                            
                                            {(question.type === 'multiChoice' || question.type === 'checkbox') && question.options && question.options.length > 0 && (
                                              <div className="mt-2 pl-2 space-y-1">
                                                {question.options.map((option, i) => (
                                                  <div key={i} className="flex items-center">
                                                    {question.type === 'checkbox' ? (
                                                      <div className="h-3 w-3 border border-gray-400 rounded mr-2" />
                                                    ) : (
                                                      <div className="h-3 w-3 border border-gray-400 rounded-full mr-2" />
                                                    )}
                                                    <span className="text-gray-600">{option || `Option ${i + 1}`}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                            
                                            {question.type === 'rating' && (
                                              <div className="flex items-center mt-2 space-x-1">
                                                {[1, 2, 3, 4, 5].map(num => (
                                                  <div key={num} className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs">
                                                    {num}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="pl-4 mt-3 text-sm text-red-600">
                                    No questions on this page
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-red-600">
                              No pages in this section
                            </div>
                          )}
              </div>
            </div>
          ))}
                  </div>
                ) : (
                  <div className="mt-4 bg-red-50 p-4 rounded-md text-red-600">
                    No sections defined
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}