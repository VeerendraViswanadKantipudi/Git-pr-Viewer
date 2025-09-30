import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useGitHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getGitHubAuthUrl = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liJnr2YKpLOMRy2O';
    const redirectUri = `${window.location.origin}/github-callback`;
    const scope = 'repo user';
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const exchangeCodeForToken = async (code: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: {
          action: 'exchange_code',
          code,
          userId: user.id,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Connected to GitHub",
        description: `Successfully connected as ${data.user.login}`,
      });

      return data;
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async (accessToken: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: {
          action: 'fetch_repositories',
          userId: user.id,
          accessToken,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Repositories synced",
        description: `Successfully synced ${data.count} repositories`,
      });

      return data;
    } catch (error) {
      console.error('Fetch repositories error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync repositories. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPullRequests = async (accessToken: string, repoFullName: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: {
          action: 'fetch_pull_requests',
          userId: user.id,
          accessToken,
          repoFullName,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Pull requests synced",
        description: `Successfully synced ${data.count} pull requests`,
      });

      return data;
    } catch (error) {
      console.error('Fetch pull requests error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync pull requests. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const commentOnPR = async (accessToken: string, repoFullName: string, prNumber: number, comment: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: {
          action: 'comment_on_pr',
          userId: user.id,
          accessToken,
          repoFullName,
          prNumber,
          comment,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Comment posted",
        description: "Successfully posted comment to pull request",
      });

      return data;
    } catch (error) {
      console.error('Comment on PR error:', error);
      toast({
        title: "Comment failed",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getGitHubAuthUrl,
    exchangeCodeForToken,
    fetchRepositories,
    fetchPullRequests,
    commentOnPR,
  };
};