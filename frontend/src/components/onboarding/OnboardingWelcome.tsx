
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface OnboardingWelcomeProps {
  userImage: string | null;
  firstName: string;
  onNext: () => void;
}

export function OnboardingWelcome({ userImage, firstName, onNext }: OnboardingWelcomeProps) {
  const isMobile = useIsMobile();

  const content = (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto mb-6">
        {userImage ? (
          <img 
            src={userImage} 
            alt="תמונת פרופיל" 
            className="w-full h-full rounded-full object-cover border-4 border-purple-200"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
            {firstName.charAt(0)}
          </div>
        )}
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900">
        היי, {firstName}! 👋
      </h1>
      
      <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
        ברוך הבא לGradeWiz! אנחנו כאן כדי לעזור לך לנהל את הציונים שלך בצורה החכמה והקלה ביותר.
        בואו נתחיל בהכנת המערכת במיוחד עבורך.
      </p>
      
      <Button onClick={onNext} size="lg" className="px-8">
        בואו נתחיל!
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    </div>
  );
}
