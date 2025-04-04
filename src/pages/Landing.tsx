import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Share2, Lightbulb } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Landing() {
  const funnyTestingQuotes = [
    "I don't always test my code, but when I do, I do it in production.",
    "It's not a bug, it's an undocumented feature!",
    "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
    "QA Engineer walks into a bar. Orders a beer. Orders 0 beers. Orders 999999999 beers. Orders -1 beers. Orders a lizard. Orders a sfdeljknesv."
  ];

  const randomQuote = funnyTestingQuotes[Math.floor(Math.random() * funnyTestingQuotes.length)];

  return (
    <div className="relative isolate">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build Better QA Teams with Smart Assessments
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create comprehensive surveys to evaluate testing skills, technical knowledge, and problem-solving abilities of QA candidates.
          </p>
          
          {/* Funny quote */}
          <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Lightbulb className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
              <p className="ml-3 text-sm italic text-indigo-700">"{randomQuote}"</p>
            </div>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              asChild
              className="text-base"
            >
              <Link to="/create">
                Create Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="text-base"
            >
              <Link to="/surveys">
                View Templates
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  {feature.icon}
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        
        {/* How It Works Section */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-700 font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Create Your Assessment</h3>
              <p className="text-gray-600">Build a customized survey with multiple sections and question types.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-700 font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Share the Link</h3>
              <p className="text-gray-600">Send candidates a secure, shareable link to take the assessment.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-700 font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Analyze Results</h3>
              <p className="text-gray-600">Review candidate responses and make data-driven hiring decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Customizable Templates',
    description: 'Start with pre-built templates or create your own custom assessments tailored to your specific testing needs. The perfect bug hunt starts with the right questions!',
    icon: <CheckCircle2 className="h-5 w-5 flex-none text-indigo-600" />
  },
  {
    name: 'Secure Assessment Process',
    description: 'Candidates can only access assessments through unique shareable links. Think of it as your QA firewall - only the right testers get in!',
    icon: <Lock className="h-5 w-5 flex-none text-indigo-600" />
  },
  {
    name: 'Simple Sharing',
    description: 'Generate unique links for each candidate. Just like sharing a bug report, but way more fun for everyone involved.',
    icon: <Share2 className="h-5 w-5 flex-none text-indigo-600" />
  },
];