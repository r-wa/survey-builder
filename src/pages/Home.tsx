import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Survey } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Home() {
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
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.location.href = '/create'}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Survey
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => window.location.href = `/survey/${survey.id}`}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{survey.description}</p>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  survey.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {survey.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}