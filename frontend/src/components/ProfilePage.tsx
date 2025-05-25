import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User, School, Phone, Mail, Calendar, Building, Settings, LogOut, Edit, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfilePageProps {
  onBack: () => void;
  onEditMissingData: () => void;
  onLogout: () => void;
}

export function ProfilePage({ onBack, onEditMissingData, onLogout }: ProfilePageProps) {
  const { user, userImage } = useAuth();

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Header */}
      <motion.div 
        className="bg-white/90 shadow-lg border-b backdrop-blur-md sticky top-0 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" onClick={onBack} className="hover:bg-purple-50 text-sm sm:text-base px-2 sm:px-3">
                  <ArrowLeft className="w-4 h-4 ml-1 sm:ml-2" />
                  חזרה לדאשבורד
                </Button>
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                  פרופיל אישי
                </h1>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm">נהל את הפרטים והעדפות שלך</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="container mx-auto px-2 sm:px-4 py-6 sm:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Profile Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-right sm:space-x-6 md:space-x-8 gap-4 sm:gap-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 border-white/30 shadow-xl">
                      <AvatarImage 
                        src={userImage || ''} 
                        className="object-cover object-center w-full h-full"
                        style={{ aspectRatio: '1/1' }}
                      />
                      <AvatarFallback className="text-3xl sm:text-4xl bg-white/20 text-white">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:gap-4 mb-2">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        {user.firstName} {user.lastName}
                      </h2>
                      <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                        <User className="w-3 h-3 mr-1" />
                        תלמיד
                      </Badge>
                    </div>
                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6 text-white/90 text-sm sm:text-base md:text-lg">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <School className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>כיתה {user.classCode}{user.classNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{user.schoolName}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-white/80 text-xs sm:text-sm">
                      <span>מספר תלמיד: {user.studentId}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Personal Details */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    פרטים אישיים
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1 sm:gap-2">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        שם מלא
                      </label>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        {user.fullName}
                      </p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1 sm:gap-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        טלפון
                      </label>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        {user.cellphone || 'לא צוין'}
                      </p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1 sm:gap-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        כתובת אימייל
                      </label>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        {user.studentEmail || 'לא צוין'}
                      </p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        כניסה אחרונה
                      </label>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        {new Date(user.lastLoginDate).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions Panel */}
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    פעולות
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      onClick={onEditMissingData}
                      className="w-full justify-start h-10 sm:h-12 hover:bg-blue-50 hover:border-blue-300 transition-all text-sm sm:text-base px-3"
                    >
                      <Edit className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      עריכת מידע חסר
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="destructive" 
                      onClick={onLogout}
                      className="w-full justify-start h-10 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all text-sm sm:text-base px-3"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      התנתקות מהמערכת
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>

              {/* School Info */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <School className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    פרטי מוסד
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-500">שם המוסד</label>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mt-0.5 sm:mt-1">{user.schoolName}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-500">קוד מוסד</label>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mt-0.5 sm:mt-1">{user.institutionCode}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* System Security Info */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-green-800">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                  אבטחה ופרטיות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <div>
                        <p className="font-medium text-green-800 text-sm sm:text-base">חיבור מאובטח</p>
                        <p className="text-xs sm:text-sm text-green-700">המערכת מתחברת לשרתי משרד החינוך בחיבור מוצפן</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <div>
                        <p className="font-medium text-green-800 text-sm sm:text-base">נתונים בזמן אמת</p>
                        <p className="text-xs sm:text-sm text-green-700">הציונים מתעדכנים אוטומטית מהמערכת הרשמית</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <div>
                        <p className="font-medium text-green-800 text-sm sm:text-base">הגנה על פרטיות</p>
                        <p className="text-xs sm:text-sm text-green-700">איננו שומרים סיסמאות או מידע רגיש</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <div>
                        <p className="font-medium text-green-800 text-sm sm:text-base">הצפנה מתקדמת</p>
                        <p className="text-xs sm:text-sm text-green-700">כל המידע מוגן ברמת האבטחה הגבוהה ביותר</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
