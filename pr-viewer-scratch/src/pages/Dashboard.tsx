import { useAuth } from "@/state/useAuth";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.email ?? user.id}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}