import React, { useState, useEffect } from 'react';
import { Laugh, Brain, Coffee, Trophy, Lightbulb, CheckCircle2, ThumbsUp } from 'lucide-react';

interface MotivationalMessageProps {
  progress: number;
}

export function MotivationalMessage({ progress }: MotivationalMessageProps) {
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);
  
  const earlyMessages = [
    { text: "Let's get started! No bugs were harmed in the making of this survey.", icon: <Laugh className="h-5 w-5 text-indigo-600" /> },
    { text: "QA testing is like being a detective, but the culprit is always 'undefined'!", icon: <Lightbulb className="h-5 w-5 text-amber-500" /> },
    { text: "Ready to debug this survey? Just kidding, we already did that... we think.", icon: <CheckCircle2 className="h-5 w-5 text-green-600" /> },
  ];
  
  const middleMessages = [
    { text: "Halfway there! If this were a bug, you'd have already found it.", icon: <ThumbsUp className="h-5 w-5 text-blue-600" /> },
    { text: "Keep going! Every good tester needs coffee to find those edge cases.", icon: <Coffee className="h-5 w-5 text-amber-700" /> },
    { text: "You're debugging this assessment like a pro! No infinite loops here.", icon: <Brain className="h-5 w-5 text-purple-600" /> },
  ];
  
  const lateMessages = [
    { text: "Almost done! Your debugging powers are impressive!", icon: <Trophy className="h-5 w-5 text-amber-600" /> },
    { text: "You've made it this far without encountering a 404. Congratulations!", icon: <CheckCircle2 className="h-5 w-5 text-green-600" /> },
    { text: "The finish line is near. We promise there are no surprise NPEs ahead.", icon: <ThumbsUp className="h-5 w-5 text-blue-600" /> },
  ];
  
  useEffect(() => {
    let messageArray;
    
    if (progress < 33) {
      messageArray = earlyMessages;
    } else if (progress < 66) {
      messageArray = middleMessages;
    } else {
      messageArray = lateMessages;
    }
    
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];
    setMessage(randomMessage.text);
    setIcon(randomMessage.icon);
  }, [progress]);
  
  return (
    <div className="bg-white border border-indigo-100 rounded-lg p-4 my-4 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    </div>
  );
} 