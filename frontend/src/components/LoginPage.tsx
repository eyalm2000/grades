
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader } from 'lucide-react';
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
      answer: "כן, אנחנו משתמשים באותן שיטות הצפנה וגישות אבטחה כמו משהב. המידע שלך מוגן ברמה הגבוהה ביותר ולא נשמר על השרתים שלנו."
    },
    {
      question: "איך המערכת מחשבת את הממוצעים?",
      answer: "המערכת מחשבת ממוצעים משוכללים על פי המשקלים של כל מרכיב הערכה, בדיוק כפי שמחשב משהב. אנחנו מזהים גם מידע חסר ומאפשרים השלמה ידנית."
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
      answer: "תהליך ההתחברות יכול לקחת עד 15 שניות בשל הצורך להתחבר לשרתי משהב ולוודא את הזהות שלך. זה נורמלי ובטוח לחלוטין."
    }
  ];

  const FAQSection = () => (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>שאלות נפוצות</CardTitle>
        <CardDescription>מענה לשאלות הנפוצות ביותר</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-right">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-right text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              ← חזרה לדף הבית
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">כניסה למערכת</h1>
            <p className="text-gray-600">השתמש בפרטי הכניסה שלך למשהב</p>
          </div>

          <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} items-start`}>
            {/* Login Form */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>כניסה לחשבון</CardTitle>
                <CardDescription>
                  הזן את פרטי הכניסה שלך למשהב כדי לגשת למערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">שם משתמש</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="הזן שם משתמש"
                      required
                      disabled={isLoading}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">סיסמה</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="הזן סיסמה"
                      required
                      disabled={isLoading}
                      className="text-right"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !username || !password}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>מתחבר...</span>
                      </div>
                    ) : (
                      'כניסה למערכת'
                    )}
                  </Button>

                  {isLoading && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 text-center">
                        הכניסה יכולה לקחת עד 15 שניות
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            {isMobile ? (
              <Card>
                <CardHeader>
                  <CardTitle>שאלות נפוצות</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-right">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-right text-gray-600">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <FAQSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
