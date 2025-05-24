import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingWelcomeProps {
  userImage: string | null;
  firstName: string;
  onNext: () => void;
}

export function OnboardingWelcome({ userImage, firstName, onNext }: OnboardingWelcomeProps) {
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

  const imageVariants = {
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
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    },
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
        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6"
        variants={imageVariants}
      >
        {userImage ? (
          <motion.img 
            src={userImage} 
            alt="תמונת פרופיל" 
            className="w-full h-full rounded-full object-cover border-4 border-purple-200 shadow-lg"
            whileHover={{ scale: 1.02, borderColor: "#a855f7" }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <motion.div 
            className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {firstName.charAt(0)}
          </motion.div>
        )}
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <motion.h1 
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          היי, {firstName}!
        </motion.h1>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-purple-200 shadow-sm"
        variants={itemVariants}
        whileHover={{ y: -2, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.08)" }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="flex items-center justify-center mb-3 sm:mb-4"
          variants={itemVariants}
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
          <span className="font-semibold text-purple-800 mr-2 text-base sm:text-lg">ברוך הבא ל-GradeWiz!</span>
        </motion.div>
        
        <motion.p 
          className="text-gray-700 max-w-md mx-auto leading-relaxed text-sm sm:text-base"
          variants={itemVariants}
        >
          אנחנו כאן כדי לעזור לך לנהל את הציונים שלך בצורה החכמה והקלה ביותר.
          בואו נתחיל בהכנת המערכת במיוחד עבורך.
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-indigo-200 shadow-sm"
        variants={itemVariants}
        whileHover={{ y: -2, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.08)" }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-indigo-800 text-xs sm:text-sm">
          <strong>מה נעשה יחד?</strong><br />
          נגדיר את הגדרות הפרטיות, נבדוק את הציונים שלך ונכין לך דאשבורד אישי מותאם במיוחד עבורך
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="pt-2 sm:pt-4">
        <Button 
          onClick={onNext} 
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 sm:px-8 py-3 sm:py-auto text-base sm:text-lg shadow-lg text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
        >
          בואו נתחיל!
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );

  // The isMobile hook handles specific padding for mobile.
  // For desktop, we can make the padding responsive as well.
  const cardPaddingClass = isMobile ? "p-6" : "p-6 sm:p-8";

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-lg" // Ensure max-w is applied here for desktop too
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
