
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader, KeyRound, LogIn, User, Lock, AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react'; // Added icons
import { useIsMobile } from '@/hooks/use-mobile';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setProgress(0);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 15); // 15 seconds total
      });
    }, 1000);

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('שם משתמש או סיסמה שגויים');
      }
    } catch (err: any) {
      if (err.message.includes('Invalid username or password')) {
        setError('שם משתמש או סיסמה שגויים');
      } else if (err.message.includes('Teacher account detected')) {
        setError('זוהה חשבון מורה - המערכת מיועדת לתלמידים בלבד');
      } else if (err.message.includes('Unsupported school')) {
        setError('בית הספר לא נתמך במערכת');
      } else {
        setError('שגיאה בהתחברות - אנא נסה שוב');
      }
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setProgress(0);
    }
  };

  const faqItems = [
    {
      question: "האם המידע שלי מאובטח?",
      answer: "כן, אנחנו משתמשים באותן שיטות הצפנה וגישות אבטחה כמו משרד החינוך. המידע שלך מוגן ברמה הגבוהה ביותר ולא נשמר על השרתים שלנו."
    },
    {
      question: "איך המערכת מחשבת את הממוצעים?",
      answer: "המערכת מחשבת ממוצעים משוכללים על פי המשקלים של כל מרכיב הערכה, בדיוק כפי שמחשב משרד החינוך. אנחנו מזהים גם מידע חסר ומאפשרים השלמה ידנית."
    },
    {
      question: "מה קורה אם יש לי ציונים חסרים?",
      answer: "המערכת מזהה ציונים חסרים ומאפשרת לך להשלים אותם ידנית. כך תוכל לקבל ממוצע מדוייק יותר ולתכנן את הלימודים שלך בהתאם."
    },
    {
      question: "האם יש עלות לשימוש במערכת?",
      answer: "השימוש במערכת חינמי לחלוטין לכל תלמידי חטב ליאו בק. אנחנו מציעים את השירות כדי לעזור לתלמידים לנהל טוב יותר את הלימודים שלהם."
    },
    {
      question: "כמה זמן לוקח להתחבר למערכת?",
      answer: "תהליך ההתחברות יכול לקחת עד 15 שניות בשל הצורך להתחבר לשרתי משרד החינוך ולוודא את הזהות שלך. זה נורמלי ובטוח לחלוטין."
    }
  ];

  const FAQSection = () => (
    <Card className="h-fit shadow-xl rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-slate-200 dark:border-slate-700">
      <CardHeader className="p-5 sm:p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-gray-800 dark:text-gray-100">
           <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
           שאלות נפוצות
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pt-1">
          מענה לשאלות הנפוצות ביותר
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 md:p-8">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-slate-200 dark:border-slate-700 last:border-b-0">
              <AccordionTrigger className="text-right text-sm sm:text-base py-3 sm:py-4 font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:no-underline transition-colors duration-200">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-right text-gray-600 dark:text-gray-400 text-sm sm:text-base pb-3 sm:pb-4 pt-1">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 py-8 sm:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-10 text-center">
            <Button variant="ghost" onClick={onBack} className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary group transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 ml-1 sm:ml-2 group-hover:-translate-x-1 transition-transform duration-200" /> {/* Updated icon and added animation */}
              חזרה לדף הבית
            </Button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 dark:to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3">כניסה למערכת</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">השתמש בפרטי הכניסה שלך למשרד החינוך</p>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start`}>
            {/* Login Form */}
            <Card className="w-full shadow-xl rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-slate-200 dark:border-slate-700">
              <CardHeader className="p-5 sm:p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-gray-800 dark:text-gray-100">
                  <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  כניסה לחשבון
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pt-1">
                  הזן את פרטי הכניסה שלך למשרד החינוך כדי לגשת למערכת
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="relative">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">שם משתמש</Label>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="הזן שם משתמש"
                      required
                      disabled={isLoading}
                      className="text-right pl-10 pr-3 py-2.5 text-sm sm:text-base h-11 sm:h-12 border-gray-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary hover:border-primary/70 dark:hover:border-primary/70 dark:bg-slate-700 dark:text-gray-50 rounded-md"
                    />
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="password"className="text-sm font-medium text-gray-700 dark:text-gray-300">סיסמה</Label>
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="הזן סיסמה"
                      required
                      disabled={isLoading}
                      className="text-right pl-10 pr-3 py-2.5 text-sm sm:text-base h-11 sm:h-12 border-gray-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary hover:border-primary/70 dark:hover:border-primary/70 dark:bg-slate-700 dark:text-gray-50 rounded-md"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full text-base sm:text-lg py-3 h-12 sm:h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white dark:text-gray-50 shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02]" 
                    disabled={isLoading || !username || !password}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>מתחבר...</span>
                      </div>
                    ) : (
                      'כניסה למערכת'
                    )}
                  </Button>

                  {isLoading && (
                    <div className="space-y-2 pt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        הכניסה יכולה לקחת עד 15 שניות
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-primary to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            {isMobile ? 
              <FAQSection /> // Use the styled FAQSection directly
             : 
              <FAQSection />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
