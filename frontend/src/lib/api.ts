const API_BASE_URL = 'https://grades.eyalm.tech';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserInfo {
  studentLoginId: number;
  studentId: number;
  id: string;
  userId: string;
  schoolName: string;
  mustChangePassword: boolean;
  userType: number;
  userImageToken: string;
  fullLog: boolean;
  firstName: string;
  lastName: string;
  isTeacher: number;
  isWebTopUser: boolean;
  schoolId: number;
  studentEmail: string | null;
  studentGender: boolean;
  firstInstitutionCode: number;
  institutionCode: number;
  isReseted: boolean;
  lastResetDate: string;
  lastPasswordChangeDate: string;
  lastLoginDate: string;
  classCode: string;
  classNumber: number;
  isSchoolyAdministrator: boolean;
  token: string;
  cellphone: string;
  browserLanguage: string | null;
  initialUserType: number;
  fullName: string;
}

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

export interface GradesResponse {
  status: boolean;
  data: Grade[];
  message: string | null;
  errorId: string | null;
  errorDescription: string | null;
  errorHTML: string | null;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getUserInfo(): Promise<UserInfo> {
    return this.makeRequest<UserInfo>('/user/info');
  }

  async getUserImage(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/user/image`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user image');
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async getGradesPeriod1(): Promise<GradesResponse> {
    return this.makeRequest<GradesResponse>('/grades/period1');
  }

  async getGradesPeriod2(): Promise<GradesResponse> {
    return this.makeRequest<GradesResponse>('/grades/period2');
  }
}

export const apiService = new ApiService();
