import { Grade, CustomGrade, SubjectAverage, UncalculateableSubject, DetailedSubjectAverage } from "@/types/grades";

export const getUncalculateableSubjects = (grades: Grade[]): UncalculateableSubject[] => {
  const Uncalculateable = new Set<string>();
  const subjectGroupsPeriod1: { [subject: string]: Grade[] } = {};
  const subjectGroupsPeriod2: { [subject: string]: Grade[] } = {};
  grades.forEach(grade => {
    if (!subjectGroupsPeriod1[grade.subject] && grade.period_id === 1538) {
      subjectGroupsPeriod1[grade.subject] = [];
    } else if (!subjectGroupsPeriod2[grade.subject] && grade.period_id === 1539) {
      subjectGroupsPeriod2[grade.subject] = [];
    }
    if (grade.period_id === 1538) {
      subjectGroupsPeriod1[grade.subject].push(grade);
    } else if (grade.period_id === 1539) {
      subjectGroupsPeriod2[grade.subject].push(grade);
    }
  });

  const result: UncalculateableSubject[] = [];

  Object.entries(subjectGroupsPeriod1).forEach(([subject, subjectGrades]) => {
    const allMissingWeight = subjectGrades.every(
      g => g.weight === 0 || g.weight === null || g.weight === undefined
    );
    if (allMissingWeight) {
      result.push({ subject, period: 1 });
    }
  });

  Object.entries(subjectGroupsPeriod2).forEach(([subject, subjectGrades]) => {
    const allMissingWeight = subjectGrades.every(
      g => g.weight === 0 || g.weight === null || g.weight === undefined
    );
    if (allMissingWeight) {
      result.push({ subject, period: 2 });
    }
  });

  return result;
};

// Helper function to check if a subject should be excluded from calculations
export const isSubjectCalculateable = (
  subject: string, 
  periodId: number, 
  uncalculateableSubjects: UncalculateableSubject[]
): boolean => {
  const period = periodId === 1538 ? 1 : periodId === 1539 ? 2 : 0;
  return !uncalculateableSubjects.some(
    uncalc => uncalc.subject === subject && uncalc.period === period
  );
};

export const calculateWeightedAverage = (grades: Grade[], customGrades: CustomGrade[] = []): number => {
  // Filter out grades with invalid values
  const validGrades = grades.filter(grade => 
    grade.grade !== null && 
    grade.grade !== undefined && 
    grade.grade !== '' && 
    !isNaN(Number(grade.grade)) &&
    grade.weight > 0
  );
  
  const validCustomGrades = customGrades.filter(grade => 
    grade.grade !== null && 
    grade.grade !== undefined && 
    grade.grade !== '' && 
    !isNaN(Number(grade.grade)) &&
    grade.weight > 0
  );
  
  if (validGrades.length === 0 && validCustomGrades.length === 0) return 0;
  
  let totalWeightedGrade = 0;
  let totalWeight = 0;
  
  // Add regular grades
  validGrades.forEach(grade => {
    totalWeightedGrade += Number(grade.grade) * grade.weight;
    totalWeight += grade.weight;
  });
  
  // Add custom grades
  validCustomGrades.forEach(grade => {
    totalWeightedGrade += Number(grade.grade) * grade.weight;
    totalWeight += grade.weight;
  });
  
  return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
};

