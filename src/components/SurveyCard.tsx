import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Trash2, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { Survey } from '../types';
import { Button } from './ui/button';

interface SurveyCardProps {
  survey: Survey;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isDeleting: boolean;
}

export function SurveyCard({ survey, onDelete, isDeleting }: SurveyCardProps) {
  const statusColor = survey.status === 'published' 
    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
    : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20';

  const formattedDate = new Date(survey.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {survey.title}
          </h3>
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
            statusColor
          )}>
            {survey.status}
          </span>
        </div>
        
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {survey.description}
        </p>

        <div className="mt-4 flex items-center text-xs text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
          <span className="mx-2">•</span>
          <span>{survey.questions.length} questions</span>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-indigo-600"
            asChild
          >
            <Link to={`/survey/${survey.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-indigo-600"
            asChild
          >
            <Link to={`/survey/${survey.id}/take`}>
              <Award className="h-4 w-4 mr-1" />
              Take
            </Link>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-red-600"
          onClick={(e) => onDelete(survey.id, e)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
} 