import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { NavBar } from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <NavBar />
      
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">SurveyBuilder</span>
            </div>
            <p className="mt-4 md:mt-0 text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SurveyBuilder. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/" className="text-gray-500 hover:text-indigo-600">
                About
              </Link>
              <Link to="/" className="text-gray-500 hover:text-indigo-600">
                Privacy
              </Link>
              <Link to="/" className="text-gray-500 hover:text-indigo-600">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}