
export interface Grade {
  evaluationID: number;
  title: string;
  date: string;
  type: string;
  typeCode: number;
  teacherFirstName: string;
  teacherLastName: string;
  grade: number;
  gradeTranslation: string;
  subject: string;
  level: string;
  weight: number;
  remark: string | null;
  assessment: string | null;
  assessmentId: string | null;
  components: any[];
  componentComment: string | null;
  componentAssement: string | null;
  reExaminationRequestLastDate: string | null;
  reExaminationDate: string | null;
  reExaminationNote: string | null;
  isDeleted: number;
  period_id: number;
  componentsWeightInPer: boolean;
}

export interface CustomGrade {
  id: string;
  title: string;
  grade: number;
  weight: number;
  type: string;
  subject: string;
  period_id?: number; // Added period_id as optional
}

export interface SubjectAverage {
  subject: string;
  average: number;
  hasMissingData: boolean;
  totalWeight: number;
}

export type Period = 'both' | 'period1' | 'period2';
