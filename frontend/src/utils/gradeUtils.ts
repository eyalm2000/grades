
import { Grade, CustomGrade, SubjectAverage } from "@/types/grades";

export const calculateWeightedAverage = (grades: Grade[], customGrades: CustomGrade[] = []): number => {
  if (grades.length === 0 && customGrades.length === 0) return 0;
  
  let totalWeightedGrade = 0;
  let totalWeight = 0;
  
  // Add regular grades
  grades.forEach(grade => {
    totalWeightedGrade += grade.grade * grade.weight;
    totalWeight += grade.weight;
  });
  
  // Add custom grades
  customGrades.forEach(grade => {
    totalWeightedGrade += grade.grade * grade.weight;
    totalWeight += grade.weight;
  });
  
  return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
};

export const calculateSubjectAverages = (
  grades: Grade[], 
  allCustomGrades: Record<string, CustomGrade[]>
): SubjectAverage[] => {
  const subjectGroups: { [key: string]: Grade[] } = {};
  
  grades.forEach(grade => {
    if (!subjectGroups[grade.subject]) {
      subjectGroups[grade.subject] = [];
    }
    subjectGroups[grade.subject].push(grade);
  });
  
  return Object.entries(subjectGroups).map(([subject, subjectGrades]) => {
    const subjectCustomGrades = allCustomGrades[subject] || [];
    const regularWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
    const customWeight = subjectCustomGrades.reduce((sum, grade) => sum + grade.weight, 0);
    const totalWeight = regularWeight + customWeight;
    const average = calculateWeightedAverage(subjectGrades, subjectCustomGrades);
    
    return {
      subject,
      average,
      hasMissingData: totalWeight < 100,
      totalWeight
    };
  }).sort((a, b) => {
    // Sort by missing data first, then by average
    if (a.hasMissingData && !b.hasMissingData) return 1;
    if (!a.hasMissingData && b.hasMissingData) return -1;
    return b.average - a.average;
  });
};

export const getCustomGradesByPeriod = (
  customGrades: Record<string, CustomGrade[]>, 
  periodFilter: string
): Record<string, CustomGrade[]> => {
  switch (periodFilter) {
    case 'period1': 
      return Object.fromEntries(
        Object.entries(customGrades)
          .map(([subject, grades]) => [
            subject, 
            grades.filter(g => g.period_id === 1538 || !g.period_id)
          ])
          .filter(([_, grades]) => grades.length > 0)
      );
    case 'period2': 
      return Object.fromEntries(
        Object.entries(customGrades)
          .map(([subject, grades]) => [
            subject, 
            grades.filter(g => g.period_id === 1539 || !g.period_id)
          ])
          .filter(([_, grades]) => grades.length > 0)
      );
    case 'both':
    default:
      return customGrades;
  }
};

export const generateInsights = (gradesP1: Grade[], gradesP2: Grade[], customGrades: Record<string, CustomGrade[]>) => {
  const allGrades = [...gradesP1, ...gradesP2];
  const subjectAverages = calculateSubjectAverages(allGrades, customGrades);
  
  // Overall average including custom grades
  const subjectCustomGradesList = Object.values(customGrades).flat();
  const overallAverage = calculateWeightedAverage(allGrades, subjectCustomGradesList);
  
  // Best subject
  const bestSubject = subjectAverages.length > 0 
    ? subjectAverages.reduce((best, current) => current.average > best.average ? current : best, subjectAverages[0])
    : null;
  
  // Test averages only
  const testGrades = allGrades.filter(grade => grade.type === 'מבחן' || grade.typeCode === 1);
  const customTestGrades = subjectCustomGradesList.filter(grade => grade.type === 'מבחן');
  const testAverage = calculateWeightedAverage(testGrades, customTestGrades);
  
  // Calculate improvement
  let biggestImprovement = { subject: '', improvement: 0 };
  
  const subjectGroups: { [key: string]: (Grade | CustomGrade)[] } = {};
  
  // Group all regular and custom grades by subject
  allGrades.forEach(grade => {
    if (grade.type === 'מבחן' || grade.typeCode === 1) {
      if (!subjectGroups[grade.subject]) {
        subjectGroups[grade.subject] = [];
      }
      subjectGroups[grade.subject].push({...grade});
    }
  });
  
  // Add custom test grades to their subjects
  Object.entries(customGrades).forEach(([subject, grades]) => {
    const testGrades = grades.filter(g => g.type === 'מבחן');
    if (testGrades.length > 0) {
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(...testGrades);
    }
  });
  
  // Find biggest improvement
  Object.entries(subjectGroups).forEach(([subject, grades]) => {
    if (grades.length >= 2) {
      const sortedGrades = [...grades].sort((a, b) => {
        const dateA = 'date' in a ? new Date(a.date).getTime() : new Date().getTime();
        const dateB = 'date' in b ? new Date(b.date).getTime() : new Date().getTime();
        return dateA - dateB;
      });
      
      const firstGrade = sortedGrades[0].grade;
      const lastGrade = sortedGrades[sortedGrades.length - 1].grade;
      const improvement = lastGrade - firstGrade;
      
      if (improvement > biggestImprovement.improvement) {
        biggestImprovement = { subject, improvement };
      }
    }
  });
  
  return {
    bestSubject,
    testAverage,
    biggestImprovement,
    overallAverage
  };
};
