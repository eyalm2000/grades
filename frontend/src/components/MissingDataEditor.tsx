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
            // Find the most common period_id for this subject from both periods
            const allGrades = [...subject.period1.grades, ...subject.period2.grades];
            const periodCounts = allGrades.reduce((acc, g) => {
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
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="text-4xl mb-4">
                  {subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length > 0 ? "📝" : "✅"}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length > 0 
                    ? "עריכת ציונים ומידע חסר" 
                    : "עריכת ציונים"
                  }
                </h2>
              <p className="text-gray-600 text-lg">
                  {subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length > 0 
                    ? `זוהו ${subjectsData.filter(s => s.period1.missingWeight > 0 || s.period2.missingWeight > 0).length} מקצועות עם מידע חסר. השלם את המידע כדי לקבל ממוצע מדוייק יותר.`
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
                  <Card className="shadow-lg border-0 overflow-hidden transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="font-bold flex items-center gap-3">
                          <span className="text-2xl">📚</span>
                          {subject.subject}
                        </CardTitle>
                        <div className="flex space-x-2 space-x-reverse">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            מחצית א׳: {calculateTotalWeightWithCustom(subject, 1538)}%
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            מחצית ב׳: {calculateTotalWeightWithCustom(subject, 1539)}%
                          </Badge>
                          {(subject.period1.missingWeight > 0 || subject.period2.missingWeight > 0) && (
                            <Badge variant="destructive" className="animate-pulse">
                              יש מידע חסר
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Period 1 */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-blue-700">מחצית א׳</h3>
                          <div className="flex space-x-2 space-x-reverse">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              משקל: {calculateTotalWeightWithCustom(subject, 1538)}%
                            </Badge>
                            {subject.period1.missingWeight > 0 && (
                              <Badge variant="destructive" className="animate-pulse">
                                חסר: {Math.max(0, 100 - calculateTotalWeightWithCustom(subject, 1538))}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Existing Grades Dropdown - Period 1 */}
                        {subject.period1.grades.length > 0 && (
                      <div className="mb-6">
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
                                  className="w-full justify-between mb-3 hover:bg-blue-50"
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
                              <CollapsibleContent className="space-y-2 max-h-48 overflow-y-auto">
                                {subject.period1.grades.map((grade) => (
                            <motion.div 
                                    key={grade.evaluationID}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-200 hover:border-blue-300 transition-all"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{grade.title}</span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                          {grade.type}
                                  </Badge>
                                </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        ציון: <span className="font-medium">{grade.grade}</span>{" "}•{" "}
                                        משקל: <span className="font-medium">{grade.weight}%</span>{" "}•{" "}
                                        תאריך: <span className="font-medium">{new Date(grade.date).toLocaleDateString('he-IL')}</span>
                                </div>
                              </div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => makeGradeEditable(subjectIndex, grade)}
                                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-sm px-3"
                                      >
                                        ✏️ ערוך
                                      </Button>
                                    </motion.div>
                            </motion.div>
                          ))}
                              </CollapsibleContent>
                            </Collapsible>
                        </div>
                        )}

                        {/* Custom Grades for Period 1 */}
                        {(() => {
                          const period1CustomGrades = subject.customGrades.filter(g => g.period_id === 1538);
                          return period1CustomGrades.length > 0 && (
                            <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <span className="bg-blue-100 text-blue-800 p-1 rounded-md ml-2 w-6 h-6 inline-flex items-center justify-center">
                                  {period1CustomGrades.length}
                            </span>
                                ציונים בעריכה:
                          </h4>
                              <div className="space-y-3">
                                {period1CustomGrades.map((customGrade) => (
                                  <div 
                                key={customGrade.id}
                                    className={`p-3 border rounded-lg shadow-sm ${
                                      customGrade.isExisting 
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                                        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                                    }`}
                                  >
                                    {customGrade.isExisting && (
                                      <div className="mb-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                          ציון קיים בעריכה
                                        </Badge>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label className="text-gray-700 text-xs">שם המרכיב</Label>
                                      <Input
                                        value={customGrade.title}
                                        onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'title', e.target.value)}
                                        placeholder="למשל: מבחן חזרה"
                                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                      />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700 text-xs">סוג</Label>
                                      <Select
                                        value={customGrade.type}
                                        onValueChange={(value) => updateCustomGrade(subjectIndex, customGrade.id, 'type', value)}
                                      >
                                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm">
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
                                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                          placeholder="הזן ציון"
                                      />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700 text-xs">משקל (%)</Label>
                                      <div className="flex space-x-2 space-x-reverse">
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={customGrade.weight}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'weight', Number(e.target.value))}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                          />
                                          <div className="flex space-x-1 space-x-reverse">
                                            {customGrade.isExisting && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revertGradeToOriginal(subjectIndex, customGrade.id)}
                                                className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 text-xs px-2"
                                              >
                                                ↶
                                              </Button>
                                            )}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeCustomGrade(subjectIndex, customGrade.id)}
                                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs px-2"
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
                          className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium text-sm"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          הוסף מרכיב הערכה למחצית א׳
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 mb-8"></div>

                      {/* Period 2 */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-green-700">מחצית ב׳</h3>
                          <div className="flex space-x-2 space-x-reverse">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              משקל: {calculateTotalWeightWithCustom(subject, 1539)}%
                            </Badge>
                            {subject.period2.missingWeight > 0 && (
                              <Badge variant="destructive" className="animate-pulse">
                                חסר: {Math.max(0, 100 - calculateTotalWeightWithCustom(subject, 1539))}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Existing Grades Dropdown - Period 2 */}
                        {subject.period2.grades.length > 0 && (
                          <div className="mb-6">
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
                                  className="w-full justify-between mb-3 hover:bg-green-50"
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
                              <CollapsibleContent className="space-y-2 max-h-48 overflow-y-auto">
                                {subject.period2.grades.map((grade) => (
                                  <motion.div 
                                    key={grade.evaluationID}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-green-200 hover:border-green-300 transition-all"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{grade.title}</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                          {grade.type}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        ציון: <span className="font-medium">{grade.grade}</span>{" "}•{" "}
                                        משקל: <span className="font-medium">{grade.weight}%</span>{" "}•{" "}
                                        תאריך: <span className="font-medium">{new Date(grade.date).toLocaleDateString('he-IL')}</span>
                                      </div>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => makeGradeEditable(subjectIndex, grade)}
                                        className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-sm px-3"
                                      >
                                        ✏️ ערוך
                                      </Button>
                                    </motion.div>
                                  </motion.div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}

                        {/* Custom Grades for Period 2 */}
                        {(() => {
                          const period2CustomGrades = subject.customGrades.filter(g => g.period_id === 1539);
                          return period2CustomGrades.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <span className="bg-green-100 text-green-800 p-1 rounded-md ml-2 w-6 h-6 inline-flex items-center justify-center">
                                  {period2CustomGrades.length}
                                </span>
                                ציונים בעריכה:
                              </h4>
                              <div className="space-y-3">
                                {period2CustomGrades.map((customGrade) => (
                                  <div 
                                    key={customGrade.id}
                                    className={`p-3 border rounded-lg shadow-sm ${
                                      customGrade.isExisting 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                                        : 'bg-gradient-to-r from-purple-50 to-green-50 border-purple-200'
                                    }`}
                                  >
                                    {customGrade.isExisting && (
                                      <div className="mb-2">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                          ציון קיים בעריכה
                                        </Badge>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                      <div>
                                        <Label className="text-gray-700 text-xs">שם המרכיב</Label>
                                        <Input
                                          value={customGrade.title}
                                          onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'title', e.target.value)}
                                          placeholder="למשל: מבחן חזרה"
                                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-gray-700 text-xs">סוג</Label>
                                        <Select
                                          value={customGrade.type}
                                          onValueChange={(value) => updateCustomGrade(subjectIndex, customGrade.id, 'type', value)}
                                        >
                                          <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm">
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
                                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
                                          placeholder="הזן ציון"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-gray-700 text-xs">משקל (%)</Label>
                                        <div className="flex space-x-2 space-x-reverse">
                                          <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={customGrade.weight}
                                            onChange={(e) => updateCustomGrade(subjectIndex, customGrade.id, 'weight', Number(e.target.value))}
                                            className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
                                          />
                                          <div className="flex space-x-1 space-x-reverse">
                                            {customGrade.isExisting && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revertGradeToOriginal(subjectIndex, customGrade.id)}
                                                className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 text-xs px-2"
                                              >
                                                ↶
                                              </Button>
                                            )}
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => removeCustomGrade(subjectIndex, customGrade.id)}
                                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs px-2"
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
                          className="w-full border-dashed border-2 hover:border-green-400 hover:bg-green-50 transition-colors font-medium text-sm"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          הוסף מרכיב הערכה למחצית ב׳
                        </Button>
                      </div>
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
