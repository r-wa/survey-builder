import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from './tooltip';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          
          {hint && (
            <Tooltip content={hint}>
              <InfoIcon className="inline-block ml-1 h-4 w-4 text-gray-400" />
            </Tooltip>
          )}
        </label>
      </div>
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600 mt-1 animate-fadeIn">
          {error}
        </p>
      )}
      
      {!error && hint && (
        <p className="text-xs text-gray-500 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
} 