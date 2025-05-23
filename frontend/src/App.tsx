
import { useState } from 'react';
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

const queryClient = new QueryClient();

type AppState = 
  | 'landing'
  | 'login'
  | 'onboarding-welcome'
  | 'onboarding-privacy'
  | 'onboarding-missing-data'
  | 'onboarding-loading'
  | 'dashboard'
  | 'missing-data-editor'
  | 'profile';

function AppContent() {
  const { user, isAuthenticated, isLoading, login, logout, userImage } = useAuth();
  const [appState, setAppState] = useState<AppState>('landing');

  // Handle authentication state changes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && appState === 'landing') {
    setAppState('dashboard');
  }

  if (!isAuthenticated && !['landing', 'login'].includes(appState)) {
    setAppState('landing');
  }

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const success = await login(username, password);
    if (success) {
      setAppState('onboarding-welcome');
    }
    return success;
  };

  const handleLogout = async () => {
    await logout();
    setAppState('landing');
  };

  switch (appState) {
    case 'landing':
      return (
        <LandingPage
          onGetStarted={() => setAppState('login')}
        />
      );

    case 'login':
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
          onNext={() => setAppState('onboarding-missing-data')}
          onBack={() => setAppState('onboarding-welcome')}
        />
      );

    case 'onboarding-missing-data':
      return (
        <OnboardingMissingData
          onEditMissingData={() => setAppState('missing-data-editor')}
          onSkip={() => setAppState('onboarding-loading')}
          onBack={() => setAppState('onboarding-privacy')}
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
          onEditMissingData={() => setAppState('missing-data-editor')}
          onProfile={() => setAppState('profile')}
        />
      );

    case 'missing-data-editor':
      return (
        <MissingDataEditor
          onBack={() => setAppState('dashboard')}
        />
      );

    case 'profile':
      return (
        <ProfilePage
          onBack={() => setAppState('dashboard')}
          onEditMissingData={() => setAppState('missing-data-editor')}
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
