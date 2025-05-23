
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
import { calculateWeightedAverage, calculateSubjectAverages, getCustomGradesByPeriod, generateInsights } from '@/utils/gradeUtils';

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

  const getGradesForPeriod = (): Grade[] => {
    switch (selectedPeriod) {
      case 'period1': return gradesP1;
      case 'period2': return gradesP2;
      case 'both': return [...gradesP1, ...gradesP2];
      default: return [];
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  const insights = generateInsights(gradesP1, gradesP2, customGrades);
  
  // Calculate averages including custom grades
  const p1CustomGrades = Object.values(
    Object.fromEntries(
      Object.entries(customGrades)
        .map(([subject, grades]) => [
          subject, 
          grades.filter(g => g.period_id === 1538 || !g.period_id)
        ])
    )
  ).flat();
  const p2CustomGrades = Object.values(
    Object.fromEntries(
      Object.entries(customGrades)
        .map(([subject, grades]) => [
          subject, 
          grades.filter(g => g.period_id === 1539 || !g.period_id)
        ])
    )
  ).flat();
  
  const p1Average = calculateWeightedAverage(gradesP1, p1CustomGrades);
  const p2Average = calculateWeightedAverage(gradesP2, p2CustomGrades);
  const overallAverage = calculateWeightedAverage([...gradesP1, ...gradesP2], Object.values(customGrades).flat());
  
  const subjectAverages = calculateSubjectAverages(getGradesForPeriod(), getCustomGradesByPeriod(customGrades, selectedPeriod));

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
          subjectAverages={subjectAverages}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
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
