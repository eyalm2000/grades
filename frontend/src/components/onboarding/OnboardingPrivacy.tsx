
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface OnboardingPrivacyProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingPrivacy({ onNext, onBack }: OnboardingPrivacyProps) {
  const isMobile = useIsMobile();

  const content = (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900">
        אנחנו מכבדים את הפרטיות שלך
      </h1>
      
      <div className="space-y-4 text-right max-w-md mx-auto">
        <p className="text-gray-600 leading-relaxed">
          <strong>אבטחת המידע שלך היא בעדיפות עליונה עבורנו:</strong>
        </p>
        
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 ml-2">✓</span>
            אנחנו לא שומרים את הסיסמה שלך
          </li>
          <li className="flex items-start">
            <span className="text-green-500 ml-2">✓</span>
            הציונים שלך מוצפנים ומאובטחים
          </li>
          <li className="flex items-start">
            <span className="text-green-500 ml-2">✓</span>
            אנחנו לא חולקים מידע עם צדדים שלישיים
          </li>
          <li className="flex items-start">
            <span className="text-green-500 ml-2">✓</span>
            הגישה למידע מוגבלת רק אליך
          </li>
        </ul>
        
        <p className="text-sm text-gray-500 mt-4">
          המערכת פועלת באותן רמות אבטחה כמו משהב ובהתאם לתקנות הגנת הפרטיות
        </p>
      </div>
      
      <div className="flex justify-center space-x-4 space-x-reverse pt-4">
        <Button variant="outline" onClick={onBack}>
          חזרה
        </Button>
        <Button onClick={onNext}>
          הבנתי, המשך
        </Button>
      </div>
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
