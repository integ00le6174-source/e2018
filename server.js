const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const PAPERS_FILE = path.join(DATA_DIR, "papers.json");
const MAX_PDF_BYTES = 60 * 1024 * 1024;
const MAX_REQUEST_BYTES = 90 * 1024 * 1024;
const SESSION_COOKIE = "report_session";
const SESSION_HOURS = 12;
const REPORT_PASSWORD = process.env.REPORT_PASSWORD || "change-me";
const DELETE_PASSWORD = process.env.DELETE_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || REPORT_PASSWORD;

const PUBLIC_PATHS = new Set(["/login.html", "/login.js", "/styles.css", "/background.js"]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function ensureStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(PAPERS_FILE)) {
    fs.writeFileSync(PAPERS_FILE, "[]\n");
  }
}

function readPapers() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(PAPERS_FILE, "utf8"));
}

function writePapers(papers) {
  ensureStorage();
  fs.writeFileSync(PAPERS_FILE, `${JSON.stringify(papers, null, 2)}\n`);
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function createSessionToken() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const nonce = crypto.randomBytes(18).toString("base64url");
  const payload = base64url(JSON.stringify({ expiresAt, nonce }));
  return `${payload}.${sign(payload)}`;
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf("=");
        return [pair.slice(0, index), decodeURIComponent(pair.slice(index + 1))];
      })
  );
}

function isAuthenticated(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !token.includes(".")) return false;

  const [payload, signature] = token.split(".");
  if (!timingSafeEqual(signature, sign(payload))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(session.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

function cookieOptions(req) {
  const secure = req.headers["x-forwarded-proto"] === "https";
  return [
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${SESSION_HOURS * 60 * 60}`,
    secure ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function redirectToLogin(res) {
  res.writeHead(302, { Location: "/login.html" });
  res.end();
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_REQUEST_BYTES) {
        reject(new Error("PDFのサイズが大きすぎます。60MB以下にしてください。"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sanitizeFileName(name) {
  const ext = path.extname(name || "").toLowerCase();
  const base = path
    .basename(name || "report.pdf", ext)
    .normalize("NFKC")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "report";

  return `${base}${ext || ".pdf"}`;
}

function nextPaperId(papers) {
  const year = new Date().getFullYear();
  const prefix = `rep-${year}-`;
  const max = papers.reduce((highest, paper) => {
    if (!String(paper.id || "").startsWith(prefix)) return highest;
    const number = Number(String(paper.id).slice(prefix.length));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 0);

  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function resolveOwnedFile(file) {
  const absolutePath = path.normalize(path.join(ROOT, String(file || "")));
  const allowedRoots = [path.normalize(UPLOAD_DIR), path.normalize(path.join(ROOT, "pdfs"))];
  return allowedRoots.some((root) => absolutePath.startsWith(`${root}${path.sep}`)) ? absolutePath : null;
}

async function handleLogin(req, res) {
  try {
    const payload = JSON.parse(await readRequestBody(req));
    if (!timingSafeEqual(payload.password || "", REPORT_PASSWORD)) {
      sendJson(res, 401, { error: "パスワードが違います。" });
      return;
    }

    sendJson(res, 200, { ok: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken())}; ${cookieOptions(req)}`,
    });
  } catch {
    sendJson(res, 400, { error: "ログインできませんでした。" });
  }
}

