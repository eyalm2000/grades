
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
  onEditMissingData: () => void;
  onLogout: () => void;
}

export function ProfilePage({ onBack, onEditMissingData, onLogout }: ProfilePageProps) {
  const { user, userImage } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              חזרה לדאשבורד
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">פרטים אישיים</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי המשתמש</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6 space-x-reverse mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userImage || ''} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-600">כיתה {user.classCode}{user.classNumber}</p>
                  <p className="text-gray-600">{user.schoolName}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">שם מלא</label>
                  <p className="text-gray-900">{user.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">מספר תלמיד</label>
                  <p className="text-gray-900">{user.studentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">טלפון</label>
                  <p className="text-gray-900">{user.cellphone || 'לא צוין'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">אימייל</label>
                  <p className="text-gray-900">{user.studentEmail || 'לא צוין'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">כניסה אחרונה</label>
                  <p className="text-gray-900">
                    {new Date(user.lastLoginDate).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">מוסד</label>
                  <p className="text-gray-900">{user.institutionCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>פעולות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                onClick={onEditMissingData}
                className="w-full justify-start"
              >
                עריכת מידע חסר
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={onLogout}
                className="w-full justify-start"
              >
                התנתקות מהמערכת
              </Button>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>מידע מערכת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• המערכת מתחברת לשרתי משהב לקבלת נתוני הציונים</p>
                <p>• הנתונים מעודכנים בזמן אמת מהמערכת הרשמית</p>
                <p>• המידע שלך מוגן ומוצפן ברמה הגבוהה ביותר</p>
                <p>• אנחנו לא שומרים סיסמאות או מידע רגיש אחר</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
