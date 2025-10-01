import { Navigate } from "react-router-dom";
import { useAuth } from "@/state/useAuth";

export default function Auth() {
  const { user, signInWithGitHub } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div style={{ padding: 24 }}>
      <h2>Sign in</h2>
      <button onClick={signInWithGitHub}>Sign in with GitHub</button>
    </div>
  );
}