import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calculator, LineChart, Award } from 'lucide-react';

interface OnboardingLoadingProps {
  onComplete: () => void;
}

export function OnboardingLoading({ onComplete }: OnboardingLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Calculator, text: "מעבד את הציונים שלך", color: "text-purple-600" },
    { icon: LineChart, text: "מחשב ממוצעים", color: "text-blue-600" },
    { icon: Award, text: "מכין תובנות אישיות", color: "text-green-600" },
    { icon: Sparkles, text: "מסיים את ההכנות", color: "text-orange-600" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        
        // Update current step based on progress
        const newProgress = prev + (100 / 30); // 3 seconds
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(Math.min(stepIndex, steps.length - 1));
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center space-y-8 max-w-md mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Spinner with Current Step Icon */}
        <motion.div 
          className="relative"
          variants={itemVariants}
        >
          {/* Outer spinning circle */}
          <motion.div 
            className="w-32 h-32 border-8 border-gray-200 rounded-full mx-auto relative"
            variants={spinnerVariants}
            animate="animate"
          >
            <div 
              className="absolute top-0 left-0 w-32 h-32 border-8 border-transparent border-t-purple-600 border-r-purple-600 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, #9333ea ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`
              }}
            ></div>
          </motion.div>
          
          {/* Center icon */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            key={currentStep}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CurrentIcon className={`w-8 h-8 ${steps[currentStep].color}`} />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Step Information */}
        <motion.div 
          className="space-y-4"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            key={`title-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            מכין את הציונים שלך...
          </motion.h2>
          
          <motion.p 
            className="text-gray-600"
            key={`text-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {steps[currentStep].text}
          </motion.p>
        </motion.div>
        
        {/* Progress Bar */}
        <motion.div 
          className="w-64 mx-auto"
          variants={itemVariants}
        >
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <motion.div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-100 ease-linear shadow-sm"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            ></motion.div>
          </div>
          <motion.p 
            className="text-sm text-gray-500 mt-2 font-medium"
            variants={itemVariants}
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        {/* Step Indicators */}
        <motion.div 
          className="flex justify-center space-x-2 space-x-reverse"
          variants={itemVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-purple-600 shadow-md' 
                  : 'bg-gray-300'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
