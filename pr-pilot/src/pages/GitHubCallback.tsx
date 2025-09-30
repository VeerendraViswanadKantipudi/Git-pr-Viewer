import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useGitHub } from '@/hooks/useGitHub';
import { Github, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const GitHubCallback = () => {
  const { user } = useAuth();
  const { exchangeCodeForToken } = useGitHub();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing GitHub authorization...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('GitHub authorization was cancelled or failed');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received from GitHub');
      return;
    }

    if (!user) {
      setStatus('error');
      setMessage('User not authenticated');
      return;
    }

    handleCallback(code);
  }, [searchParams, user]);

  const handleCallback = async (code: string) => {
    try {
      await exchangeCodeForToken(code);
      setStatus('success');
      setMessage('Successfully connected to GitHub!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      console.error('GitHub callback error:', error);
      setStatus('error');
      setMessage('Failed to connect to GitHub. Please try again.');
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-full">
                <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            )}
            {status === 'error' && (
              <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Connecting to GitHub...'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Github className="h-4 w-4" />
              <span>Authenticating with GitHub...</span>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard...
              </p>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading your repositories</span>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You can try connecting again from the dashboard.
              </p>
              <a 
                href="/dashboard" 
                className="text-sm text-primary hover:underline"
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubCallback;