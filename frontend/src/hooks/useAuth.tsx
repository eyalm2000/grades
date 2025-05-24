import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiService, UserInfo } from "@/lib/api";
import { Grade } from "@/types/grades";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  userImage: string | null;
  grades: Grade[];
  gradesPeriod1: Grade[];
  gradesPeriod2: Grade[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [getGradesPeriod1, setGradesPeriod1] = useState<Grade[]>([]);
  const [getGradesPeriod2, setGradesPeriod2] = useState<Grade[]>([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to get user info to check if the user is already authenticated
        const userInfo = await apiService.getUserInfo();
        if (userInfo) {
          setUser(userInfo);
          try {
            const userImageUrl = await apiService.getUserImage();
            setUserImage(userImageUrl);
          } catch (error) {
            console.error("Failed to fetch user image:", error);
          }
          // Fetch grades for both periods
          try {
            const [gradesP1Response, gradesP2Response] = await Promise.all([
              apiService.getGradesPeriod1(),
              apiService.getGradesPeriod2()
            ]);
            setGradesPeriod1(gradesP1Response.data);
            setGradesPeriod2(gradesP2Response.data);
          } catch (error) {
            console.error("Failed to fetch grades:", error);
          }
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("User not authenticated:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ username, password });
      
      if (response.success) {
        const userInfo = await apiService.getUserInfo();
        const userImageUrl = await apiService.getUserImage();
        setUser(userInfo);
        setUserImage(userImageUrl);
        // Fetch grades for both periods after login
        try {
          const [gradesP1Data, gradesP2Data] = await Promise.all([
            apiService.getGradesPeriod1(),
            apiService.getGradesPeriod2()
          ]);
          setGradesPeriod1(gradesP1Data.data);
          setGradesPeriod2(gradesP2Data.data);
        } catch (error) {
          console.error("Failed to fetch grades after login:", error);
        }
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      setUser(null);
      setUserImage(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userImage,
        grades: [...getGradesPeriod1, ...getGradesPeriod2],
        gradesPeriod1: getGradesPeriod1,
        gradesPeriod2: getGradesPeriod2,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
