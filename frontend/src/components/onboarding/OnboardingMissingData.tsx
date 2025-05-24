import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingMissingDataProps {
  onEditMissingData: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function OnboardingMissingData({ onEditMissingData, onSkip, onBack }: OnboardingMissingDataProps) {
  const isMobile = useIsMobile();

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

  const iconVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.95 }
  };

  const content = (
    <motion.div 
      className="text-center space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner"
        variants={iconVariants}
      >
        <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
      </motion.div>
      
      <motion.h1 
        className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
        variants={itemVariants}
      >
        מידע חסר
      </motion.h1>
      
      <motion.div className="space-y-3 sm:space-y-4 text-right max-w-md mx-auto" variants={itemVariants}>
        <motion.p 
          className="text-gray-600 leading-relaxed text-sm sm:text-base"
          variants={itemVariants}
        >
          זיהינו שחלק מהציונים שלך עלולים להיות חסרים במערכת משרד החינוך. 
          זה קורה לפעמים כאשר מורים לא חושפים את כל הציונים לתלמידים.
        </motion.p>
        
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-200 shadow-sm"
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.08)" }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-blue-800 text-xs sm:text-sm">
            <strong>למה זה חשוב?</strong><br />
            כדי לחשב ממוצע מדוייק, המשקלים של כל המרכיבים במקצוע צריכים להסתכם ל-100%. 
            כאשר יש מידע חסר, הממוצע עלול להיות לא מדוייק.
          </p>
        </motion.div>
        
        <motion.p 
          className="text-gray-600 text-xs sm:text-sm"
          variants={itemVariants}
        >
          תוכל תמיד לחזור ולערוך את המידע החסר מהדאשבורד הראשי
        </motion.p>
      </motion.div>
      
      <motion.div className="space-y-3 pt-2 sm:pt-4" variants={itemVariants}>
        <Button 
          onClick={onEditMissingData} 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl text-sm sm:text-base" 
          size="lg"
        >
          עריכת מידע חסר
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
          </motion.span>
        </Button>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            חזרה
          </Button>
          <Button 
            variant="outline" 
            onClick={onSkip} 
            className="border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
          >
            דלג (חישוב ממוצע מוערך)
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const cardPaddingClass = isMobile ? "p-6" : "p-6 sm:p-8";

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-lg"
      >
        <Card className="border-0 shadow-xl overflow-hidden backdrop-blur-sm bg-white/80">
          <CardContent className={cardPaddingClass}>
            {content}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
