import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BarChart2, ClipboardList, Link as LinkIcon, Share2, Trash2 } from 'lucide-react';
import { Survey, SurveyStatistics as SurveyStatsType } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { SurveyStatistics } from '../components/SurveyStatistics';

export function SurveyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [statistics, setStatistics] = useState<SurveyStatsType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.getSurveyById(id);
        setSurvey(response.data);
        if (response.data.shareableLink) {
          setShareableLink(response.data.shareableLink);
        }
      } catch (error) {
        console.error('Failed to fetch survey:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await api.deleteSurvey(id);
      navigate('/surveys');
    } catch (error) {
      console.error('Failed to delete survey:', error);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleGenerateShareableLink = async () => {
    if (!id) return;
    try {
      const response = await api.generateShareableLink(id);
      setShareableLink(response.data);
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
    }
  };

  const handleCopyLink = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 2000);
  };

  const handleViewStatistics = async () => {
    if (!id || statistics) {
      setShowStats(!showStats);
      return;
    }
    
    try {
      setLoadingStats(true);
      const response = await api.getSurveyStatistics(id);
      setStatistics(response.data);
      setShowStats(true);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoadingStats(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
              survey.status === 'published'
                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                : "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
            )}>
              {survey.status}
            </span>
            <span className="text-sm text-gray-500">
              Created on {new Date(survey.createdAt).toLocaleDateString()}
            </span>
            {survey.completionCount > 0 && (
              <span className="text-sm text-indigo-600 font-medium">
                {survey.completionCount} response{survey.completionCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {confirmDelete ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewStatistics}
                disabled={loadingStats}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                {loadingStats ? 'Loading...' : showStats ? 'Hide Statistics' : 'View Statistics'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareableLink ? handleCopyLink() : handleGenerateShareableLink()}
              >
                {shareableLink ? (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {copyLinkSuccess ? 'Copied!' : 'Copy Link'}
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button size="sm">
                <Link to={`/survey/${id}/take`} className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Take Survey
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <p className="text-gray-600">{survey.description}</p>
        
        {shareableLink && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-md border border-indigo-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-indigo-900">Shareable Link</h3>
                <p className="text-xs text-indigo-700 truncate">{shareableLink}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="shrink-0 bg-white"
                onClick={handleCopyLink}
              >
                {copyLinkSuccess ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {showStats && statistics && (
        <div className="mb-8">
          <SurveyStatistics 
            survey={survey}
            statistics={statistics}
          />
        </div>
      )}

      {showStats && loadingStats && (
        <div className="mb-8 py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
        <div className="space-y-4">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span className="capitalize">{question.type.replace(/([A-Z])/g, ' $1')}</span>
                    {question.options && question.options.length > 0 && (
                      <span className="ml-2">
                        ({question.options.length} option{question.options.length !== 1 ? 's' : ''})
                      </span>
                    )}
                    {question.sectionId && (
                      <span className="ml-2 text-indigo-600">
                        {survey.sections?.find(s => s.id === question.sectionId)?.title || 'Section'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pb-12">
        <Button>
          <Link to={`/survey/${id}/take`} className="flex items-center">
            Take Survey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 