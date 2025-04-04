import React, { useState, useEffect } from 'react';
import { Fireworks } from './Fireworks';

// Success phrases in "Success Kid" meme style
const SUCCESS_PHRASES = [
  "NAILED IT!",
  "LIKE A BOSS!",
  "EPIC WIN!",
  "TOTALLY CRUSHED IT!",
  "YOU'RE AWESOME!",
  "BOOM! DONE!",
  "SO MUCH WIN!",
  "ACHIEVEMENT UNLOCKED!",
  "VICTORY DANCE TIME!",
  "FIST PUMP!",
  "HIGH FIVE!",
  "YOU ROCK!",
  "WINNING AT LIFE!",
];

export const SuccessCelebration = ({ 
  timeElapsed,
  onClose
}: { 
  timeElapsed?: number;
  onClose?: () => void;
}) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiBounce, setEmojiBounce] = useState(false);

  // Select random phrase from the list
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SUCCESS_PHRASES.length);
    setCurrentPhrase(SUCCESS_PHRASES[randomIndex]);
    
    // Show emoji after a short delay
    setTimeout(() => {
      setShowEmoji(true);
    }, 300);
    
    // Start emoji bounce animation
    const bounceInterval = setInterval(() => {
      setEmojiBounce(prev => !prev);
    }, 800);
    
    return () => clearInterval(bounceInterval);
  }, []);

  return (
    <div className="relative min-h-[400px] w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Fireworks background */}
      <Fireworks />
      
      {/* Content */}
      <div className="z-20 text-center transform animate-bounce-slow">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          {currentPhrase}
        </h1>
        
        {timeElapsed && (
          <p className="text-xl font-medium text-gray-700 mb-6">
            You completed the survey in {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </p>
        )}
        
        {/* Large emoji with bounce effect */}
        {showEmoji && (
          <div className={`text-8xl transition-transform duration-300 ${emojiBounce ? 'scale-110' : 'scale-100'}`}>
            👊
          </div>
        )}
        
        {/* Instructions to create more fireworks */}
        <p className="mt-8 text-gray-600">
          Click anywhere for more fireworks!
        </p>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}; 