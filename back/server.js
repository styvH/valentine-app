const express = require("express");
const cors = require("cors"); 
const { v4: uuidv4 } = require("uuid");
const redis = require("redis");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (or specify allowed origins)
app.use(cors());

// Store en mémoire utilisé en fallback si Redis est indisponible
function createMemoryStore() {
  const store = new Map();
  return {
    async setEx(key, ttlSeconds, value) {
      store.set(key, value);
      setTimeout(() => store.delete(key), ttlSeconds * 1000).unref?.();
    },
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
  };
}

// Connexion à Redis, avec fallback en mémoire si la connexion échoue
let client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 2000,
    reconnectStrategy: false, // échoue immédiatement au lieu de retenter indéfiniment
  },
});
client.on("error", () => {}); // évite le crash sur erreur de socket

(async () => {
  try {
    await client.connect();
    console.log("✅ Connecté à Redis");
  } catch {
    console.warn("⚠️  Redis indisponible — utilisation d'un store en mémoire (données non persistantes).");
    client = createMemoryStore();
  }
})();

app.use(express.json());

// Endpoint pour générer un lien
app.post("/generate", async (req, res) => {
const { destinataire, message_perso, message_secret } = req.body;
if (!destinataire || !message_perso || !message_secret) {
    return res.status(400).json({ error: "Champs requis manquants." });
}

const endpoint = uuidv4(); // Génère un identifiant unique
const data = JSON.stringify({ destinataire, message_perso, message_secret });
console.log("data : ", data);
await client.setEx(endpoint, 86400, data); // Expire en 24h
console.log(`http://localhost:5173/${endpoint}`);
res.json({ endpoint });

});

// Endpoint pour récupérer le message
app.get("/:endpoint", async (req, res) => {
const { endpoint } = req.params;
const data = await client.get(endpoint);

if (!data) {
    return res.status(404).json({ error: "Lien expiré ou inexistant." });
}

res.json(JSON.parse(data));
});

// Démarrage du serveur
app.listen(PORT, () => {
console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
