import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, GitBranch, Star, Users, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PR Pilot
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <section className="py-20 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                GitHub Made Simple
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Manage your repositories and pull requests with ease. 
                Connect your GitHub account and streamline your development workflow.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  <Github className="h-5 w-5 mr-2" />
                  Sign In with GitHub
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to manage GitHub</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make repository and pull request management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-fit">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Repository Management</CardTitle>
                <CardDescription>
                  View all your repositories in one place with detailed statistics and information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full w-fit">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Pull Request Tracking</CardTitle>
                <CardDescription>
                  Monitor open pull requests across all repositories and manage them efficiently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-fit">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Quick Comments</CardTitle>
                <CardDescription>
                  Add comments to pull requests quickly with pre-filled templates and shortcuts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-fit">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Repository Insights</CardTitle>
                <CardDescription>
                  Get detailed insights about your repositories including stars, forks, and languages
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full w-fit">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Secure Authentication</CardTitle>
                <CardDescription>
                  Secure OAuth integration with GitHub ensures your data is protected and private
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full w-fit">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">GitHub Integration</CardTitle>
                <CardDescription>
                  Seamless integration with GitHub API for real-time data and direct interactions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <Card className="border-2 bg-gradient-to-br from-card to-muted/20 p-12">
            <CardContent className="space-y-6">
              <h2 className="text-4xl font-bold">Ready to get started?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join developers who are already using PR Pilot to streamline their GitHub workflow
              </p>
              <div>
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    <Github className="h-5 w-5 mr-2" />
                    Continue with GitHub
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-6 w-6" />
              <span className="font-semibold">PR Pilot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for developers, by developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
