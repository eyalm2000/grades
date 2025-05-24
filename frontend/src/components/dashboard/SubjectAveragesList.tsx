import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailedSubjectAverage } from "@/types/grades";

interface SubjectAveragesListProps {
  detailedSubjectAverages: DetailedSubjectAverage[];
  onEditMissingData: () => void;
}

export function SubjectAveragesList({ 
  detailedSubjectAverages,
  onEditMissingData
}: SubjectAveragesListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const getAverageColor = (average: number, isUncalculateable: boolean) => {
    if (isUncalculateable) return "text-yellow-600";
    if (average >= 90) return "text-green-600";
    if (average >= 80) return "text-blue-600";
    if (average >= 70) return "text-orange-600";
    return "text-red-600";
  };

  // פונקציה נפרדת לבדיקה אם אין ציונים במחצית (ללא קשר לסטטוס מחושב)
  const hasNoGradesInPeriod1 = (subject: DetailedSubjectAverage) => {
    // אין ציונים אם המשקל 0 ולא מסומן כ-uncalculateable
    return subject.period1.totalWeight === 0 && !subject.period1.isUncalculateable;
  };

  const hasNoGradesInPeriod2 = (subject: DetailedSubjectAverage) => {
    // אין ציונים אם המשקל 0 ולא מסומן כ-uncalculateable
    return subject.period2.totalWeight === 0 && !subject.period2.isUncalculateable;
  };

  // זיהוי מקצועות שנלמדו רק במחצית אחת
  const isOnlyPeriod1 = (subject: DetailedSubjectAverage) => {
    // יש ציונים במחצית א' (משקל > 0 או uncalculateable) ואין ציונים במחצית ב'
    const hasGradesInPeriod1 = subject.period1.totalWeight > 0 || subject.period1.isUncalculateable;
    const hasGradesInPeriod2 = subject.period2.totalWeight > 0 || subject.period2.isUncalculateable;
    return hasGradesInPeriod1 && !hasGradesInPeriod2;
  };

  const isOnlyPeriod2 = (subject: DetailedSubjectAverage) => {
    // יש ציונים במחצית ב' (משקל > 0 או uncalculateable) ואין ציונים במחצית א'
    const hasGradesInPeriod1 = subject.period1.totalWeight > 0 || subject.period1.isUncalculateable;
    const hasGradesInPeriod2 = subject.period2.totalWeight > 0 || subject.period2.isUncalculateable;
    return hasGradesInPeriod2 && !hasGradesInPeriod1;
  };

  // מיון המקצועות: מקצועות עם מידע חסר אחרונים
  const sortedSubjects = [...detailedSubjectAverages].sort((a, b) => {
    const aHasMissingData = a.overall.hasMissingData || a.period1.hasMissingData || a.period2.hasMissingData;
    const bHasMissingData = b.overall.hasMissingData || b.period1.hasMissingData || b.period2.hasMissingData;
    
    // מקצועות ללא מידע חסר ראשונים
    if (!aHasMissingData && bHasMissingData) return -1;
    if (aHasMissingData && !bHasMissingData) return 1;
    
    // אם שני המקצועות עם או בלי מידע חסר, מיון לפי שם
    return a.subject.localeCompare(b.subject, 'he');
  });

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg sm:text-xl">ממוצעים לפי מקצוע</CardTitle>
            {sortedSubjects.some(s => s.overall.hasMissingData || s.period1.hasMissingData || s.period2.hasMissingData) && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={onEditMissingData}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-md text-white"
                >
                  עריכת מידע חסר
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedSubjects.map((subject, index) => (
              <motion.div 
                key={subject.subject}
                variants={itemVariants}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`p-4 rounded-xl shadow-sm border ${
                  isOnlyPeriod1(subject) ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' :
                  isOnlyPeriod2(subject) ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
                  'bg-gradient-to-r from-gray-50 to-blue-50 border-blue-50'
                }`}>
                  <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-x-reverse">
                      <h3 className="font-medium text-gray-900 text-base sm:text-lg">{subject.subject}</h3>
                      
                      {/* Container for badges to allow wrapping and spacing */}
                      <div className="flex flex-wrap gap-1">
                        {/* סימון מקצועות שנלמדו רק במחצית אחת */}
                      {isOnlyPeriod1(subject) && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-blue-100 text-blue-800 border-blue-300"
                        >
                          מחצית א׳ בלבד
                        </Badge>
                      )}
                      {isOnlyPeriod2(subject) && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-green-100 text-green-800 border-green-300"
                        >
                          מחצית ב׳ בלבד
                        </Badge>
                      )}
                      
                      {subject.overall.isUncalculateable && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          לא מחושב
                        </Badge>
                      )}
                      {(subject.overall.hasMissingData || subject.period1.hasMissingData || subject.period2.hasMissingData) && !subject.overall.isUncalculateable && (
                        <Badge 
                          variant="destructive" 
                          className="text-xs"
                        >
                          מידע חסר
                        </Badge>
                      )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:space-x-4 md:space-x-6">
                      {/* Period 1 */}
                      <div className="text-start sm:text-center">
                        <div className="text-sm text-gray-500 mb-1">מחצית א׳</div>
                        <div className={`text-base sm:text-lg font-bold ${getAverageColor(subject.period1.average, subject.period1.isUncalculateable)}`}>
                          {hasNoGradesInPeriod1(subject) ? "—" : 
                           subject.period1.isUncalculateable ? "—" : 
                           subject.period1.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {hasNoGradesInPeriod1(subject) ? "—" : `${subject.period1.totalWeight}%`}
                        </div>
                        {subject.period1.isUncalculateable && !hasNoGradesInPeriod1(subject) && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                          >
                            לא מחושב
                          </Badge>
                        )}
                      </div>
                      
                      {/* Period 2 */}
                      <div className="text-start sm:text-center">
                        <div className="text-sm text-gray-500 mb-1">מחצית ב׳</div>
                        <div className={`text-base sm:text-lg font-bold ${getAverageColor(subject.period2.average, subject.period2.isUncalculateable)}`}>
                          {hasNoGradesInPeriod2(subject) ? "—" : 
                           subject.period2.isUncalculateable ? "—" : 
                           subject.period2.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {hasNoGradesInPeriod2(subject) ? "—" : `${subject.period2.totalWeight}%`}
                        </div>
                        {subject.period2.isUncalculateable && !hasNoGradesInPeriod2(subject) && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                          >
                            לא מחושב
                          </Badge>
                        )}
                      </div>
                      
                      {/* Overall Average */}
                      <div className="text-start sm:text-center">
                        <div className="text-sm text-gray-500 mb-1">כללי</div>
                        <div className={`text-xl sm:text-2xl font-bold ${getAverageColor(subject.overall.average, subject.overall.isUncalculateable)}`}>
                          {subject.overall.isUncalculateable ? "—" : subject.overall.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mb-1 mt-0.5 sm:mt-0">
                          {subject.overall.totalWeight}/200
                        </div>
                        {subject.overall.isUncalculateable && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                          >
                            לא מחושב
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {sortedSubjects.some(s => s.overall.hasMissingData || s.period1.hasMissingData || s.period2.hasMissingData) && (
            <motion.div 
              className="mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-800 mb-3 text-sm sm:text-base">
                זוהו מקצועות עם מידע חסר. לחישוב ממוצע מדוייק יותר, מומלץ להשלים את המידע החסר.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
