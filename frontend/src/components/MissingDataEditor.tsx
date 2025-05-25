import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { apiService, Grade } from '@/lib/api';
import { ArrowLeft, Loader, Save, Plus, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUncalculateableSubjects, isSubjectCalculateable } from '@/utils/gradeUtils';

interface MissingDataEditorProps {
  onBack: () => void;
}

interface SubjectData {
  subject: string;
  period1: PeriodData;
  period2: PeriodData;
  customGrades: CustomGrade[];
}

interface PeriodData {
  grades: Grade[];
  totalWeight: number;
  missingWeight: number;
}

interface CustomGrade {
  id: string;
  title: string;
  grade: number | string | null | undefined;
  weight: number;
  type: string;
  period_id?: number; // Added period_id to track which period the grade belongs to
  isExisting?: boolean; // Track if this is an existing grade being edited
  originalGradeId?: number; // Store original evaluationID if editing existing grade
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
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, number>>({}); // Track selected period per subject
  const [selectedExistingGrade, setSelectedExistingGrade] = useState<Record<string, string>>({}); // Track selected existing grade per subject
  const [openGradeDropdowns, setOpenGradeDropdowns] = useState<Record<string, boolean>>({}); // Track which grade dropdowns are open
  const [uncalculateableSubjects, setUncalculateableSubjects] = useState<any[]>([]);
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
      
      const gradesP1 = p1Response.data || [];
      const gradesP2 = p2Response.data || [];
      const allGrades = [...gradesP1, ...gradesP2];
      
      // Calculate uncalculateable subjects
      const uncalcSubjects = getUncalculateableSubjects(allGrades);
      setUncalculateableSubjects(uncalcSubjects);
      
      // Group by subject for each period separately
      const subjectGroupsP1: { [key: string]: Grade[] } = {};
      const subjectGroupsP2: { [key: string]: Grade[] } = {};
      
      gradesP1.forEach(grade => {
        if (!subjectGroupsP1[grade.subject]) {
          subjectGroupsP1[grade.subject] = [];
        }
        subjectGroupsP1[grade.subject].push(grade);
      });
      
      gradesP2.forEach(grade => {
        if (!subjectGroupsP2[grade.subject]) {
          subjectGroupsP2[grade.subject] = [];
        }
        subjectGroupsP2[grade.subject].push(grade);
      });
      
      // Get all unique subjects from both periods
      const allSubjects = new Set([...Object.keys(subjectGroupsP1), ...Object.keys(subjectGroupsP2)]);
      
      // Create subject data with separate periods
      const subjects: SubjectData[] = Array.from(allSubjects).map(subject => {
        const p1Grades = subjectGroupsP1[subject] || [];
        const p2Grades = subjectGroupsP2[subject] || [];
        
        const p1TotalWeight = p1Grades.reduce((sum, grade) => sum + grade.weight, 0);
        const p2TotalWeight = p2Grades.reduce((sum, grade) => sum + grade.weight, 0);
        
        return {
          subject,
          period1: {
            grades: p1Grades,
            totalWeight: p1TotalWeight,
            missingWeight: Math.max(0, 100 - p1TotalWeight)
          },
          period2: {
            grades: p2Grades,
            totalWeight: p2TotalWeight,
            missingWeight: Math.max(0, 100 - p2TotalWeight)
          },
          customGrades: []
        };
      });
      
      // Load saved custom grades from local storage
      const savedCustomGrades = loadCustomGrades();
      
      let updatedSubjects: SubjectData[];
      if (savedCustomGrades) {
        // Merge saved custom grades with subject data
        updatedSubjects = subjects.map(subject => {
          const saved = savedCustomGrades[subject.subject];
          return {
            ...subject,
            customGrades: saved || []
          };
        });
      } else {
        updatedSubjects = subjects;
      }
      
      // מיון מקצועות: מקצועות עם מידע חסר ראשונים
      const sortedSubjects = updatedSubjects.sort((a, b) => {
        const aHasMissingData = a.period1.missingWeight > 0 || a.period2.missingWeight > 0;
        const bHasMissingData = b.period1.missingWeight > 0 || b.period2.missingWeight > 0;
        
        if (aHasMissingData && !bHasMissingData) return -1;
        if (!aHasMissingData && bHasMissingData) return 1;
        
        // אם שני המקצועות עם או בלי מידע חסר, מיון לפי שם
        return a.subject.localeCompare(b.subject, 'he');
      });
      
