import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { Survey } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { SurveyCard } from '../components/SurveyCard';

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
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Create, view, and manage your assessment surveys</p>
        </div>
        <Button asChild className="hover:shadow-md transition-all">
          <Link to="/create" className="inline-flex items-center">
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
            <SurveyCard 
              key={survey.id}
              survey={survey}
              onDelete={handleDelete}
              isDeleting={deletingSurveyId === survey.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}