import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { UncalculateableSubject } from '@/types/grades';
import { Calculator, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingUncalculateableProps {
    uncalculateableSubjects: UncalculateableSubject[];
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingUncalculateable({ uncalculateableSubjects, onNext, onBack }: OnboardingUncalculateableProps) {
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
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner"
                variants={iconVariants}
            >
                <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
            </motion.div>
            
            <motion.h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                variants={itemVariants}
            >
                לא ניתן לחשב ציונים עבור המקצועות הבאים
            </motion.h1>
            
            <motion.div className="space-y-3 sm:space-y-4 text-right max-w-md mx-auto" variants={itemVariants}>
                <motion.div 
                    className="bg-gradient-to-r from-orange-50 to-red-50 p-3 sm:p-4 rounded-lg border border-orange-200 shadow-sm"
                    variants={itemVariants}
                    whileHover={{ y: -2, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.08)" }}
                    transition={{ duration: 0.2 }}
                >
                    <ul className="space-y-2 text-orange-800">
                        {uncalculateableSubjects.map((item, index) => (
                            <motion.li 
                                key={index}
                                className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0 p-2 bg-white/50 rounded-md"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                            >
                                <span className="font-medium text-sm sm:text-base">{item.subject}</span>
                                <span className="text-xs sm:text-sm bg-orange-200 px-2 py-1 rounded-full">
                                    מחצית {item.period}
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
                
                <motion.p 
                    className="text-gray-600 leading-relaxed text-sm sm:text-base"
                    variants={itemVariants}
                >
                    מורים של מקצועות אלו לא הכניסו את האחוז של כל אירוע הערכה, ולכן לא ניתן לחשב את הציון הסופי.
                </motion.p>
                
                <motion.div 
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-200 shadow-sm"
                    variants={itemVariants}
                    whileHover={{ y: -2, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.08)" }}
                    transition={{ duration: 0.2 }}
                >
                    <p className="text-blue-800 text-xs sm:text-sm">
                        <strong>מה זה אומר?</strong><br />
                        לא ניתן לחשב את הציונים עבור מקצועות אלה בכלל, כי המורים לא חשפו את נתוני האחוזים של האירועים הערכתים.
                    </p>
                </motion.div>
                
                <motion.p 
                    className="text-gray-600 text-xs sm:text-sm"
                    variants={itemVariants}
                >
                    אל דאגה - במקצועות אחרים הציונים יחושבו בצורה מדוייקת. יהיה ניתן להכניס את האחוזים של המקצועות הללו בצורה ידנית בשלב הבא.
                </motion.p>
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
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
                >
                    המשך
                    <motion.span
                        initial={{ x: 0 }}
                        animate={{ x: [-1, 1, -1] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
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
            className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center p-4"
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