async function handleCreatePaper(req, res) {
  try {
    const rawBody = await readRequestBody(req);
    const payload = JSON.parse(rawBody);
    const fileBuffer = Buffer.from(String(payload.fileBase64 || ""), "base64");

    if (!payload.title || !String(payload.title).trim()) {
      sendJson(res, 400, { error: "タイトルを入力してください。" });
      return;
    }

    if (!payload.fileName || path.extname(payload.fileName).toLowerCase() !== ".pdf") {
      sendJson(res, 400, { error: "PDFファイルを選択してください。" });
      return;
    }

    if (fileBuffer.length === 0 || fileBuffer.subarray(0, 4).toString("ascii") !== "%PDF") {
      sendJson(res, 400, { error: "PDFとして読み込めませんでした。" });
      return;
    }

    if (fileBuffer.length > MAX_PDF_BYTES) {
      sendJson(res, 400, { error: "PDFのサイズが大きすぎます。60MB以下にしてください。" });
      return;
    }

    const papers = readPapers();
    const safeName = sanitizeFileName(payload.fileName);
    const fileName = `${Date.now()}-${safeName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, fileBuffer);

    const paper = {
      id: nextPaperId(papers),
      title: String(payload.title).trim(),
      authors: String(payload.authors || "").trim() || "Author unknown",
      date: String(payload.date || "").trim() || new Date().toISOString().slice(0, 10),
      category: String(payload.category || "").trim() || "Uncategorized",
      version: String(payload.version || "").trim() || "v1",
      abstract: String(payload.abstract || "").trim(),
      keywords: String(payload.keywords || "")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      file: `uploads/${fileName}`,
    };

    papers.unshift(paper);
    writePapers(papers);
    sendJson(res, 201, paper);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "PDFを追加できませんでした。" });
  }
}

async function handleDeletePaper(req, res, id) {
  try {
    const payload = JSON.parse(await readRequestBody(req));

    if (!DELETE_PASSWORD) {
      sendJson(res, 403, { error: "削除用パスワードが設定されていません。" });
      return;
    }

    if (!timingSafeEqual(payload.deletePassword || "", DELETE_PASSWORD)) {
      sendJson(res, 403, { error: "削除用パスワードが違います。" });
      return;
    }

    if (!timingSafeEqual(payload.confirmId || "", id)) {
      sendJson(res, 400, { error: "確認用IDが一致しません。" });
      return;
    }

    const papers = readPapers();
    const index = papers.findIndex((paper) => paper.id === id);
    if (index === -1) {
      sendJson(res, 404, { error: "削除対象が見つかりません。" });
      return;
    }

    const [paper] = papers.splice(index, 1);
    const filePath = resolveOwnedFile(paper.file);

    if (filePath && fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }

    writePapers(papers);
    sendJson(res, 200, { ok: true, deletedId: id });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "削除できませんでした。" });
  }
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const absolutePath = path.normalize(path.join(ROOT, requestedPath));

  if (!absolutePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(absolutePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(absolutePath).toLowerCase()] || "application/octet-stream",
    });
    res.end(content);
  });
}

ensureStorage();

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  const pathname = requestUrl.pathname;

  if (req.method === "POST" && pathname === "/api/login") {
    handleLogin(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    sendJson(res, 200, { ok: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    });
    return;
  }

  if (req.method === "GET" && (PUBLIC_PATHS.has(pathname) || pathname === "/login" || pathname.startsWith("/assets/"))) {
    req.url = pathname === "/login" ? "/login.html" : req.url;
    serveStatic(req, res);
    return;
  }

  if (!isAuthenticated(req)) {
    if (pathname.startsWith("/api/")) {
      sendJson(res, 401, { error: "ログインしてください。" });
      return;
    }
    redirectToLogin(res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/papers") {
    sendJson(res, 200, readPapers());
    return;
  }

  if (req.method === "POST" && pathname === "/api/papers") {
    handleCreatePaper(req, res);
    return;
  }

  const deleteMatch = pathname.match(/^\/api\/papers\/([^/]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    handleDeletePaper(req, res, decodeURIComponent(deleteMatch[1]));
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, HOST, () => {
  console.log(`My Report Archive is running at http://${HOST}:${PORT}`);
  if (REPORT_PASSWORD === "change-me") {
    console.log("Using default password: change-me");
    console.log("Set REPORT_PASSWORD before publishing this site.");
  }
  if (!DELETE_PASSWORD) {
    console.log("DELETE_PASSWORD is not set. Delete actions are disabled.");
  }
});
