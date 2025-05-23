
import { useEffect, useState } from 'react';

interface OnboardingLoadingProps {
  onComplete: () => void;
}

export function OnboardingLoading({ onComplete }: OnboardingLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + (100 / 30); // 3 seconds
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 border-8 border-gray-200 rounded-full"></div>
          <div 
            className="absolute top-0 left-0 w-32 h-32 border-8 border-purple-600 rounded-full animate-spin"
            style={{
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent'
            }}
          ></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            מכין את הציונים שלך...
          </h2>
          <p className="text-gray-600">
            אנחנו מעבדים את המידע ומכינים עבורך את הדאשבורד האישי
          </p>
          
          <div className="w-64 mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
