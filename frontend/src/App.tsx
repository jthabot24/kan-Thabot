import { FormEvent, useState } from "react";
import { clearCredentials, hasCredentials, setCredentials } from "./api/client";
import { getMe } from "./api/procedures";
import { Board } from "./features/board";

export function App() {
  const [authenticated, setAuthenticated] = useState(hasCredentials);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState(() => Number(localStorage.getItem("board_project_id") || 1));
  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setCredentials(username, password);
    try {
      await getMe();
      setAuthenticated(true);
    } catch (cause) {
      clearCredentials();
      setLoginError(cause instanceof Error ? cause.message : "Unable to log in");
    }
  };
  if (!authenticated) {
    return (
      <main className="login-shell">
        <h1>Kanboard</h1>
        <form onSubmit={(event) => void login(event)}>
          <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {loginError && <p role="alert">{loginError}</p>}
          <button type="submit">Log in</button>
        </form>
      </main>
    );
  }
  return (
    <main>
      <header className="app-header">
        <h1>Kanboard</h1>
        <button type="button" onClick={() => { clearCredentials(); setAuthenticated(false); }}>Log out</button>
      </header>
      <label className="project-picker">Project ID
        <input type="number" min="1" value={projectId} onChange={(event) => {
          const value = Number(event.target.value);
          setProjectId(value);
          localStorage.setItem("board_project_id", String(value));
        }} />
      </label>
      <Board projectId={projectId} pollInterval={10} />
    </main>
  );
}
