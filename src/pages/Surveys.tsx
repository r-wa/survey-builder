import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Survey } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await api.getSurveys();
        setSurveys(response.data);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Link
            key={survey.id}
            to={`/survey/${survey.id}`}
            className="group relative bg-white overflow-hidden rounded-lg border border-gray-200 hover:border-indigo-600 transition-all cursor-pointer"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {survey.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{survey.description}</p>
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}