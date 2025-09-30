import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useGitHub } from '@/hooks/useGitHub';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Github, 
  GitBranch, 
  Star, 
  GitFork, 
  MessageSquare, 
  ExternalLink, 
  RefreshCw,
  User,
  LogOut,
  Settings
} from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  is_private: boolean;
  stars_count: number;
  forks_count: number;
  language: string;
}

interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  head_branch: string;
  base_branch: string;
  author_username: string;
  author_avatar_url: string;
}

interface Profile {
  github_username: string;
  github_avatar_url: string;
  github_access_token: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { loading, fetchRepositories, fetchPullRequests, commentOnPR, getGitHubAuthUrl } = useGitHub();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [comment, setComment] = useState('hello world');
  const [loadingData, setLoadingData] = useState(true);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      } else {
        setProfile(profileData);
      }

      // Load repositories
      const { data: reposData, error: reposError } = await supabase
        .from('repositories')
        .select('*')
        .eq('user_id', user.id)
        .order('stars_count', { ascending: false });

      if (reposError) {
        console.error('Repositories error:', reposError);
      } else {
        setRepositories(reposData || []);
      }

    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleConnectGitHub = () => {
    const url = getGitHubAuthUrl();
    window.location.href = url;
  };

  const handleSyncRepositories = async () => {
    if (!profile?.github_access_token) return;
    
    try {
      await fetchRepositories(profile.github_access_token);
      await loadUserData();
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const handleLoadPullRequests = async (repoFullName: string) => {
    if (!profile?.github_access_token) return;
    
    setSelectedRepo(repoFullName);
    
    try {
      await fetchPullRequests(profile.github_access_token, repoFullName);
      
      // Load PRs from database
      const repo = repositories.find(r => r.full_name === repoFullName);
      if (repo) {
        const { data: prsData, error } = await supabase
          .from('pull_requests')
          .select('*')
          .eq('repository_id', repo.id)
          .eq('state', 'open')
          .order('number', { ascending: false });

        if (error) {
          console.error('Load PRs error:', error);
        } else {
          setPullRequests(prsData || []);
        }
      }
    } catch (error) {
      console.error('Load PRs error:', error);
    }
  };

  const handleComment = async (prNumber: number) => {
    if (!profile?.github_access_token || !selectedRepo) return;
    
    try {
      await commentOnPR(profile.github_access_token, selectedRepo, prNumber, comment);
      setComment('hello world'); // Reset to default
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <Github className="h-6 w-6" />
                <span className="text-xl font-bold">PR Pilot</span>
              </Link>
              {profile?.github_username && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <img 
                    src={profile.github_avatar_url} 
                    alt={profile.github_username}
                    className="w-4 h-4 rounded-full"
                  />
                  {profile.github_username}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSyncRepositories} disabled={!profile?.github_access_token || loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync Repos
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* GitHub Connection */}
        {!profile?.github_username && (
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center">
              <Github className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Connect Your GitHub Account</CardTitle>
              <CardDescription>
                Connect your GitHub account to view repositories and manage pull requests
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleConnectGitHub} className="bg-gradient-to-r from-primary to-accent">
                <Github className="h-4 w-4 mr-2" />
                Connect GitHub
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Repositories */}
        {profile?.github_username && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Repositories</h2>
              <Badge variant="outline">{repositories.length} repositories</Badge>
            </div>

            {repositories.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No repositories found</p>
                  <Button onClick={handleSyncRepositories} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Sync Repositories
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                  <Card key={repo.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg line-clamp-1">{repo.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{repo.description || 'No description'}</CardDescription>
                        </div>
                        {repo.is_private && <Badge variant="secondary">Private</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-accent"></div>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stars_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {repo.forks_count}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadPullRequests(repo.full_name)}
                            disabled={loading}
                          >
                            <GitBranch className="h-4 w-4 mr-2" />
                            View PRs
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pull Requests */}
        {selectedRepo && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Pull Requests for {selectedRepo}</h2>
              <Badge variant="outline">{pullRequests.length} open PRs</Badge>
            </div>

            {pullRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No open pull requests found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pullRequests.map((pr) => (
                  <Card key={pr.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">#{pr.number} {pr.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <img 
                              src={pr.author_avatar_url} 
                              alt={pr.author_username}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>by {pr.author_username}</span>
                            <span>•</span>
                            <span>{pr.head_branch} → {pr.base_branch}</span>
                          </div>
                        </div>
                        <Badge>{pr.state}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pr.body && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{pr.body}</p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Comment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Comment to PR #{pr.number}</DialogTitle>
                                <DialogDescription>
                                  Post a comment to this pull request
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Write your comment..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  rows={4}
                                />
                                <Button 
                                  onClick={() => handleComment(pr.number)}
                                  disabled={!comment.trim() || loading}
                                  className="w-full"
                                >
                                  {loading ? "Posting..." : "Post Comment"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm" asChild>
                            <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on GitHub
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;