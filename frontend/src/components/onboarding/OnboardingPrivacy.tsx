import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Shield, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingPrivacyProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingPrivacy({ onNext, onBack }: OnboardingPrivacyProps) {
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

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  const privacyFeatures = [
    "אנחנו לא שומרים את הסיסמה שלך",
    "הציונים שלך בטוחים ומאובטחים",
    "אנחנו לא חולקים מידע עם צדדים שלישיים",
    "הגישה למידע מוגבלת רק אליך"
  ];

  const content = (
    <motion.div 
      className="text-center space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner"
        variants={iconVariants}
      >
        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
      </motion.div>
      
      <motion.h1 
        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
        variants={itemVariants}
      >
        אנחנו מכבדים את הפרטיות שלך
      </motion.h1>
      
      <motion.div className="space-y-3 sm:space-y-4 text-right max-w-md mx-auto" variants={itemVariants}>
        <motion.div 
          className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-lg border border-green-200 shadow-sm"
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.08)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.p 
            className="text-green-800 font-semibold mb-3 sm:mb-4 text-base sm:text-lg"
            variants={itemVariants}
          >
            אבטחת המידע שלך היא בעדיפות עליונה עבורנו:
          </motion.p>
          
          <ul className="space-y-2 sm:space-y-3">
            {privacyFeatures.map((feature, index) => (
              <motion.li 
                key={index}
                className="flex items-start p-2 bg-white/50 rounded-md"
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ x: 2, backgroundColor: "rgba(255, 255, 255, 0.7)" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-2 mt-0.5 flex-shrink-0" />
                </motion.div>
                <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        
      </motion.div>
      
      <motion.div 
        className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-2 sm:pt-4"
        variants={itemVariants}
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
          onClick={onNext}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
        >
          הבנתי, המשך
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );

  const cardPaddingClass = isMobile ? "p-6" : "p-6 sm:p-8";

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4"
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
