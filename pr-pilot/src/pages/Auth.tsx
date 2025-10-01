import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user, signInWithGitHub } = useAuth();
  const navigate = useNavigate();

  // Handle OAuth hash redirect from Supabase (access_token in URL fragment)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .finally(() => {
          // Clean the hash from URL and go to dashboard
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/dashboard', { replace: true });
        });
    }
  }, [navigate]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGitHubSignIn = async () => {
    await signInWithGitHub();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-full">
              <Github className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PR Pilot
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your GitHub repositories and pull requests
            </p>
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in with your GitHub account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleGitHubSignIn} className="bg-gradient-to-r from-primary to-accent">
              <Github className="h-4 w-4 mr-2" />
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;