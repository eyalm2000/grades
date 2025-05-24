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

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>ממוצעים לפי מקצוע</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {detailedSubjectAverages.map((subject, index) => (
              <motion.div 
                key={subject.subject}
                variants={itemVariants}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm border border-blue-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h3 className="font-medium text-gray-900">{subject.subject}</h3>
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
                    <div className="flex items-center space-x-6 space-x-reverse">
                      {/* Period 1 */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">מחצית א׳</div>
                        <div className={`text-lg font-bold ${getAverageColor(subject.period1.average, subject.period1.isUncalculateable)}`}>
                          {subject.period1.isUncalculateable ? "—" : subject.period1.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subject.period1.totalWeight}%
                        </div>
                      </div>
                      
                      {/* Period 2 */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">מחצית ב׳</div>
                        <div className={`text-lg font-bold ${getAverageColor(subject.period2.average, subject.period2.isUncalculateable)}`}>
                          {subject.period2.isUncalculateable ? "—" : subject.period2.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subject.period2.totalWeight}%
                        </div>
                      </div>
                      
                      {/* Overall Average */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">כללי</div>
                        <div className={`text-2xl font-bold ${getAverageColor(subject.overall.average, subject.overall.isUncalculateable)}`}>
                          {subject.overall.isUncalculateable ? "—" : subject.overall.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subject.overall.totalWeight}/200
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {detailedSubjectAverages.some(s => s.overall.hasMissingData || s.period1.hasMissingData || s.period2.hasMissingData) && (
            <motion.div 
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-800 mb-3">
                זוהו מקצועות עם מידע חסר. לחישוב ממוצע מדוייק יותר, מומלץ להשלים את המידע החסר.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="default" 
                  onClick={onEditMissingData}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-md text-white"
                >
                  עריכת מידע חסר
                </Button>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
