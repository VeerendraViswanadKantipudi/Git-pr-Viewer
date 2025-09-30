# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ded87351-b94c-4389-b189-d5a95fdb34a5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ded87351-b94c-4389-b189-d5a95fdb34a5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment setup (Render + Supabase)

Create a `.env` from `.env.example` (do not commit real secrets):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GITHUB_CLIENT_ID=YOUR_PR_VIEWER_OAUTH_APP_CLIENT_ID
```

### Supabase
- Authentication → Providers → GitHub (enable, set Client ID/Secret of your “Supabase Login” app)
- Authentication → URL Configuration
  - Site URL: https://<your-site>
  - Allowed Redirect URLs: https://<your-site>/auth
- Functions → `github-oauth` → Secrets
  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (of your “PR Viewer” app)
  - Redeploy the function after saving

### GitHub OAuth apps (2 total)
- Supabase Login app
  - Callback: `https://<your-project-ref>.supabase.co/auth/v1/callback`
  - Enter Client ID/Secret in Supabase Providers
- PR Viewer app (Connect GitHub)
  - Callback: `https://<your-site>/github-callback`
  - Client ID in frontend (`VITE_GITHUB_CLIENT_ID`); ID/Secret in function secrets

### Render (Static Site)
- Root Directory: `pr-pilot`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Env vars: set the three `VITE_...` vars above
- After any env change: Manual Deploy → Clear build cache & deploy

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
