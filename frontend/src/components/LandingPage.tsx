
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, LineChart, Calculator, Award, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'ניהול ציונים חכם',
      description: 'עקוב אחר הציונים שלך ברמת הפירוט הגבוהה ביותר',
      icon: <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />,
      demo: (
        <Card className="w-full max-w-md mx-auto card-hover shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-base sm:text-lg">מתמטיקה - מחצית א׳</CardTitle>
            <CardDescription className="text-sm">ממוצע נוכחי: 92</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span>מבחן חודשי</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">95</Badge>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span>עבודת בית</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">88</Badge>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span>השתתפות</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">100</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      title: 'תובנות מתקדמות',
      description: 'קבל תובנות חכמות על הביצועים שלך והתקדמות לאורך זמן',
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />,
      demo: (
        <Card className="w-full max-w-md mx-auto card-hover shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-base sm:text-lg">תובנות שלך</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 transform transition-all hover:scale-105 hover:shadow-md">
                <p className="text-green-800 font-medium flex items-center text-sm sm:text-base"><Award className="w-4 h-4 sm:w-5 sm:h-5 ml-1" /> המקצוע המוביל שלך: פיזיקה (96)</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 transform transition-all hover:scale-105 hover:shadow-md">
                <p className="text-blue-800 font-medium flex items-center text-sm sm:text-base"><LineChart className="w-4 h-4 sm:w-5 sm:h-5 ml-1" /> השיפור הגדול ביותר: כימיה (+12 נקודות)</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-lg border border-purple-200 transform transition-all hover:scale-105 hover:shadow-md">
                <p className="text-purple-800 font-medium flex items-center text-sm sm:text-base"><Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-1" /> זכאי לתעודת הצטיינות!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      title: 'חישוב ממוצעים מדוייק',
      description: 'חישוב ממוצעים משוכללים לפי משקלים וזיהוי מידע חסר',
      icon: <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
      demo: (
        <Card className="w-full max-w-md mx-auto card-hover shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-base sm:text-lg">ממוצע כללי</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">94.2</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 transform transition-all hover:scale-105 hover:shadow-md">
                  <div className="font-medium text-xs sm:text-sm">מחצית א׳</div>
                  <div className="text-lg sm:text-xl font-bold text-blue-800">93.8</div>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border border-purple-100 transform transition-all hover:scale-105 hover:shadow-md">
                  <div className="font-medium text-xs sm:text-sm">מחצית ב׳</div>
                  <div className="text-lg sm:text-xl font-bold text-purple-800">94.6</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      title: 'ממשק ידידותי למשתמש',
      description: 'עיצוב מודרני ואינטואיטיבי המותאם במיוחד לתלמידים ישראליים',
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />,
      demo: (
        <Card className="w-full max-w-md mx-auto card-hover shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-base sm:text-lg">פרופיל אישי</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                א.מ
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">אייל מירום</h3>
                <p className="text-gray-600 text-sm sm:text-base">כיתה ח׳4</p>
                <p className="text-gray-600 text-sm sm:text-base">חטב ליאו בק</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full animate-pulse-slow blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-pulse-slow delay-1000 blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full animate-pulse-slow delay-2000 blur-xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-28 md:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                GradeWiz
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              המערכת המתקדמת ביותר לניהול וניתוח ציונים לתלמידי חטב ליאו בק
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-white text-indigo-700 hover:bg-blue-50 px-6 py-4 text-base sm:px-8 sm:py-6 sm:text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              התחל עכשיו 
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 animate-pulse" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-2 px-4 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-0 text-sm">יתרונות</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4">
            למה לבחור בGradeWiz?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            אנחנו מביאים לך את הכלים המתקדמים ביותר לניהול ציונים, עם ממשק חכם ואינטואיטיבי
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Feature Selector */}
          <div className="space-y-3 sm:space-y-4">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-300 border-0 ${
                  activeFeature === index 
                    ? 'border-0 shadow-lg shadow-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50' 
                    : 'hover:shadow-md bg-white'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 space-x-reverse">
                    <div className={`p-2 sm:p-3 rounded-full ${
                      activeFeature === index 
                        ? 'bg-gradient-to-br from-indigo-100 to-purple-100' 
                        : 'bg-gray-100'
                    }`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Demo */}
          <div className="lg:pr-8">
            <div className="transition-all duration-500 transform hover:scale-105">
              {features[activeFeature].demo}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-12 sm:py-16 shadow-inner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-4 sm:p-6 rounded-xl hover:bg-white/5 transition-colors">
              <div className="text-4xl sm:text-5xl font-bold text-blue-300 mb-2 flex justify-center">100%</div>
              <div className="text-gray-300 text-base sm:text-lg">דיוק בחישוב ממוצעים</div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl hover:bg-white/5 transition-colors">
              <div className="text-4xl sm:text-5xl font-bold text-purple-300 mb-2 flex justify-center">⚡</div>
              <div className="text-gray-300 text-base sm:text-lg">עדכונים בזמן אמת</div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl hover:bg-white/5 transition-colors">
              <div className="text-4xl sm:text-5xl font-bold text-green-300 mb-2 flex justify-center">🔒</div>
              <div className="text-gray-300 text-base sm:text-lg">אבטחת מידע מתקדמת</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 sm:py-20 shadow-inner">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md">
            מוכן להתחיל את המסע שלך?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-200 mb-8">
            הצטרף עכשיו לאלפי תלמידים שכבר משתמשים בGradeWiz
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-indigo-700 hover:bg-blue-50 px-6 py-4 text-base sm:px-8 sm:py-6 sm:text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            כניסה למערכת
          </Button>
        </div>
      </div>
    </div>
  );
}
