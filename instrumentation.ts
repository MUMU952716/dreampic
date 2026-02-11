const CANONICAL_HOST = "https://www.dreampic.site";

function normalizeAuthUrl() {
  const u = process.env.AUTH_URL?.replace(/\/$/, "");
  if (u === "https://dreampic.site") process.env.AUTH_URL = CANONICAL_HOST;
  const nu = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (nu === "https://dreampic.site") process.env.NEXTAUTH_URL = CANONICAL_HOST;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    normalizeAuthUrl();
  }
}