export const calculateSubjectAverages = (
  grades: Grade[], 
  allCustomGrades: Record<string, CustomGrade[]>,
  excludeUncalculateable: boolean = true
): SubjectAverage[] => {
  const uncalculateableSubjects = getUncalculateableSubjects(grades);
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
    
    // Check if this subject is uncalculateable in any period that these grades belong to
    const isUncalculateable = subjectGrades.some(grade => 
      !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects)
    );
    
    // If subject is uncalculateable and we're excluding them from calculations, set average to 0
    // but still include in the list for display purposes
    const average = (excludeUncalculateable && isUncalculateable) 
      ? 0 
      : calculateWeightedAverage(subjectGrades, subjectCustomGrades);
    
    return {
      subject,
      average,
      hasMissingData: totalWeight < 100,
      totalWeight,
      isUncalculateable
    };
  }).sort((a, b) => {
    // Sort uncalculateable subjects to the bottom
    if (a.isUncalculateable && !b.isUncalculateable) return 1;
    if (!a.isUncalculateable && b.isUncalculateable) return -1;
    // Then sort by missing data, then by average
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
  const uncalculateableSubjects = getUncalculateableSubjects(allGrades);
  
  // Filter out uncalculateable subjects from grades
  const calculableGrades = allGrades.filter(grade => 
    isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects)
  );
  
  const subjectAverages = calculateSubjectAverages(calculableGrades, customGrades, true);
  
  // Overall average including custom grades (only for calculable subjects)
  const subjectCustomGradesList = Object.entries(customGrades)
    .filter(([subject]) => {
      // Check if this subject is calculateable in any period
      return calculableGrades.some(grade => grade.subject === subject);
    })
    .flatMap(([_, grades]) => grades);
  
  const overallAverage = calculateWeightedAverage(calculableGrades, subjectCustomGradesList);
  
  // Best subject (only from calculable subjects)
  const bestSubject = subjectAverages.length > 0 
    ? subjectAverages.reduce((best, current) => current.average > best.average ? current : best, subjectAverages[0])
    : null;
  
  // Test averages only (excluding uncalculateable subjects)
  const testGrades = calculableGrades.filter(grade => grade.type === 'מבחן' || grade.typeCode === 1);
  const customTestGrades = subjectCustomGradesList.filter(grade => grade.type === 'מבחן');
  const testAverage = calculateWeightedAverage(testGrades, customTestGrades);
  
  // Calculate improvement (only for calculable subjects)
  let biggestImprovement = { subject: '', improvement: 0 };
  
  const subjectGroups: { [key: string]: (Grade | CustomGrade)[] } = {};
  
  // Group all regular and custom grades by subject (only calculable ones)
  calculableGrades.forEach(grade => {
    if (grade.type === 'מבחן' || grade.typeCode === 1) {
      if (!subjectGroups[grade.subject]) {
        subjectGroups[grade.subject] = [];
      }
      subjectGroups[grade.subject].push({...grade});
    }
  });
  
  // Add custom test grades to their subjects (only for calculable subjects)
  Object.entries(customGrades).forEach(([subject, grades]) => {
    // Only include if this subject has calculable grades
    if (calculableGrades.some(grade => grade.subject === subject)) {
      const testGrades = grades.filter(g => g.type === 'מבחן');
      if (testGrades.length > 0) {
        if (!subjectGroups[subject]) {
          subjectGroups[subject] = [];
        }
        subjectGroups[subject].push(...testGrades);
      }
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
      
      const firstGrade = Number(sortedGrades[0].grade);
      const lastGrade = Number(sortedGrades[sortedGrades.length - 1].grade);
      
      // Only calculate improvement if both grades are valid numbers
      if (!isNaN(firstGrade) && !isNaN(lastGrade)) {
        const improvement = lastGrade - firstGrade;
        
        if (improvement > biggestImprovement.improvement) {
          biggestImprovement = { subject, improvement };
        }
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

export const calculateDetailedSubjectAverages = (
  gradesP1: Grade[], 
  gradesP2: Grade[], 
  customGrades: Record<string, CustomGrade[]>
): DetailedSubjectAverage[] => {
  const uncalculateableSubjects = getUncalculateableSubjects([...gradesP1, ...gradesP2]);
  
  // Get all unique subjects
  const allSubjects = new Set([
    ...gradesP1.map(g => g.subject),
    ...gradesP2.map(g => g.subject),
    ...Object.keys(customGrades)
  ]);
  
  return Array.from(allSubjects).map(subject => {
    // Period 1 data
    const p1Grades = gradesP1.filter(g => g.subject === subject);
    const p1CustomGrades = customGrades[subject]?.filter(g => g.period_id === 1538 || !g.period_id) || [];
    const p1IsUncalculateable = p1Grades.some(grade => 
      !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects)
    );
    const p1RegularWeight = p1Grades.reduce((sum, grade) => sum + grade.weight, 0);
    const p1CustomWeight = p1CustomGrades.reduce((sum, grade) => sum + grade.weight, 0);
    const p1TotalWeight = p1RegularWeight + p1CustomWeight;
    const p1Average = p1IsUncalculateable ? 0 : calculateWeightedAverage(p1Grades, p1CustomGrades);
    
    // Period 2 data
    const p2Grades = gradesP2.filter(g => g.subject === subject);
    const p2CustomGrades = customGrades[subject]?.filter(g => g.period_id === 1539) || [];
    const p2IsUncalculateable = p2Grades.some(grade => 
      !isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects)
    );
    const p2RegularWeight = p2Grades.reduce((sum, grade) => sum + grade.weight, 0);
    const p2CustomWeight = p2CustomGrades.reduce((sum, grade) => sum + grade.weight, 0);
    const p2TotalWeight = p2RegularWeight + p2CustomWeight;
    const p2Average = p2IsUncalculateable ? 0 : calculateWeightedAverage(p2Grades, p2CustomGrades);
    
    // Overall data (both periods combined)
    const allGrades = [...p1Grades, ...p2Grades];
    const allCustomGrades = [...p1CustomGrades, ...p2CustomGrades];
    const overallIsUncalculateable = p1IsUncalculateable && p2IsUncalculateable;
    const overallTotalWeight = p1TotalWeight + p2TotalWeight;
    const overallAverage = overallIsUncalculateable ? 0 : calculateWeightedAverage(allGrades, allCustomGrades);
    
    return {
      subject,
      period1: {
        average: p1Average,
        hasMissingData: p1TotalWeight < 100,
        totalWeight: p1TotalWeight,
        isUncalculateable: p1IsUncalculateable
      },
      period2: {
        average: p2Average,
        hasMissingData: p2TotalWeight < 100,
        totalWeight: p2TotalWeight,
        isUncalculateable: p2IsUncalculateable
      },
      overall: {
        average: overallAverage,
        hasMissingData: overallTotalWeight < 200, // 100% for each period
        totalWeight: overallTotalWeight,
        isUncalculateable: overallIsUncalculateable
      }
    };
  }).sort((a, b) => {
    // Sort by overall average (descending), uncalculateable subjects to bottom
    if (a.overall.isUncalculateable && !b.overall.isUncalculateable) return 1;
    if (!a.overall.isUncalculateable && b.overall.isUncalculateable) return -1;
    return b.overall.average - a.overall.average;
  });
};
