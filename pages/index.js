// pages/index.js
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [foundCode, setFoundCode] = useState("");

  function extractCode(text) {
    if (!text) return "";
    const match = text.match(/\b(\d{4,8})\b/);
    return match ? match[1] : "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSelectedEmail(null);
    setFoundCode("");

    if (!email) {
      setError("Bitte eine E-Mail-Adresse eingeben.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        email,
        page: "1",
        limit: "20",
      });

      const res = await fetch("/api/emails?" + params.toString());
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Laden.");
        setEmails([]);
      } else if (!data.emails || data.emails.length === 0) {
        setEmails([]);
        setError("Keine E-Mails gefunden.");
      } else {
        setEmails(data.emails);
      }
    } catch (err) {
      console.error(err);
      setError("Netzwerkfehler beim Abrufen der E-Mails.");
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectEmail(mail) {
    setSelectedEmail(mail);
    setFoundCode("");
  }

  function handleFindCode() {
    if (!selectedEmail) return;
    const text =
      (selectedEmail.subject || "") +
      " " +
      (selectedEmail.body || "") +
      " " +
      (selectedEmail.bodyPreview || "");
    const code = extractCode(text);
    setFoundCode(code || "Kein Code (4–8 Ziffern) gefunden.");
  }

  return (
    <div className="page">
      <main className="card">
        <div className="header-pill">
          <span className="pill-icon">📬</span>
          <span className="pill-text">Tinyhost Mail Viewer</span>
        </div>

        <h1 className="title">Tinyhost Inbox ansehen</h1>
        <p className="subtitle">
          Gib eine <strong>tinyhost</strong>-E-Mail ein (z.B. die von der
          Startseite generierte Adresse) und sieh dir die empfangenen Mails an.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="email" className="label">
            E-Mail-Adresse
          </label>
          <div className="input-row">
            <input
              id="email"
              type="email"
              placeholder="user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Lädt..." : "Posteingang laden"}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="layout">
          <div className="list">
            <h2 className="section-title">E-Mail-Liste</h2>
            {loading && <p>Bitte warten, E-Mails werden geladen ...</p>}
            {!loading && emails.length === 0 && !error && (
              <p>Noch keine E-Mails geladen.</p>
            )}
            <ul className="email-list">
              {emails.map((mail) => (
                <li
                  key={mail.id}
                  className={
                    "email-item" +
                    (selectedEmail && selectedEmail.id === mail.id
                      ? " email-item-active"
                      : "")
                  }
                  onClick={() => handleSelectEmail(mail)}
                >
                  <div className="email-subject">
                    {mail.subject || "(kein Betreff)"}
                  </div>
                  <div className="email-meta">
                    <span>{mail.sender || "Unbekannter Absender"}</span>
                    <span>
                      {mail.date
                        ? new Date(mail.date).toLocaleString()
                        : "kein Datum"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail">
            <h2 className="section-title">Details & Code-Suche</h2>
            {!selectedEmail && (
              <p>Wähle eine Mail links aus, um Details zu sehen.</p>
            )}
            {selectedEmail && (
              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-label">Betreff:</span>
                  <span>{selectedEmail.subject || "(kein Betreff)"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Von:</span>
                  <span>{selectedEmail.sender || "Unbekannt"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Datum:</span>
                  <span>
                    {selectedEmail.date
                      ? new Date(selectedEmail.date).toLocaleString()
                      : "kein Datum"}
                  </span>
                </div>
                <div className="detail-body">
                  <span className="detail-label">Inhalt:</span>
                  <pre>{selectedEmail.body || "(kein Textkörper)"}</pre>
                </div>

                <div className="code-finder">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleFindCode}
                  >
                    4–8-stelligen Code in dieser Mail suchen
                  </button>
                  {foundCode && (
                    <div className="code-output">
                      <span className="detail-label">Gefundener Code:</span>
                      <span className="code-value">{foundCode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="footnote">
          Hinweis: Tinyhost ist ein Dienst für temporäre E-Mails. Bitte nutze ihn
          verantwortungsvoll und im Rahmen der Nutzungsbedingungen anderer
          Plattformen. Diese Demo ist nur zum Testen/Gelerntwerden gedacht.
        </p>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(
            circle at top left,
            #7b5cff,
            #5b3fd6 40%,
            #2c165c 100%
          );
        }
        .card {
          width: 100%;
          max-width: 960px;
          background: #f9fafb;
          border-radius: 24px;
          padding: 24px 24px 28px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.4);
        }
        .header-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 18px;
        }
        .pill-icon {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pill-text {
          letter-spacing: 0.03em;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 4px;
          color: #111827;
        }
        .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 18px;
        }
        .form {
          margin-bottom: 16px;
        }
        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #111827;
        }
        .input-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .input {
          flex: 1;
          min-width: 220px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4);
          background: #ffffff;
        }
        .button {
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.5);
          white-space: nowrap;
          transition: transform 0.1s ease, box-shadow 0.1s ease,
            filter 0.1s ease;
        }
        .button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.03);
          box-shadow: 0 14px 26px rgba(79, 70, 229, 0.6);
        }
        .button:disabled {
          opacity: 0.7;
          cursor: default;
          box-shadow: none;
        }
        .button-secondary {
          border: none;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          background: #e5e7eb;
          color: #111827;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.1s ease, transform 0.1s ease;
        }
        .button-secondary:hover {
          background: #d4d4d8;
          transform: translateY(-1px);
        }
        .error {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(248, 113, 113, 0.12);
          color: #b91c1c;
          font-size: 13px;
        }
        .layout {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1.1fr 1.3fr;
          gap: 16px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111827;
        }
        .list,
        .detail {
          background: white;
          border-radius: 18px;
          padding: 12px 12px 14px;
          box-shadow: 0 10px 25px rgba(148, 163, 184, 0.35);
          min-height: 220px;
        }
        .email-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 320px;
          overflow-y: auto;
        }
        .email-item {
          padding: 8px 8px;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: background 0.15s ease, transform 0.05s ease;
        }
        .email-item:hover {
          background: #eef2ff;
        }
        .email-item-active {
          background: #e0e7ff;
        }
        .email-subject {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }
        .email-meta {
          font-size: 12px;
          color: #6b7280;
          display: flex;
          justify-content: space-between;
          gap: 6px;
        }
        .detail-card {
          font-size: 13px;
        }
        .detail-row {
          margin-bottom: 6px;
          display: flex;
          gap: 4px;
        }
        .detail-label {
          font-weight: 700;
          color: #111827;
          margin-right: 4px;
        }
        .detail-body {
          margin-top: 8px;
        }
        .detail-body pre {
          margin-top: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          white-space: pre-wrap;
          background: #f9fafb;
          padding: 8px;
          border-radius: 10px;
          max-height: 260px;
          overflow-y: auto;
        }
        .code-finder {
          margin-top: 10px;
        }
        .code-output {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.08);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .code-value {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .footnote {
          margin-top: 16px;
          font-size: 11px;
          color: #6b7280;
          text-align: center;
        }

        @media (max-width: 800px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .card {
            padding: 18px 14px 20px;
          }
          .title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}