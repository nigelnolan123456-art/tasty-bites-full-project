// Tasty Bites backend: zero dependencies, needs Node.js 18+.
// Run:  node server.js     (optional: ADMIN_PASSWORD=yourpass PORT=3000 node server.js)
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const PORT = process.env.PORT || 3000;
const PASS = process.env.ADMIN_PASSWORD || "admin123";
const FILE = path.join(__dirname, "data.json");

const SEED = {
  config: { name: "Tasty Bites", heading: "Hungry? Pick your favourite.", sub: "Fresh food, made to order. Sold-out items are greyed out.", accent: "#e4572e", cur: "₹", foot: "© Tasty Bites · Front-end demo" },
  items: [
    ["Classic Burger", 199, "🍔", "Juicy patty, cheese, lettuce, house sauce.", 1],
    ["Margherita Pizza", 349, "🍕", "Wood-fired base, mozzarella, fresh basil.", 1],
    ["Chicken Biryani", 279, "🍛", "Fragrant basmati rice with spiced chicken.", 0],
    ["Veg Noodles", 169, "🍜", "Stir-fried noodles with crunchy veggies.", 1],
    ["Tacos (2 pcs)", 149, "🌮", "Crispy shells, salsa, and creamy filling.", 1],
    ["French Fries", 99, "🍟", "Golden, salted, and extra crispy.", 0],
    ["Sushi Platter", 449, "🍣", "Assorted rolls with soy and wasabi.", 1],
    ["Garden Salad", 129, "🥗", "Greens, tomato, cucumber, light dressing.", 1],
    ["Chocolate Donut", 79, "🍩", "Soft, glazed, and loaded with chocolate.", 1],
    ["Ice Cream Sundae", 119, "🍨", "Three scoops with sauce and sprinkles.", 0],
    ["Fresh Orange Juice", 89, "🍊", "Squeezed fresh, no added sugar.", 1],
    ["Iced Coffee", 109, "🧋", "Cold brew over ice with a splash of milk.", 1],
  ].map((a, i) => ({ id: "i" + (i + 1), n: a[0], p: a[1], e: a[2], d: a[3], s: !!a[4], o: i + 1 })),
};

let db;
try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); }
catch { db = SEED; save(); }
if (!db || typeof db !== "object") db = SEED;
if (!db.config || typeof db.config !== "object") db.config = SEED.config;
if (!Array.isArray(db.items)) db.items = SEED.items;
function save() { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }

const passOk = s => {
  const candidate = Buffer.from(String(s ?? ""));
  const expected = Buffer.from(String(PASS ?? ""));
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
};

function send(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-password",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  res.end(JSON.stringify(obj));
}
const readBody = req => new Promise(resolve => {
  let b = "";
  req.on("data", c => { b += c; if (b.length > 1e6) req.destroy(); });
  req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve({}); } });
});

// Keep only known fields, with the right types.
function cleanItem(b, partial) {
  const o = {};
  if (!partial || "n" in b) o.n = String(b.n ?? "New item").slice(0, 80);
  if (!partial || "p" in b) o.p = Math.max(0, Number(b.p) || 0);
  if (!partial || "e" in b) o.e = String(b.e ?? "🍽️").slice(0, 8);
  if (!partial || "d" in b) o.d = String(b.d ?? "").slice(0, 300);
  if (!partial || "s" in b) o.s = !!b.s;
  if (!partial || "img" in b) o.img = String(b.img ?? "").slice(0, 200000);
  return o;
}
const CFG_KEYS = ["name", "heading", "sub", "accent", "cur", "foot"];

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const p = new URL(req.url, "http://localhost").pathname;

  if (req.method === "GET" && p === "/api/menu") return send(res, 200, db);        // public
  if (req.method === "POST" && p === "/api/login") {
    const b = await readBody(req);
    return passOk(b.password) ? send(res, 200, { ok: true }) : send(res, 401, { error: "Wrong password" });
  }

  if (p.startsWith("/api/")) {                                                      // admin only
    if (!passOk(req.headers["x-admin-password"])) return send(res, 401, { error: "Unauthorized" });
    const b = await readBody(req);
    const m = p.match(/^\/api\/items\/([\w-]+)$/);

    if (req.method === "PUT" && p === "/api/config") {
      for (const k of CFG_KEYS) if (k in b) db.config[k] = String(b[k]).slice(0, 200);
      save(); return send(res, 200, db.config);
    }
    if (req.method === "POST" && p === "/api/items") {
      const item = { id: crypto.randomUUID(), ...cleanItem(b, false), o: Date.now() };
      db.items.push(item); save(); return send(res, 201, item);
    }
    if (req.method === "PUT" && m) {
      const item = db.items.find(i => i.id === m[1]);
      if (!item) return send(res, 404, { error: "Item not found" });
      Object.assign(item, cleanItem(b, true)); save(); return send(res, 200, item);
    }
    if (req.method === "DELETE" && m) {
      const n = db.items.length;
      db.items = db.items.filter(i => i.id !== m[1]);
      if (db.items.length === n) return send(res, 404, { error: "Item not found" });
      save(); return send(res, 200, { ok: true });
    }
  }
  send(res, 404, { error: "Not found" });
}).listen(PORT, () => console.log(`Tasty Bites backend running on http://localhost:${PORT}  (admin password: ${PASS === "admin123" ? "admin123 (default, change it!)" : "set via ADMIN_PASSWORD"})`));
