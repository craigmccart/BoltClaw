/**
 * Shown instead of the dashboard when the page has no API token.
 *
 * This happens when the dashboard is opened at a bare address
 * (http://localhost:3000) rather than the authenticated URL that BoltClaw
 * prints when it starts.
 */
export function TokenRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div
        className="max-w-xl w-full rounded-2xl px-6 py-6"
        style={{
          background: "rgba(127,29,29,0.25)",
          border: "1px solid rgba(220,38,38,0.3)",
        }}
      >
        <h1 className="text-xl font-semibold mb-3" style={{ color: "#fecaca" }}>
          BoltClaw needs its access token
        </h1>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#fca5a5" }}>
          This page was opened without a token, so it cannot talk to BoltClaw.
          The token stops other programs on your machine from reading or
          changing your agent config.
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#fca5a5" }}>
          Look in the terminal where BoltClaw is running and open the line that
          starts with <strong>Authenticated URL</strong>. If you are using
          Docker, run <code>docker logs boltclaw-dashboard</code> to see it.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#fca5a5" }}>
          You only need to do this once per browser tab.
        </p>
      </div>
    </div>
  );
}
