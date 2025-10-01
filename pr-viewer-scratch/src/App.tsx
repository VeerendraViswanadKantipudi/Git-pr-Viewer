import { Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>PR Viewer</h1>
      <p>Sign in with GitHub to view your repositories and open PRs.</p>
      <p>
        <Link to="/auth">Sign in with GitHub</Link>
      </p>
    </div>
  );
}