import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService, Grade } from '@/lib/api';
import { ArrowLeft, Loader, Save, Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MissingDataEditorProps {
  onBack: () => void;
}

interface SubjectData {
  subject: string;
  grades: Grade[];
  totalWeight: number;
  missingWeight: number;
  customGrades: CustomGrade[];
}

interface CustomGrade {
  id: string;
  title: string;
  grade: number;
  weight: number;
  type: string;
  period_id?: number; // Added period_id to track which period the grade belongs to
}

const gradeTypes = [
  { value: 'מבחן', label: 'מבחן' },
  { value: 'עבודה', label: 'עבודה' },
  { value: 'השתתפות', label: 'השתתפות' },
  { value: 'פרויקט', label: 'פרויקט' },
  { value: 'אחר', label: 'אחר' }
];

const STORAGE_KEY = 'grade-vista-custom-grades';

export function MissingDataEditor({ onBack }: MissingDataEditorProps) {
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p1Response, p2Response] = await Promise.all([
        apiService.getGradesPeriod1(),
        apiService.getGradesPeriod2()
      ]);
      
      const allGrades = [...(p1Response.data || []), ...(p2Response.data || [])];
      
      // Group by subject
      const subjectGroups: { [key: string]: Grade[] } = {};
      allGrades.forEach(grade => {
        if (!subjectGroups[grade.subject]) {
          subjectGroups[grade.subject] = [];
        }
        subjectGroups[grade.subject].push(grade);
      });
      
      // Calculate missing weights
      const subjects: SubjectData[] = Object.entries(subjectGroups).map(([subject, grades]) => {
        const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
        const missingWeight = Math.max(0, 100 - totalWeight);
        
        return {
          subject,
          grades,
          totalWeight,
          missingWeight,
          customGrades: []
        };
      }).filter(subject => subject.missingWeight > 0);
      
      // Load saved custom grades from local storage
      const savedCustomGrades = loadCustomGrades();
      
      if (savedCustomGrades) {
        // Merge saved custom grades with subject data
        const updatedSubjects = subjects.map(subject => {
          const saved = savedCustomGrades[subject.subject];
          return {
            ...subject,
            customGrades: saved || []
          };
        });
        
        setSubjectsData(updatedSubjects);
      } else {
        setSubjectsData(subjects);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "לא הצלחנו לטעון את הנתונים, אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomGrades = (): Record<string, CustomGrade[]> | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved custom grades:', e);
      }
    }
    return null;
  };

  const saveCustomGrades = () => {
    const customGradesMap: Record<string, CustomGrade[]> = {};
    
    subjectsData.forEach(subject => {
      if (subject.customGrades.length > 0) {
        // Ensure all custom grades have the correct period_id assigned
        const gradesWithPeriods = subject.customGrades.map(grade => {
          // If period_id is missing, determine it from the subject's regular grades
          if (!grade.period_id) {
            // Find the most common period_id for this subject
            const periodCounts = subject.grades.reduce((acc, g) => {
              acc[g.period_id] = (acc[g.period_id] || 0) + 1;
              return acc;
            }, {} as Record<number, number>);
            
            // Use the most common period_id or default to 1538 (period 1)
            const mostCommonPeriod = Object.entries(periodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '1538';
            
            return { ...grade, period_id: parseInt(mostCommonPeriod) };
          }
          return grade;
        });
        
        customGradesMap[subject.subject] = gradesWithPeriods;
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customGradesMap));
  };

  const addCustomGrade = (subjectIndex: number) => {
    // Determine the most common period_id from the subject's grades
    const subject = subjectsData[subjectIndex];
    
    // Count the occurrences of each period_id
    const periodCounts: Record<number, number> = {};
    subject.grades.forEach(grade => {
      periodCounts[grade.period_id] = (periodCounts[grade.period_id] || 0) + 1;
    });
    
    // Find the most common period_id
    let mostCommonPeriodId = 1538; // Default to period 1 if no other information
    let maxCount = 0;
    
    Object.entries(periodCounts).forEach(([periodId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonPeriodId = parseInt(periodId);
      }
    });
    
    const newGrade: CustomGrade = {
      id: Date.now().toString(),
      title: '',
      grade: 0,
      weight: 1,
      type: 'מבחן',
      period_id: mostCommonPeriodId
    };
    
    setSubjectsData(prev => prev.map((subject, index) => 
      index === subjectIndex 
        ? { ...subject, customGrades: [...subject.customGrades, newGrade] }
        : subject
    ));
  };

  const updateCustomGrade = (subjectIndex: number, gradeId: string, field: keyof CustomGrade, value: any) => {
    setSubjectsData(prev => prev.map((subject, index) => 
      index === subjectIndex 
        ? {
            ...subject,
            customGrades: subject.customGrades.map(grade =>
              grade.id === gradeId ? { ...grade, [field]: value } : grade
            )
          }
        : subject
    ));
  };

  const setPeriodForCustomGrade = (subjectIndex: number, gradeId: string, periodId: number) => {
    updateCustomGrade(subjectIndex, gradeId, 'period_id', periodId);
  };

  const removeCustomGrade = (subjectIndex: number, gradeId: string) => {
    setSubjectsData(prev => prev.map((subject, index) => 
      index === subjectIndex 
        ? {
            ...subject,
            customGrades: subject.customGrades.filter(grade => grade.id !== gradeId)
          }
        : subject
    ));
  };

  const calculateTotalWeightWithCustom = (subject: SubjectData) => {
    const customWeight = subject.customGrades.reduce((sum, grade) => sum + grade.weight, 0);
    return subject.totalWeight + customWeight;
  };

  const saveChanges = () => {
    // Save the custom grades to local storage
    saveCustomGrades();
    
    // Show success animation
    setSaveSuccess(true);
    
    // Hide success animation after a delay
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
    
    toast({
      title: "השינויים נשמרו בהצלחה!",
      description: "מידע החסר נשמר ויתעדכן בחישוב הממוצעים",
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl">טוען נתונים...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white/90 shadow-md border-b backdrop-blur-md sticky top-0 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" onClick={onBack} className="hover:bg-purple-50">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  חזרה
                </Button>
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">עריכת מידע חסר</h1>
            </div>
            
            <AnimatePresence>
              {saveSuccess ? (
                <motion.div
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center space-x-2 space-x-reverse bg-green-100 text-green-800 px-4 py-2 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 ml-1" />
                  <span>נשמר בהצלחה!</span>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={saveChanges} 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    שמור שינויים
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {subjectsData.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <motion.div 
                  className="text-green-600 text-7xl mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, 0] }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  ✅
                </motion.div>
                <motion.h2 
                  className="text-2xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  כל המידע שלך שלם!
                </motion.h2>
                <motion.p 
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  לא זוהה מידע חסר במקצועות שלך
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <motion.div 
              className="text-center mb-8"
              variants={itemVariants}
            >
              <p className="text-gray-600 text-lg">
                זוהו {subjectsData.length} מקצועות עם מידע חסר. השלם את המידע כדי לקבל ממוצע מדוייק יותר.
              </p>
            </motion.div>

            {subjectsData.map((subject, subjectIndex) => (
              <motion.div 
                key={subject.subject}
                variants={itemVariants}
                custom={subjectIndex}
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="shadow-lg border-0 overflow-hidden transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="font-bold">{subject.subject}</CardTitle>
                        <div className="flex space-x-2 space-x-reverse">
                          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                            משקל נוכחי: {calculateTotalWeightWithCustom(subject)}%
                          </Badge>
                          {subject.missingWeight > 0 && (
                            <Badge variant="destructive" className="animate-pulse">
                              חסר: {Math.max(0, 100 - calculateTotalWeightWithCustom(subject))}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Existing Grades */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <span className="bg-blue-100 text-blue-800 p-1 rounded-md ml-2 w-6 h-6 inline-flex items-center justify-center">
                            {subject.grades.length}
                          </span>
                          ציונים קיימים:
                        </h4>
                        <div className="space-y-2">
                          {subject.grades.map((grade, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * index }}
                              whileHover={{ x: 2 }}
                            >
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div>
                                  <span className="font-medium">{grade.title}</span>
                                  <span className="text-gray-600 mr-2 text-sm">({grade.type})</span>
                                  <Badge variant="outline" className="text-xs mr-2 bg-white">
                                    {grade.period_id === 1538 ? 'מחצית א׳' : 'מחצית ב׳'}
                                  </Badge>
                                </div>
                                <div className="text-left">
                                  <span className="font-bold text-lg">{grade.grade}</span>
                                  <span className="text-gray-600 mr-2 text-sm">משקל: {grade.weight}%</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Grades */}
                      {subject.customGrades.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <span className="bg-purple-100 text-purple-800 p-1 rounded-md ml-2 w-6 h-6 inline-flex items-center justify-center">
                              {subject.customGrades.length}
                            </span>
                            מרכיבי הערכה שהוספת:
                          </h4>
                          <div className="space-y-4">
                            {subject.customGrades.map((customGrade) => (
                              <motion.div 
                                key={customGrade.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                whileHover={{ scale: 1.01 }}
                              >
                                <div className="p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 shadow-sm">
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                      <Label className="text-gray-700">שם המרכיב</Label>
                                      <Input
                                        value={customGrade.title}
                                        onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'title', e.target.value)}
                                        placeholder="למשל: מבחן חזרה"
                                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-gray-700">סוג</Label>
                                      <Select
                                        value={customGrade.type}
                                        onValueChange={(value) => updateCustomGrade(subjectIndex, customGrade.id, 'type', value)}
                                      >
                                        <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {gradeTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-gray-700">ציון</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={customGrade.grade}
                                        onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'grade', Number(e.target.value))}
                                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-gray-700">משקל (%)</Label>
                                      <div className="flex space-x-2 space-x-reverse">
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={customGrade.weight}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'weight', Number(e.target.value))}
                                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                        />
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeCustomGrade(subjectIndex, customGrade.id)}
                                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                          >
                                            ✕
                                          </Button>
                                        </motion.div>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-gray-700">מחצית</Label>
                                      <Select
                                        value={customGrade.period_id?.toString() || "1538"}
                                        onValueChange={(value) => setPeriodForCustomGrade(subjectIndex, customGrade.id, parseInt(value))}
                                      >
                                        <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1538">מחצית א׳</SelectItem>
                                          <SelectItem value="1539">מחצית ב׳</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          onClick={() => addCustomGrade(subjectIndex)}
                          className="w-full border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 transition-colors font-medium"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          הוסף מרכיב הערכה
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}

            <motion.div 
              className="flex justify-center space-x-4 space-x-reverse pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="border-gray-300 hover:bg-gray-100 font-medium"
                >
                  ביטול
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={saveChanges}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg px-8"
                >
                  <Save className="w-4 h-4 ml-2" />
                  שמור שינויים
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
