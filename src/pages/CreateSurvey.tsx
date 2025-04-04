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

        // Ensure each page has at least one question - FIXED VERSION
        const pageErrors: {[key: string]: string} = {};
        
        for (const page of formData.pages) {
          // Get questions that actually exist for this page
          const pageQuestionIds = page.questionIds.filter(qId => 
            formData.questions.some(q => q.id === qId)
          );
          
          if (pageQuestionIds.length === 0) {
            const pageTitle = page.title || 'Untitled Page';
            pageErrors[page.id] = `Page "${pageTitle}" has no questions`;
            isValid = false;
          }
        }
        
        if (Object.keys(pageErrors).length > 0) {
          if (!newErrors.pages) newErrors.pages = {};
          Object.assign(newErrors.pages, pageErrors);
        }

        // Question validation remains the same
        const questionErrors: {[key: string]: {[key: string]: string}} = {};
        
        for (const page of formData.pages) {
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
      questionIds: [],
      sectionId: newSection.id
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
      questionIds: [],
      sectionId: sectionId
    };
    
    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
    
    setActivePage(newPage.id);
  };

  const removePage = (id: string) => {
    // Get current page to get its section before removal
    const pageToRemove = formData.pages.find(p => p.id === id);
    if (!pageToRemove) return;
    
    const sectionId = pageToRemove.sectionId;
    
    // Get questions on this page
    const questionsToRemove = formData.questions.filter(q => 
      pageToRemove.questionIds.includes(q.id)
    );
    
    const questionIdsToRemove = questionsToRemove.map(q => q.id);
    
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id),
      questions: prev.questions.filter(q => !questionIdsToRemove.includes(q.id))
    }));
    
    if (activePage === id) {
      // Set active page to another page in the same section
      const remainingPagesInSection = formData.pages.filter(p => 
        p.id !== id && p.sectionId === sectionId
      );
      
      setActivePage(remainingPagesInSection.length > 0 ? 
        remainingPagesInSection[0].id : null);
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
    
    // Now that we track sectionId on the page, we can directly filter pages by section
    const sectionPages = formData.pages.filter(page => page.sectionId === sectionId);
    
    return sectionPages.sort((a, b) => a.order - b.order);
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
        <>
          {/* Explanation box - moved outside the flex container */}
          <div className="w-full bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
            <h3 className="text-md font-medium text-blue-800 flex items-center mb-2">
              <Info className="h-4 w-4 mr-2" />
              How the Assessment Builder Works
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-1">1. Sections</h4>
                <p className="text-blue-600 text-xs">Group related questions together (e.g., "Personal Info", "Technical Skills").</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-1">2. Pages</h4>
                <p className="text-blue-600 text-xs">Control how many questions appear on one screen. Each page shows as a separate screen to users.</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-1">3. Questions</h4>
                <p className="text-blue-600 text-xs">Add different types of questions to your pages. Each page must have at least one question.</p>
              </div>
            </div>
          </div>
          
          {/* Main content with sidebar and editor */}
          <div className="flex space-x-4">
            {/* Sections Sidebar */}
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
                      <div>
                        <span className="font-medium text-sm">
                          {section.title || `Section ${index + 1}`}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {getSectionPages(section.id).length} page{getSectionPages(section.id).length !== 1 ? 's' : ''}
                        </div>
                      </div>
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
                          Pages in this Section
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                          Each page appears as a separate screen to users
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
                    
                    {/* Visual page tabs */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Pages in "{formData.sections.find(s => s.id === activeSection)?.title || 'Current Section'}"
                        </h3>
                        <span className="text-xs text-gray-500">
                          Each page appears as a separate screen to respondents
                        </span>
                      </div>
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-2" aria-label="Pages">
                          {getSectionPages(activeSection).map((page, index) => (
                            <button
                              key={page.id}
                              onClick={() => setActivePage(page.id)}
                              className={cn(
                                "whitespace-nowrap py-2 px-3 text-sm font-medium relative",
                                activePage === page.id
                                  ? "text-indigo-600 bg-indigo-50 rounded-t"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                                errors.pages?.[page.id] && "text-red-500"
                              )}
                            >
                              <div className="flex items-center">
                                <span>Page {index + 1}</span>
                                {errors.pages?.[page.id] && (
                                  <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                                )}
                              </div>
                              <div className={cn(
                                "text-xs mt-0.5",
                                activePage === page.id ? "text-indigo-400" : "text-gray-400",
                                errors.pages?.[page.id] && "text-red-400"
                              )}>
                                {page.questionIds.length} question{page.questionIds.length !== 1 && 's'}
                              </div>
                              {activePage === page.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                              )}
                            </button>
                          ))}
                          <button
                            onClick={() => addPage(activeSection)}
                            className="whitespace-nowrap border-transparent py-2 px-2 text-sm font-medium text-gray-400 hover:text-gray-600 flex items-center"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">New Page</span>
                          </button>
                        </nav>
                      </div>
                    </div>
                    
                    {/* Current active page content shown below */}
                    {activePage && (
                      <div className="bg-white rounded-lg border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-xs text-gray-500 mb-1 flex items-center">
                              <span>{formData.sections.find(s => s.id === activeSection)?.title || 'Section'}</span>
                              <span className="mx-1">›</span>
                              <span className="font-medium">Page {formData.pages.findIndex(p => p.id === activePage) + 1}</span>
                            </div>
                            <h3 className="text-md font-medium text-gray-900">
                              Page Content
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addQuestion(activePage, activeSection)}
                              className="relative group"
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Question
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                  Adding to: Page {formData.pages.findIndex(p => p.id === activePage) + 1} in Section "{formData.sections.find(s => s.id === activeSection)?.title || 'Untitled'}"
                                </div>
                                <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                              </div>
                            </Button>
                            {getSectionPages(activeSection).length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePage(activePage)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Page
                              </Button>
                            )}
                          </div>
                        </div>
                        
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
                            {getPageQuestions(activePage).map((question, index) => {
                              const hasError = errors.questions?.[activePage]?.[question.id];
                              
                              return (
                                <div key={question.id} className={cn(
                                  "border rounded-md p-4",
                                  hasError ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                                )}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                                        {index + 1}
                                      </span>
                                      {hasError && (
                                        <span className="ml-2 text-xs text-red-600">{errors.questions?.[activePage]?.[question.id]}</span>
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
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
        </>
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
            
            {/* Enhanced help text box */}
            <div className="rounded-md bg-blue-50 p-4 mb-6 border border-blue-200">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="ml-3 text-sm text-blue-700">
                  <p className="font-medium">Review your assessment before creating it</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li><span className="font-medium">Sections</span>: Group related questions together (e.g., "Personal Information", "Experience")</li>
                    <li><span className="font-medium">Pages</span>: Control how your questions are displayed to users. Each page appears as a separate screen</li>
                    <li><span className="font-medium">Questions</span>: The actual items users will respond to</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Enhanced validation error display */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">The following issues must be fixed:</h3>
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
                      {errors.title && <li>Title: {errors.title}</li>}
                      {errors.description && <li>Description: {errors.description}</li>}
                      {errors.sections && <li>Sections: {errors.sections}</li>}
                      {errors.pages && Object.entries(errors.pages).map(([pageId, error]) => {
                        const page = formData.pages.find(p => p.id === pageId);
                        const pageTitle = page?.title || 'Untitled Page';
                        return <li key={pageId}>Page "{pageTitle}": {error}</li>;
                      })}
                      {errors.questions && 
                        // Flatten nested errors structure to just get all question errors
                        Object.values(errors.questions).flatMap(questionErrors => 
                          Object.entries(questionErrors).map(([questionId, error]) => {
                            const question = formData.questions.find(q => q.id === questionId);
                            const questionText = question?.question || 'Untitled Question';
                            return <li key={questionId}>Question "{questionText.substring(0, 20)}...": {error}</li>;
                          })
                        )}
                    </ul>
                    <div className="mt-4">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm font-medium text-red-700 hover:text-red-600"
                      >
                        Go to Basic Info
                      </button>
                      <span className="mx-2 text-red-500">|</span>
                      <button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-sm font-medium text-red-700 hover:text-red-600"
                      >
                        Edit Structure
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium">Basic Information</h3>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Title</p>
                    <p className={`${errors.title ? 'text-red-600' : 'text-gray-800'}`}>
                      {formData.title || 'No title provided'}
                    </p>
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className={`${errors.description ? 'text-red-600' : 'text-gray-800'}`}>
                      {formData.description || 'No description provided'}
                    </p>
                    {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Survey Structure */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium">Assessment Structure</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {formData.sections.length} {formData.sections.length === 1 ? 'section' : 'sections'}, {formData.pages.length} {formData.pages.length === 1 ? 'page' : 'pages'}, {formData.questions.length} {formData.questions.length === 1 ? 'question' : 'questions'}
                    </span>
                    <button 
                      onClick={() => setStep(2)} 
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Visualization of survey structure with a more intuitive layout */}
                <div className="mt-4 space-y-4">
                  {formData.sections.map((section, sectionIndex) => (
                    <div key={section.id} className={`border rounded-md overflow-hidden ${errors.pages && Object.keys(errors.pages).some(pageId => getSectionPages(section.id).some(p => p.id === pageId)) ? 'border-red-300' : 'border-gray-200'}`}>
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{section.title || `Section ${sectionIndex + 1}`}</div>
                          <div className="text-xs text-gray-500">
                            {getSectionPages(section.id).length} page{getSectionPages(section.id).length !== 1 ? 's' : ''}, {formData.questions.filter(q => q.sectionId === section.id).length} question{formData.questions.filter(q => q.sectionId === section.id).length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {section.description && <div className="text-sm text-gray-600 mt-1">{section.description}</div>}
                      </div>
                      
                      <div className="divide-y divide-gray-100 px-4 pb-4">
                        {getSectionPages(section.id).length > 0 ? (
                          <div className="space-y-4 pt-3">
                            {getSectionPages(section.id).map((page, pageIndex) => (
                              <div key={page.id} className={`p-3 rounded-md ${errors.pages?.[page.id] ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium text-sm flex items-center">
                                    <span>Page {pageIndex + 1}</span>
                                    {errors.pages?.[page.id] && (
                                      <span className="ml-2 text-xs text-red-600 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors.pages[page.id]}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                    {page.questionIds.length} {page.questionIds.length === 1 ? 'question' : 'questions'}
                                  </span>
                                </div>
                                
                                {/* Questions list with visual indicators for type and validation */}
                                {getPageQuestions(page.id).length > 0 ? (
                                  <div className="pl-4 border-l-2 border-gray-200 space-y-3 mt-3">
                                    {getPageQuestions(page.id).map((question, questionIndex) => {
                                      const hasError = errors.questions?.[page.id]?.[question.id];
                                      
                                      return (
                                        <div key={question.id} className={`text-sm rounded p-2 ${hasError ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                          <div className="flex items-start">
                                            <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium mr-2 mt-0.5 ${hasError ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                              {questionIndex + 1}
                                            </span>
                                            <div className="flex-1">
                                              <div className="font-medium flex items-center">
                                                <span>{question.question || 'Untitled question'}</span>
                                                {hasError && <span className="ml-2 text-xs text-red-600">{errors.questions?.[page.id]?.[question.id]}</span>}
                                              </div>
                                              
                                              <div className="flex items-center mt-1 space-x-2">
                                                <span className="bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 text-xs">
                                                  {questionTypes.find(t => t.value === question.type)?.label || question.type}
                                                </span>
                                                {question.required && <span className="text-xs text-red-500">Required</span>}
                                              </div>
                                              
                                              {/* Show a preview of the options based on question type */}
                                              {(question.type === 'multiChoice' || question.type === 'checkbox') && question.options && (
                                                <div className="mt-2 grid grid-cols-2 gap-1 pl-1">
                                                  {question.options.slice(0, 4).map((option, i) => (
                                                    <div key={i} className="flex items-center text-xs text-gray-600">
                                                      {question.type === 'checkbox' ? '☐' : '○'} {option || `Option ${i + 1}`}
                                                    </div>
                                                  ))}
                                                  {question.options.length > 4 && (
                                                    <div className="text-xs text-gray-500">+{question.options.length - 4} more options</div>
                                                  )}
                                                  {(!question.options || question.options.length < 2) && (
                                                    <div className="text-xs text-red-600">Need at least 2 options</div>
                                                  )}
                                                </div>
                                              )}
                                              
                                              {question.type === 'rating' && (
                                                <div className="flex items-center mt-2 space-x-1">
                                                  <span className="text-xs text-gray-500">Rating scale: </span>
                                                  {[1, 2, 3, 4, 5].map(num => (
                                                    <span key={num} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                      {num}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="pl-4 mt-3 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Each page must have at least one question
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            This section has no pages. Add at least one page.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {formData.sections.length === 0 && (
                    <div className="bg-red-50 p-4 rounded-md text-red-600 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Your assessment needs at least one section
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Fixed help guide */}
            <div className="mt-8 p-4 bg-indigo-50 rounded-md border border-indigo-100">
              <h4 className="font-medium text-indigo-800 mb-2">How the survey builder works:</h4>
              <ol className="list-decimal list-inside text-sm space-y-2 text-indigo-700">
                <li><span className="font-medium">Sections</span>: Group related questions together (e.g., "Personal Information", "Experience")</li>
                <li><span className="font-medium">Pages</span>: Control how your questions are displayed to users. Each page appears as a separate screen</li>
                <li><span className="font-medium">Questions</span>: The actual items users will respond to</li>
              </ol>
              <div className="mt-3 text-xs text-indigo-600">
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Use the "Edit" buttons to return to previous steps and make changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}