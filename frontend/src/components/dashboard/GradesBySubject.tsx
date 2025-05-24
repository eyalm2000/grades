import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grade, CustomGrade } from "@/types/grades";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getUncalculateableSubjects, isSubjectCalculateable } from "@/utils/gradeUtils";

interface GradesBySubjectProps {
  grades: Grade[];
  customGrades: Record<string, CustomGrade[]>;
}

export function GradesBySubject({ grades, customGrades }: GradesBySubjectProps) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Get uncalculateable subjects
  const uncalculateableSubjects = getUncalculateableSubjects(grades);

  // Group grades by subject
  const subjectGrades: Record<string, (Grade | CustomGrade)[]> = {};
  
  // Add regular grades to their subjects
  grades.forEach(grade => {
    if (!subjectGrades[grade.subject]) {
      subjectGrades[grade.subject] = [];
    }
    subjectGrades[grade.subject].push(grade);
  });
  
  // Add custom grades to their subjects
  Object.entries(customGrades).forEach(([subject, grades]) => {
    if (!subjectGrades[subject]) {
      subjectGrades[subject] = [];
    }
    subjectGrades[subject].push(...grades);
  });
  
  // Sort subjects alphabetically
  const sortedSubjects = Object.keys(subjectGrades).sort();

  // Simple animation variants with minimal motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const toggleSubject = (subject: string) => {
    if (expandedSubject === subject) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subject);
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>כל הציונים לפי מקצוע</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedSubjects.map((subject) => (
              <motion.div 
                key={subject}
                variants={itemVariants}
                className="overflow-hidden"
              >
                <div 
                  className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => toggleSubject(subject)}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <h3 className="font-medium text-gray-900">{subject}</h3>
                    {(() => {
                      // Check if this subject is uncalculateable in any period
                      const subjectIsUncalculateable = subjectGrades[subject].some((grade) => {
                        if ('period_id' in grade && grade.period_id) {
                          return !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects);
                        }
                        return false;
                      });
                      
                      return subjectIsUncalculateable && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          לא מחושב
                        </Badge>
                      );
                    })()}
                  </div>
                  {expandedSubject === subject ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                {expandedSubject === subject && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 p-2"
                  >
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-right pb-2">כותרת</th>
                            <th className="text-right pb-2">ציון</th>
                            <th className="text-right pb-2">משקל</th>
                            <th className="text-right pb-2">סוג</th>
                            <th className="text-right pb-2">מחצית</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectGrades[subject]
                            .sort((a, b) => {
                              if (a.period_id !== b.period_id) return a.period_id - b.period_id;
                              if ('typeCode' in a && 'typeCode' in b) {
                                if (a.typeCode !== b.typeCode) return a.typeCode - b.typeCode;
                              }
                              return b.grade - a.grade;
                            })
                            .map((grade, index) => (
                              <tr key={index} className="border-b border-gray-50 last:border-0">
                                <td className="py-2">
                                  {grade.title}
                                </td>
                                <td className="py-2 font-medium">
                                  {grade.grade}
                                </td>
                                <td className="py-2">
                                  {grade.weight}%
                                </td>
                                <td className="py-2">
                                  {grade.type}
                                </td>
                                <td className="py-2">
                                  {grade.period_id === 1538 ? 'א׳' : grade.period_id === 1539 ? 'ב׳' : ''}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