      setSubjectsData(sortedSubjects);
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
        customGradesMap[subject.subject] = subject.customGrades;
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customGradesMap));
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Helper function to check if a subject/period is uncalculateable
  const isSubjectPeriodUncalculateable = (subject: string, periodId: number): boolean => {
    return !isSubjectCalculateable(subject, periodId, uncalculateableSubjects);
  };

  const addCustomGrade = (subjectIndex: number) => {
    // Use the currently selected period for this subject
    const subject = subjectsData[subjectIndex];
    const selectedPeriodId = selectedPeriods[subject.subject] || 1538;
    
    const newGrade: CustomGrade = {
      id: Date.now().toString(),
      title: '',
      grade: 0,
      weight: 1,
      type: 'מבחן',
      period_id: selectedPeriodId
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

  const makeGradeEditable = (subjectIndex: number, grade: Grade) => {
    const editableGrade: CustomGrade = {
      id: `existing_${grade.evaluationID}`,
      title: grade.title,
      grade: grade.grade,
      weight: grade.weight,
      type: grade.type,
      period_id: grade.period_id,
      isExisting: true,
      originalGradeId: grade.evaluationID
    };

    setSubjectsData(prev => prev.map((subject, index) => 
      index === subjectIndex 
        ? { 
            ...subject, 
            customGrades: [...subject.customGrades, editableGrade],
            period1: {
              ...subject.period1,
              grades: subject.period1.grades.filter(g => g.evaluationID !== grade.evaluationID)
            },
            period2: {
              ...subject.period2,
              grades: subject.period2.grades.filter(g => g.evaluationID !== grade.evaluationID)
            }
          }
        : subject
    ));
  };

  const revertGradeToOriginal = (subjectIndex: number, customGradeId: string) => {
    const subject = subjectsData[subjectIndex];
    const customGrade = subject.customGrades.find(g => g.id === customGradeId);
    
    if (customGrade && customGrade.isExisting && customGrade.originalGradeId) {
      // Find the original grade data - we need to reload it
      // For now, we'll just remove the custom grade and it will appear as original again
      setSubjectsData(prev => prev.map((s, index) => 
        index === subjectIndex 
          ? {
              ...s,
              customGrades: s.customGrades.filter(g => g.id !== customGradeId)
            }
          : s
      ));
      
      // Reload data to restore original grade
      loadData();
    }
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

  const calculateTotalWeightWithCustom = (subject: SubjectData, periodId?: number) => {
    if (periodId) {
      // Calculate for specific period
      const periodData = periodId === 1538 ? subject.period1 : subject.period2;
      const customWeight = subject.customGrades
        .filter(grade => grade.period_id === periodId)
        .reduce((sum, grade) => sum + grade.weight, 0);
      return periodData.totalWeight + customWeight;
    } else {
      // Calculate total for both periods (for overall display)
    const customWeight = subject.customGrades.reduce((sum, grade) => sum + grade.weight, 0);
      return subject.period1.totalWeight + subject.period2.totalWeight + customWeight;
    }
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
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" onClick={onBack} className="hover:bg-purple-50 text-sm sm:text-base px-2 sm:px-3">
                  <ArrowLeft className="w-4 h-4 ml-1 sm:ml-2" />
                  חזרה
                </Button>
              </motion.div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">עריכת מידע חסר</h1>
            </div>
            
            <AnimatePresence>
              {saveSuccess ? (
                <motion.div
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center space-x-1 sm:space-x-2 space-x-reverse bg-green-100 text-green-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
                  <span>נשמר בהצלחה!</span>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={saveChanges} 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 h-auto sm:h-9"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    שמור שינויים
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="container mx-auto px-2 sm:px-4 py-6 sm:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {subjectsData.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                <motion.div 
                  className="text-green-600 text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, 0] }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  ✅
                </motion.div>
                <motion.h2 
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  כל המידע שלך שלם!
                </motion.h2>
                <motion.p 
                  className="text-gray-600 text-base sm:text-lg"
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
              className="text-center mb-6 sm:mb-8"
              variants={itemVariants}
            >
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-200">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                  {subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length > 0 ? "🚨" : "✅"}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length > 0 
                    ? "עריכת ציונים ומידע חסר" 
                    : "עריכת ציונים"
                  }
                </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                  {subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length > 0 
                    ? (() => {
                        const missingCount = subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length;
                        return (
                          <span>
                            זוהו <span className="font-bold text-red-600">{missingCount} מקצועות עם מידע חסר</span>. 
                            מקצועות אלה מופיעים ראשונים ומסומנים בבירור. 
                            השלם את המידע כדי לקבל ממוצע מדוייק יותר.
                          </span>
                        );
                      })()
                    : `כל ${subjectsData.length} המקצועות שלך זמינים לעריכה. תוכל לערוך ציונים קיימים או להוסיף מרכיבי הערכה חדשים.`
                  }
              </p>
              </div>
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
                  <Card className={`shadow-lg border-0 overflow-hidden transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm ${
                    (subject.period1.missingWeight > 0 || subject.period2.missingWeight > 0) 
                      ? 'ring-2 ring-red-200 shadow-red-100' 
                      : ''
                  }`}>
                    <CardHeader className={`border-b ${
                      (subject.period1.missingWeight > 0 || subject.period2.missingWeight > 0)
                        ? 'bg-gradient-to-r from-red-50 to-orange-50'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3">
                        <CardTitle className="font-bold flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                          <span className="text-xl sm:text-2xl">
                            {(subject.period1.missingWeight > 0 || subject.period2.missingWeight > 0) ? '🔴' : '📚'}
                          </span>
                          {subject.subject}
                          {(subject.period1.missingWeight > 0 || subject.period2.missingWeight > 0) && (
                            <Badge variant="destructive" className="animate-pulse text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                              ⚠️ דורש תשומת לב
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex flex-wrap gap-1 sm:gap-2 justify-start sm:justify-end">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            מחצית א׳: {calculateTotalWeightWithCustom(subject, 1538)}%
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            מחצית ב׳: {calculateTotalWeightWithCustom(subject, 1539)}%
                          </Badge>
                          {isSubjectPeriodUncalculateable(subject.subject, 1538) && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                              מחצית א׳ לא מחושבת
                            </Badge>
                          )}
                          {isSubjectPeriodUncalculateable(subject.subject, 1539) && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                              מחצית ב׳ לא מחושבת
                            </Badge>
                          )}
                          {(subject.period1.missingWeight > 0 || subject.period2.missingWeight > 0) && (
                            <Badge variant="destructive" className="animate-pulse font-semibold text-xs">
                              🚨 יש מידע חסר
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {/* Period 1 */}
                      <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                          <h3 className="text-base sm:text-lg font-semibold text-blue-700">מחצית א׳</h3>
                          <div className="flex flex-wrap gap-1 sm:gap-2 justify-start sm:justify-end">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              משקל: {calculateTotalWeightWithCustom(subject, 1538)}%
                            </Badge>
                            {isSubjectPeriodUncalculateable(subject.subject, 1538) && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                לא מחושב
                              </Badge>
                            )}
                            {subject.period1.missingWeight > 0 && (
                              <Badge variant="destructive" className="animate-pulse font-semibold text-xs">
                                🚨 חסר: {Math.max(0, 100 - calculateTotalWeightWithCustom(subject, 1538))}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Existing Grades Dropdown - Period 1 */}
                        {subject.period1.grades.length > 0 && (
                          <div className="mb-4 sm:mb-6">
                            <Collapsible 
                              open={openGradeDropdowns[`${subject.subject}_1538`]} 
                              onOpenChange={(open) => setOpenGradeDropdowns(prev => ({
                                ...prev,
                                [`${subject.subject}_1538`]: open
                              }))}
                            >
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-between mb-2 sm:mb-3 hover:bg-blue-50 text-sm sm:text-base px-3 py-2 h-auto"
                                >
                                  <span className="font-semibold">
                                    ציונים קיימים במחצית א׳ ({subject.period1.grades.length})
                                  </span>
                                  {openGradeDropdowns[`${subject.subject}_1538`] ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-2">
                                <div className="space-y-2 p-2 bg-blue-25 rounded-lg border border-blue-100">
                                {subject.period1.grades.map((grade) => (
                            <motion.div 
                                    key={grade.evaluationID}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white/80 rounded-lg border border-blue-200 hover:border-blue-300 transition-all shadow-sm"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="font-medium text-gray-900 text-sm sm:text-base">{grade.title}</span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0.5">
                                          {grade.type}
                                  </Badge>
                                </div>
                                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                        ציון: <span className="font-medium">{grade.grade}</span>{" "}•{" "}
                                        משקל: <span className="font-medium">{grade.weight}%</span>{" "}•{" "}
                                        תאריך: <span className="font-medium">{new Date(grade.date).toLocaleDateString('he-IL')}</span>
                                </div>
                              </div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-full sm:w-auto">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => makeGradeEditable(subjectIndex, grade)}
                                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 h-auto w-full sm:w-auto"
                                      >
                                        ✏️ ערוך
                                      </Button>
                                    </motion.div>
                            </motion.div>
                          ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                        </div>
                        )}

                        {/* Custom Grades for Period 1 */}
                        {(() => {
                          const period1CustomGrades = subject.customGrades.filter(g => g.period_id === 1538);
                          return period1CustomGrades.length > 0 && (
                            <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 w-5 h-5 sm:w-6 sm:h-6 inline-flex items-center justify-center text-xs sm:text-sm">
                                  {period1CustomGrades.length}
                            </span>
                                ציונים בעריכה (מחצית א׳):
                          </h4>
                              <div className="space-y-3">
                                {period1CustomGrades.map((customGrade) => (
                                  <div 
                                key={customGrade.id}
                                    className={`p-2 sm:p-3 border rounded-lg shadow-sm ${
                                      customGrade.isExisting 
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                                        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                                    }`}
                                  >
                                    {customGrade.isExisting && (
                                      <div className="mb-1.5 sm:mb-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-1.5 py-0.5">
                                          ציון קיים בעריכה
                                        </Badge>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3">
                                    <div>
                                        <Label className="text-gray-700 text-xs">שם המרכיב</Label>
                                      <Input
                                        value={customGrade.title}
                                        onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'title', e.target.value)}
                                        placeholder="למשל: מבחן חזרה"
                                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm h-9 sm:h-10"
                                      />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700 text-xs">סוג</Label>
                                      <Select
                                        value={customGrade.type}
                                        onValueChange={(value) => updateCustomGrade(subjectIndex, customGrade.id, 'type', value)}
                                      >
                                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm h-9 sm:h-10">
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
                                        <Label className="text-gray-700 text-xs">ציון</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                          value={customGrade.grade || ''}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'grade', e.target.value ? Number(e.target.value) : '')}
                                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm h-9 sm:h-10"
                                          placeholder="הזן ציון"
                                      />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700 text-xs">משקל (%)</Label>
                                      <div className="flex space-x-1 sm:space-x-2 space-x-reverse">
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={customGrade.weight}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'weight', Number(e.target.value))}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm h-9 sm:h-10"
                                          />
                                          <div className="flex space-x-1 space-x-reverse">
                                            {customGrade.isExisting && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revertGradeToOriginal(subjectIndex, customGrade.id)}
                                                className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 text-xs px-1.5 sm:px-2 h-9 sm:h-10"
                                              >
                                                ↶
                                              </Button>
                                            )}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeCustomGrade(subjectIndex, customGrade.id)}
                                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs px-1.5 sm:px-2 h-9 sm:h-10"
                                          >
                                            ✕
                                          </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPeriods(prev => ({...prev, [subject.subject]: 1538}));
                            addCustomGrade(subjectIndex);
                          }}
                          className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium text-xs sm:text-sm py-2 h-auto"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                          הוסף מרכיב הערכה למחצית א׳
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-4 sm:my-6"></div>

                      {/* Period 2 */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                          <h3 className="text-base sm:text-lg font-semibold text-green-700">מחצית ב׳</h3>
                          <div className="flex flex-wrap gap-1 sm:gap-2 justify-start sm:justify-end">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              משקל: {calculateTotalWeightWithCustom(subject, 1539)}%
                            </Badge>
                            {isSubjectPeriodUncalculateable(subject.subject, 1539) && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                לא מחושב
                              </Badge>
                            )}
                            {subject.period2.missingWeight > 0 && (
                              <Badge variant="destructive" className="animate-pulse font-semibold text-xs">
                                🚨 חסר: {Math.max(0, 100 - calculateTotalWeightWithCustom(subject, 1539))}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Existing Grades Dropdown - Period 2 */}
                        {subject.period2.grades.length > 0 && (
                          <div className="mb-4 sm:mb-6">
                            <Collapsible 
                              open={openGradeDropdowns[`${subject.subject}_1539`]} 
                              onOpenChange={(open) => setOpenGradeDropdowns(prev => ({
                                ...prev,
                                [`${subject.subject}_1539`]: open
                              }))}
                            >
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-between mb-2 sm:mb-3 hover:bg-green-50 text-sm sm:text-base px-3 py-2 h-auto"
                                >
                                  <span className="font-semibold">
                                    ציונים קיימים במחצית ב׳ ({subject.period2.grades.length})
                                  </span>
                                  {openGradeDropdowns[`${subject.subject}_1539`] ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-2">
                                <div className="space-y-2 p-2 bg-green-25 rounded-lg border border-green-100">
                                {subject.period2.grades.map((grade) => (
                            <motion.div 
                                    key={grade.evaluationID}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white/80 rounded-lg border border-green-200 hover:border-green-300 transition-all shadow-sm"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="font-medium text-gray-900 text-sm sm:text-base">{grade.title}</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0.5">
                                          {grade.type}
                                  </Badge>
                                </div>
                                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                        ציון: <span className="font-medium">{grade.grade}</span>{" "}•{" "}
                                        משקל: <span className="font-medium">{grade.weight}%</span>{" "}•{" "}
                                        תאריך: <span className="font-medium">{new Date(grade.date).toLocaleDateString('he-IL')}</span>
                                </div>
                              </div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-full sm:w-auto">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => makeGradeEditable(subjectIndex, grade)}
                                        className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 h-auto w-full sm:w-auto"
                                      >
                                        ✏️ ערוך
                                      </Button>
                                    </motion.div>
                            </motion.div>
                          ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                        </div>
                        )}

                        {/* Custom Grades for Period 2 */}
                        {(() => {
                          const period2CustomGrades = subject.customGrades.filter(g => g.period_id === 1539);
                          return period2CustomGrades.length > 0 && (
                            <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                <span className="bg-green-100 text-green-800 p-1 rounded-md mr-2 w-5 h-5 sm:w-6 sm:h-6 inline-flex items-center justify-center text-xs sm:text-sm">
                                  {period2CustomGrades.length}
                                </span>
                                ציונים בעריכה (מחצית ב׳):
                              </h4>
                              <div className="space-y-3">
                                {period2CustomGrades.map((customGrade) => (
                                  <div 
                                    key={customGrade.id}
                                    className={`p-2 sm:p-3 border rounded-lg shadow-sm ${
                                      customGrade.isExisting 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                                        : 'bg-gradient-to-r from-purple-50 to-green-50 border-purple-200'
                                    }`}
                                  >
                                    {customGrade.isExisting && (
                                      <div className="mb-1.5 sm:mb-2">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 text-xs px-1.5 py-0.5">
                                          ציון קיים בעריכה
                                        </Badge>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3">
                                      <div>
                                        <Label className="text-gray-700 text-xs">שם המרכיב</Label>
                                        <Input
                                          value={customGrade.title}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'title', e.target.value)}
                                          placeholder="למשל: מבחן חזרה"
                                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm h-9 sm:h-10"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-gray-700 text-xs">סוג</Label>
                                        <Select
                                          value={customGrade.type}
                                          onValueChange={(value) => updateCustomGrade(subjectIndex, customGrade.id, 'type', value)}
                                        >
                                          <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm h-9 sm:h-10">
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
                                        <Label className="text-gray-700 text-xs">ציון</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={customGrade.grade || ''}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'grade', e.target.value ? Number(e.target.value) : '')}
                                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm h-9 sm:h-10"
                                          placeholder="הזן ציון"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-gray-700 text-xs">משקל (%)</Label>
                                        <div className="flex space-x-1 sm:space-x-2 space-x-reverse">
                                          <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={customGrade.weight}
                                            onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'weight', Number(e.target.value))}
                                            className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm h-9 sm:h-10"
                                          />
                                          <div className="flex space-x-1 space-x-reverse">
                                            {customGrade.isExisting && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revertGradeToOriginal(subjectIndex, customGrade.id)}
                                                className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 text-xs px-1.5 sm:px-2 h-9 sm:h-10"
                                              >
                                                ↶
                                              </Button>
                                            )}
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => removeCustomGrade(subjectIndex, customGrade.id)}
                                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs px-1.5 sm:px-2 h-9 sm:h-10"
                                            >
                                              ✕
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                            ))}
                          </div>
                        </div>
                          );
                        })()}

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPeriods(prev => ({...prev, [subject.subject]: 1539}));
                            addCustomGrade(subjectIndex);
                          }}
                          className="w-full border-dashed border-2 hover:border-green-400 hover:bg-green-50 transition-colors font-medium text-xs sm:text-sm py-2 h-auto"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                          הוסף מרכיב הערכה למחצית ב׳
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}

            <motion.div 
              className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-4 sm:pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="border-gray-300 hover:bg-gray-100 font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                  ביטול
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  onClick={saveChanges}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
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
