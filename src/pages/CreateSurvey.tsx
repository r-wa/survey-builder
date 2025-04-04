import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowRight, ArrowLeft, Layers, FileText, Move } from 'lucide-react';
import { Button } from '../components/ui/button';
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

  // Validation before submission
  const validateSurvey = (): boolean => {
    // Basic validation
    if (!formData.title || !formData.description || formData.questions.length === 0) {
      return false;
    }

    // Ensure each section has at least one page
    if (formData.sections.length > 0) {
      for (const section of formData.sections) {
        const sectionPages = getSectionPages(section.id);
        if (sectionPages.length === 0) {
          alert(`Section "${section.title}" has no pages.`);
          return false;
        }
      }
    } else {
      alert('Please create at least one section.');
      return false;
    }

    // Ensure each page has at least one question
    for (const page of formData.pages) {
      if (page.questionIds.length === 0) {
        const pageTitle = page.title || 'Untitled Page';
        alert(`Page "${pageTitle}" has no questions.`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSurvey()) {
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
                onClick={() => setStep(step + 1)} 
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
              <Button onClick={handleSubmit} disabled={!validateSurvey()}>
                Create Assessment
              </Button>
            )}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Frontend Developer Assessment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe the purpose of this assessment..."
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
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
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center">
                    <Move className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-sm">
                      {section.title || `Section ${index + 1}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(section.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="w-3/4 space-y-4">
            {activeSection ? (
              <>
                {/* Section Edit */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      {formData.sections.find(s => s.id === activeSection)?.title || 'Section'}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Section Title</label>
                      <input
                        type="text"
                        value={formData.sections.find(s => s.id === activeSection)?.title || ''}
                        onChange={(e) => updateSection(activeSection, { title: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={formData.sections.find(s => s.id === activeSection)?.description || ''}
                        onChange={(e) => updateSection(activeSection, { description: e.target.value })}
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Pages List */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Pages
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addPage(activeSection)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Page
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {getSectionPages(activeSection).map((page, index) => (
                      <div
                        key={page.id}
                        onClick={() => setActivePage(page.id)}
                        className={cn(
                          "p-3 rounded-md cursor-pointer border group",
                          activePage === page.id
                            ? "bg-indigo-50 border-indigo-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {page.title || `Page ${index + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                              {page.questionIds.length} Q
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePage(page.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Page Content */}
                {activePage && (
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        {formData.pages.find(p => p.id === activePage)?.title || 'Page'}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Page Title</label>
                        <input
                          type="text"
                          value={formData.pages.find(p => p.id === activePage)?.title || ''}
                          onChange={(e) => updatePage(activePage, { title: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      {/* Questions on this page */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Questions</label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestion(activePage, activeSection)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Question
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {getPageQuestions(activePage).map((question, index) => (
                            <div key={question.id} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                              <div className="flex items-start justify-between">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                                  {index + 1}
                                </span>
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
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Question Type</label>
                                  <select
                                    value={question.type}
                                    onChange={(e) => updateQuestion(question.id, { type: e.target.value as Question['type'] })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                  >
                                    {questionTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Question</label>
                                  <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Enter your question..."
                                  />
                                </div>
                                
                                {(question.type === 'multiChoice' || question.type === 'checkbox') && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Options</label>
                                    <div className="mt-2 space-y-2">
                                      {question.options?.map((option, optionIndex) => (
                                        <input
                                          key={optionIndex}
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
                                  </div>
                                )}
                                
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label className="ml-2 block text-sm text-gray-900">Required question</label>
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
            <h2 className="text-lg font-bold mb-4">Assessment Preview</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium">Title</h3>
                <p className="text-gray-700">{formData.title}</p>
              </div>
              
              <div>
                <h3 className="text-md font-medium">Description</h3>
                <p className="text-gray-700">{formData.description}</p>
              </div>

              {formData.sections.length > 0 && (
                <div>
                  <h3 className="text-md font-medium">Sections ({formData.sections.length})</h3>
                  <div className="mt-2 space-y-6">
                    {formData.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-indigo-50 p-3 border-b border-indigo-100">
                          <div className="font-medium">{section.title || `Section ${sectionIndex + 1}`}</div>
                          {section.description && <div className="text-sm text-gray-600 mt-1">{section.description}</div>}
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                          {getSectionPages(section.id).map((page, pageIndex) => (
                            <div key={page.id} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-sm">{page.title || `Page ${pageIndex + 1}`}</div>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                                  {page.questionIds.length} questions
                                </span>
                              </div>
                              
                              <div className="pl-4 border-l-2 border-gray-200 space-y-2 mt-3">
                                {getPageQuestions(page.id).map((question, questionIndex) => (
                                  <div key={question.id} className="text-sm">
                                    <div className="flex items-start">
                                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium mr-2 mt-0.5">
                                        {questionIndex + 1}
                                      </span>
                                      <div>
                                        <div>{question.question || 'Untitled question'}</div>
                                        <div className="text-xs text-gray-500">
                                          {questionTypes.find(t => t.value === question.type)?.label || question.type}
                                          {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}