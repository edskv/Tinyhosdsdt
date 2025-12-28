// pages/api/emails.js

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, page = 1, limit = 10 } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  const [user, domain] = email.split("@");
  if (!user || !domain) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const tinyhostUrl =
      `https://tinyhost.shop/api/email/${encodeURIComponent(domain)}/${encodeURIComponent(user)}/` +
      `?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;

    const tinyRes = await fetch(tinyhostUrl);

    if (!tinyRes.ok) {
      const text = await tinyRes.text();
      return res.status(tinyRes.status).json({
        error: "Tinyhost API error",
        detail: text,
      });
    }

    const data = await tinyRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error calling tinyhost API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
