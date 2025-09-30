import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, code, userId, accessToken, repoFullName, prNumber, comment } = await req.json();

    switch (action) {
      case 'exchange_code': {
        // Exchange authorization code for access token
        const clientId = Deno.env.get('GITHUB_CLIENT_ID');
        const clientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          console.error('GitHub token exchange error:', tokenData);
          return new Response(
            JSON.stringify({ error: tokenData.error_description || 'Failed to exchange code for token' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const githubUser: GitHubUser = await userResponse.json();
        console.log('GitHub user:', githubUser.login);

        // Update user profile with GitHub info
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            github_username: githubUser.login,
            github_avatar_url: githubUser.avatar_url,
            github_access_token: tokenData.access_token,
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Profile update error:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: githubUser,
            access_token: tokenData.access_token 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch_repositories': {
        if (!accessToken) {
          return new Response(
            JSON.stringify({ error: 'Access token required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch repositories from GitHub
        const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const repositories: GitHubRepository[] = await reposResponse.json();
        console.log(`Fetched ${repositories.length} repositories`);

        // Store repositories in database (batch upsert)
        const repoRows = repositories.map((repo) => ({
          id: repo.id,
          user_id: userId,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          default_branch: repo.default_branch,
          is_private: repo.private,
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
        }));

        if (repoRows.length > 0) {
          const { error: upsertError } = await supabaseClient
            .from('repositories')
            .upsert(repoRows, { onConflict: 'id' });
          if (upsertError) {
            console.error('Repository batch upsert error:', upsertError);
          }
        }

        return new Response(
          JSON.stringify({ success: true, count: repositories.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch_pull_requests': {
        if (!accessToken || !repoFullName) {
          return new Response(
            JSON.stringify({ error: 'Access token and repository name required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get repository ID from database
        const { data: repo, error: repoError } = await supabaseClient
          .from('repositories')
          .select('id')
          .eq('full_name', repoFullName)
          .eq('user_id', userId)
          .single();

        if (repoError || !repo) {
          return new Response(
            JSON.stringify({ error: 'Repository not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch pull requests from GitHub
        const prsResponse = await fetch(`https://api.github.com/repos/${repoFullName}/pulls?state=open&per_page=100`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const pullRequests: GitHubPullRequest[] = await prsResponse.json();
        console.log(`Fetched ${pullRequests.length} pull requests for ${repoFullName}`);

        // Store pull requests in database (batch upsert)
        const prRows = pullRequests.map((pr) => ({
          id: pr.id,
          repository_id: repo.id,
          user_id: userId,
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          html_url: pr.html_url,
          head_branch: pr.head.ref,
          base_branch: pr.base.ref,
          author_username: pr.user.login,
          author_avatar_url: pr.user.avatar_url,
        }));

        if (prRows.length > 0) {
          const { error: upsertError } = await supabaseClient
            .from('pull_requests')
            .upsert(prRows, { onConflict: 'id' });
          if (upsertError) {
            console.error('Pull request batch upsert error:', upsertError);
          }
        }

        return new Response(
          JSON.stringify({ success: true, count: pullRequests.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'comment_on_pr': {
        if (!accessToken || !repoFullName || !prNumber || !comment) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Post comment to GitHub
        const commentResponse = await fetch(`https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: comment }),
        });

        const commentData = await commentResponse.json();
        
        if (!commentResponse.ok) {
          console.error('GitHub comment error:', commentData);
          return new Response(
            JSON.stringify({ error: 'Failed to post comment' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, comment: commentData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});