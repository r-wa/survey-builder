import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, ClipboardList } from 'lucide-react';
import { Survey } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await api.getSurveys();
      setSurveys(response.data);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setDeletingSurveyId(id);
      await api.deleteSurvey(id);
      setSurveys(prevSurveys => prevSurveys.filter(survey => survey.id !== id));
    } catch (error) {
      console.error('Failed to delete survey:', error);
    } finally {
      setDeletingSurveyId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assessment Templates</h1>
        <Button asChild>
          <Link to="/create">
            <Plus className="h-5 w-5 mr-2" />
            Create Assessment
          </Link>
        </Button>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new assessment.</p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Assessment
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="group relative bg-white overflow-hidden rounded-lg border border-gray-200 hover:border-indigo-600 transition-all"
            >
              <Link
                to={`/survey/${survey.id}`}
                className="block p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {survey.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{survey.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    survey.status === 'published'
                      ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                      : "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                  )}>
                    {survey.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
              <div className="absolute top-2 right-2 flex gap-2">
                <Link
                  to={`/survey/${survey.id}`}
                  className="p-1.5 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="View Survey"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={(e) => handleDelete(survey.id, e)}
                  disabled={deletingSurveyId === survey.id}
                  className={cn(
                    "p-1.5 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-red-600 transition-colors",
                    deletingSurveyId === survey.id ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  title="Delete Survey"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}