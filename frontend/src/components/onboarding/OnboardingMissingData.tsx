
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
        staggerChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.95 }
  };

  const content = (
    <motion.div 
      className="text-center space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner"
        variants={iconVariants}
      >
        <AlertTriangle className="w-12 h-12 text-red-600" />
      </motion.div>
      
      <motion.h1 
        className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
        variants={itemVariants}
      >
        מידע חסר
      </motion.h1>
      
      <motion.div className="space-y-4 text-right max-w-md mx-auto" variants={itemVariants}>
        <motion.p 
          className="text-gray-600 leading-relaxed"
          variants={itemVariants}
        >
          זיהינו שחלק מהציונים שלך עלולים להיות חסרים במערכת משהב. 
          זה קורה לפעמים כאשר מורים לא חושפים את כל הציונים לתלמידים.
        </motion.p>
        
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <p className="text-blue-800 text-sm">
            <strong>למה זה חשוב?</strong><br />
            כדי לחשב ממוצע מדוייק, המשקלים של כל המרכיבים במקצוע צריכים להסתכם ל-100%. 
            כאשר יש מידע חסר, הממוצע עלול להיות לא מדוייק.
          </p>
        </motion.div>
        
        <motion.p 
          className="text-gray-600 text-sm"
          variants={itemVariants}
        >
          תוכל תמיד לחזור ולערוך את המידע החסר מהדאשבורד הראשי
        </motion.p>
      </motion.div>
      
      <motion.div className="space-y-3" variants={itemVariants}>
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button 
            onClick={onEditMissingData} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all" 
            size="lg"
          >
            עריכת מידע חסר
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
            </motion.span>
          </Button>
        </motion.div>
        
        <motion.div 
          className="flex justify-center space-x-4 space-x-reverse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={onBack} className="border-gray-300">
              <ArrowRight className="w-4 h-4 ml-1" />
              חזרה
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={onSkip} className="border-gray-300">
              דלג (חישוב ממוצע מוערך)
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  if (isMobile) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {content}
      </motion.div>
    );
  }

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
      >
        <Card className="w-full max-w-lg border-0 shadow-xl overflow-hidden backdrop-blur-sm bg-white/80">
          <CardContent className="p-8">
            {content}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
