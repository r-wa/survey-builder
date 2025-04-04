import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavBar } from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header - Only show NavBar when not on landing page */}
      {!isLandingPage && <NavBar />}
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          {children}
        </div>
      </main>
      
      {/* Footer - Fixed at bottom */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} All rights reserved.
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