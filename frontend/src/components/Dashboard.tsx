import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { apiService, Grade } from '@/lib/api';
import { AverageCard } from './dashboard/AverageCard';
import { PeriodAverages } from './dashboard/PeriodAverages';
import { InsightsSection } from './dashboard/InsightsSection';
import { SubjectAveragesList } from './dashboard/SubjectAveragesList';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { LoadingState } from './dashboard/LoadingState';
import { GradesBySubject } from './dashboard/GradesBySubject';
import { Period, CustomGrade } from '@/types/grades';
import { calculateWeightedAverage, calculateSubjectAverages, getCustomGradesByPeriod, generateInsights, getUncalculateableSubjects, isSubjectCalculateable, calculateDetailedSubjectAverages } from '@/utils/gradeUtils';

interface DashboardProps {
  onEditMissingData: () => void;
  onProfile: () => void;
}

const STORAGE_KEY = 'grade-vista-custom-grades';

export function Dashboard({ onEditMissingData, onProfile }: DashboardProps) {
  const { user, userImage } = useAuth();
  const [gradesP1, setGradesP1] = useState<Grade[]>([]);
  const [gradesP2, setGradesP2] = useState<Grade[]>([]);
  const [customGrades, setCustomGrades] = useState<Record<string, CustomGrade[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('both');

  useEffect(() => {
    loadGrades();
    loadCustomGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const [p1Response, p2Response] = await Promise.all([
        apiService.getGradesPeriod1(),
        apiService.getGradesPeriod2()
      ]);
      
      setGradesP1(p1Response.data || []);
      setGradesP2(p2Response.data || []);
    } catch (error) {
      console.error('Failed to load grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomGrades = () => {
    const savedGrades = localStorage.getItem(STORAGE_KEY);
    if (savedGrades) {
      try {
        setCustomGrades(JSON.parse(savedGrades));
      } catch (e) {
        console.error('Failed to parse custom grades:', e);
      }
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  const insights = generateInsights(gradesP1, gradesP2, customGrades);
  
  // Get uncalculateable subjects for filtering
  const uncalculateableSubjects = getUncalculateableSubjects([...gradesP1, ...gradesP2]);
  
  // Filter out uncalculateable subjects from period calculations
  const calculableGradesP1 = gradesP1.filter(grade => 
    isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects)
  );
  const calculableGradesP2 = gradesP2.filter(grade => 
    isSubjectCalculateable(grade.subject, grade.period_id, uncalculateableSubjects)
  );

  const getGradesForPeriod = (): Grade[] => {
    switch (selectedPeriod) {
      case 'period1': return gradesP1;
      case 'period2': return gradesP2;
      case 'both': return [...gradesP1, ...gradesP2];
      default: return [];
    }
  };
  
  // Calculate averages including custom grades (only for calculable subjects)
  const p1CustomGrades = Object.entries(customGrades)
    .filter(([subject]) => {
      // Only include custom grades for subjects that are calculable in period 1
      return calculableGradesP1.some(grade => grade.subject === subject);
    })
    .flatMap(([subject, grades]) => 
      grades.filter(g => g.period_id === 1538 || !g.period_id)
    );
    
  const p2CustomGrades = Object.entries(customGrades)
    .filter(([subject]) => {
      // Only include custom grades for subjects that are calculable in period 2
      return calculableGradesP2.some(grade => grade.subject === subject);
    })
    .flatMap(([subject, grades]) => 
      grades.filter(g => g.period_id === 1539 || !g.period_id)
    );
  
  const p1Average = calculateWeightedAverage(calculableGradesP1, p1CustomGrades);
  const p2Average = calculateWeightedAverage(calculableGradesP2, p2CustomGrades);
  const overallAverage = calculateWeightedAverage([...calculableGradesP1, ...calculableGradesP2], [...p1CustomGrades, ...p2CustomGrades]);
  
  // Get subject averages for display (includes all subjects but calculations exclude uncalculateable)
  const subjectAverages = calculateSubjectAverages(getGradesForPeriod(), getCustomGradesByPeriod(customGrades, selectedPeriod), false);
  
  // Get detailed subject averages with period-specific data
  const detailedSubjectAverages = calculateDetailedSubjectAverages(gradesP1, gradesP2, customGrades);

  // Simplified animation variants
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <DashboardHeader user={user} userImage={userImage} onProfile={onProfile} />

      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="grid lg:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
          {/* Overall Average */}
          <motion.div variants={itemVariants}>
            <AverageCard 
              title="ממוצע כללי" 
              average={overallAverage} 
              subtitle="כל השנה" 
            />
          </motion.div>

          {/* Period Averages */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <PeriodAverages p1Average={p1Average} p2Average={p2Average} />
          </motion.div>
        </motion.div>

        {/* Insights */}
        <InsightsSection insights={insights} />

        {/* Subject Averages */}
        <SubjectAveragesList 
          detailedSubjectAverages={detailedSubjectAverages}
          onEditMissingData={onEditMissingData}
        />
        
        {/* All Grades By Subject */}
        <div className="mt-8">
          <GradesBySubject 
            grades={getGradesForPeriod()} 
            customGrades={getCustomGradesByPeriod(customGrades, selectedPeriod)} 
          />
        </div>
      </motion.div>
    </div>
  );
}
