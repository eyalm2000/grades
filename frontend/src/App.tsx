import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/LandingPage';
import { LoginPage } from '@/components/LoginPage';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';
import { OnboardingPrivacy } from '@/components/onboarding/OnboardingPrivacy';
import { OnboardingMissingData } from '@/components/onboarding/OnboardingMissingData';
import { OnboardingLoading } from '@/components/onboarding/OnboardingLoading';
import { Dashboard } from '@/components/Dashboard';
import { MissingDataEditor } from '@/components/MissingDataEditor';
import { ProfilePage } from '@/components/ProfilePage';
import { OnboardingUncalculateable } from '@/components/onboarding/OnboardingUncalculateable';
import { getUncalculateableSubjects } from './utils/gradeUtils';
import { UncalculateableSubject } from "@/types/grades";

const queryClient = new QueryClient();

type AppState = 
  | 'landing'
  | 'login'
  | 'onboarding-welcome'
  | 'onboarding-privacy'
  | 'onboarding-uncalculateable'
  | 'onboarding-missing-data'
  | 'onboarding-loading'
  | 'dashboard'
  | 'missing-data-editor'
  | 'profile';

function AppContent() {
  const auth = useAuth();
  const [appState, setAppState] = useState<AppState>('landing');
  const [editorReturnState, setEditorReturnState] = useState<AppState>('dashboard'); // Added editorReturnState
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  const { user, userImage } = auth;

  useEffect(() => {
    if (!auth.isLoading && !initialAuthCheckComplete) {
      setInitialAuthCheckComplete(true);
      if (auth.isAuthenticated && appState === 'landing') {
        setAppState('dashboard');
      } else if (!auth.isAuthenticated && !['landing', 'login'].includes(appState)) {
        setAppState('landing');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, appState, initialAuthCheckComplete]);

   useEffect(() => {
    if (initialAuthCheckComplete && !auth.isAuthenticated && !['landing', 'login'].includes(appState)) {
        setAppState('landing');
    }
  }, [auth.isAuthenticated, appState, initialAuthCheckComplete]);

  if (!initialAuthCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

   if (auth.isAuthenticated && appState === 'landing') {
     setAppState('dashboard');
  }

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
     const success = await auth.login(username, password);
    if (success) {
      setAppState('onboarding-welcome');
    }
    return success;
  };

  const handleLogout = async () => {
    await auth.logout();
    setAppState('landing');
  };

  switch (appState) {
    case 'landing':
      if (auth.isAuthenticated) {
        setTimeout(() => { setAppState('dashboard'); }, 0);
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      return (
        <LandingPage
          onGetStarted={() => setAppState('login')}
        />
      );

    case 'login':
      if (auth.isAuthenticated) {
        setTimeout(() => setAppState('dashboard'), 0);
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      return (
        <LoginPage
          onLogin={handleLogin}
          onBack={() => setAppState('landing')}
        />
      );

    case 'onboarding-welcome':
      return (
        <OnboardingWelcome
          userImage={userImage}
          firstName={user?.firstName || ''}
          onNext={() => setAppState('onboarding-privacy')}
        />
      );

    case 'onboarding-privacy':
      return (
        <OnboardingPrivacy
          onNext={() => {
            const uncalculateableSubjects = getUncalculateableSubjects(auth.grades);
            if (uncalculateableSubjects.length > 0) {
              setAppState('onboarding-uncalculateable');
            } else {
              setAppState('onboarding-missing-data');
            }
          }}
          onBack={() => setAppState('onboarding-welcome')}
        />
      );

    case 'onboarding-uncalculateable':
      return (
        <OnboardingUncalculateable
          uncalculateableSubjects={getUncalculateableSubjects(auth.grades) as UncalculateableSubject[]}
          onNext={() => setAppState('onboarding-missing-data')}
          onBack={() => setAppState('onboarding-privacy')}
        />
      );

    case 'onboarding-missing-data':
      return (
        <OnboardingMissingData
          onEditMissingData={() => {
            setEditorReturnState('onboarding-missing-data'); // Changed from 'onboarding-loading'
            setAppState('missing-data-editor');
          }}
          onSkip={() => setAppState('onboarding-loading')}
          onBack={() => {
            const uncalculateableSubjects = getUncalculateableSubjects(auth.grades);
            if (uncalculateableSubjects.length > 0) {
              setAppState('onboarding-uncalculateable');
            } else {
              setAppState('onboarding-privacy');
            }
          }}
        />
      );

    case 'onboarding-loading':
      return (
        <OnboardingLoading
          onComplete={() => setAppState('dashboard')}
        />
      );

    case 'dashboard':
      return (
        <Dashboard
          onEditMissingData={() => {
            setEditorReturnState('dashboard');
            setAppState('missing-data-editor');
          }}
          onProfile={() => setAppState('profile')}
        />
      );

    case 'missing-data-editor':
      return (
        <MissingDataEditor
          onBack={() => {
            setAppState(editorReturnState);
            // Optionally reset editorReturnState here if needed for general cases
            // setEditorReturnState('dashboard'); 
          }}
        />
      );

    case 'profile':
      return (
        <ProfilePage
          onBack={() => setAppState('dashboard')}
          onEditMissingData={() => {
            setEditorReturnState('profile');
            setAppState('missing-data-editor');
          }}
          onLogout={handleLogout}
        />
      );

    default:
      return <LandingPage onGetStarted={() => setAppState('login')} />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
