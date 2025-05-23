
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectAverage, Period } from "@/types/grades";

interface SubjectAveragesListProps {
  subjectAverages: SubjectAverage[];
  selectedPeriod: Period;
  onPeriodChange: (value: Period) => void;
  onEditMissingData: () => void;
}

export function SubjectAveragesList({ 
  subjectAverages, 
  selectedPeriod, 
  onPeriodChange,
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

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ממוצעים לפי מקצוע</CardTitle>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Select value={selectedPeriod} onValueChange={(value: Period) => onPeriodChange(value)}>
                <SelectTrigger className="w-48 bg-white border-purple-200 hover:border-purple-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">שתי המחציות</SelectItem>
                  <SelectItem value="period1">מחצית א׳</SelectItem>
                  <SelectItem value="period2">מחצית ב׳</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {subjectAverages.map((subject, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm border border-blue-50">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <h3 className="font-medium text-gray-900">{subject.subject}</h3>
                    {subject.hasMissingData && (
                      <Badge 
                        variant="destructive" 
                        className="text-xs"
                      >
                        מידע חסר
                      </Badge>
                    )}
                  </div>
                  <div className="text-left">
                    <motion.div 
                      className="text-xl font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {subject.average.toFixed(1)}
                    </motion.div>
                    {subject.hasMissingData && (
                      <div className="text-xs text-gray-500">
                        משקל: {subject.totalWeight}%
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {subjectAverages.some(s => s.hasMissingData) && (
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
