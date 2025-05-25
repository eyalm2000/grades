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
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">כל הציונים לפי מקצוע</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
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
                  <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{subject}</h3>
                    {(() => {
                      const subjectIsUncalculateable = subjectGrades[subject].some((grade) => {
                        if ('period_id' in grade && grade.period_id) {
                          return !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects);
                        }
                        return false;
                      });
                      
                      return subjectIsUncalculateable && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 px-1.5 py-0.5"
                        >
                          לא מחושב
                        </Badge>
                      );
                    })()}
                  </div>
                  {expandedSubject === subject ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  )}
                </div>
                
                {expandedSubject === subject && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 p-1 sm:p-2"
                  >
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-right pb-2 px-1 sm:px-2">כותרת</th>
                            <th className="text-right pb-2 px-1 sm:px-2">ציון</th>
                            <th className="text-right pb-2 px-1 sm:px-2">משקל</th>
                            <th className="text-right pb-2 px-1 sm:px-2">סוג</th>
                            <th className="text-right pb-2 px-1 sm:px-2">מחצית</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectGrades[subject]
                            .sort((a, b) => {
                              if (a.period_id !== b.period_id) return (a.period_id || 0) - (b.period_id || 0);
                              if ('typeCode' in a && 'typeCode' in b && a.typeCode && b.typeCode) {
                                if (a.typeCode !== b.typeCode) return a.typeCode - b.typeCode;
                              }
                              return (b.grade || 0) - (a.grade || 0);
                            })
                            .map((grade, index) => {
                              const isGradeUncalculateable = 'period_id' in grade && grade.period_id && 
                                !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects);
                              return (
                                <tr key={`table-${index}`} className={`border-b border-gray-50 last:border-0 ${isGradeUncalculateable ? 'opacity-60 bg-yellow-50' : ''}`}>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                                    <div className="flex items-center gap-2">
                                      {grade.title}
                                      {isGradeUncalculateable && (
                                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 px-1 py-0.5">
                                          לא מחושב
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-2 font-medium">
                                    {isGradeUncalculateable ? "—" : grade.grade}
                                  </td>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                                    {grade.weight}%
                                  </td>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                                    {grade.type}
                                  </td>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                                    {grade.period_id === 1538 ? 'א׳' : grade.period_id === 1539 ? 'ב׳' : ''}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden space-y-2">
                      {subjectGrades[subject]
                        .sort((a, b) => {
                           if (a.period_id !== b.period_id) return (a.period_id || 0) - (b.period_id || 0);
                           if ('typeCode' in a && 'typeCode' in b && a.typeCode && b.typeCode) {
                             if (a.typeCode !== b.typeCode) return a.typeCode - b.typeCode;
                           }
                           return (b.grade || 0) - (a.grade || 0);
                        })
                        .map((grade, index) => {
                          const isGradeUncalculateable = 'period_id' in grade && grade.period_id && 
                            !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects);
                          return (
                            <div 
                              key={`mobile-${index}`} 
                              className={`p-3 rounded-lg shadow-sm border ${isGradeUncalculateable ? 'opacity-70 bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="font-medium text-gray-800 text-sm">{grade.title}</h4>
                                {isGradeUncalculateable && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 px-1.5 py-0.5">
                                    לא מחושב
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center text-xs text-gray-600 mb-0.5">
                                <div className="mr-3">
                                  <span>ציון: </span>
                                  <span className="font-semibold text-gray-800">{isGradeUncalculateable ? "—" : grade.grade}</span>
                                </div>
                                <div>
                                  <span>משקל: </span>
                                  <span className="font-semibold text-gray-800">{grade.weight}%</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center text-xs text-gray-600">
                                <div className="mr-3">
                                  <span>סוג: </span>
                                  <span className="font-semibold text-gray-800">{grade.type}</span>
                                </div>
                                <div>
                                  <span>מחצית: </span>
                                  <span className="font-semibold text-gray-800">
                                    {grade.period_id === 1538 ? 'א׳' : grade.period_id === 1539 ? 'ב׳' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
