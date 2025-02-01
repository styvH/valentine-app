const express = require("express");
const cors = require("cors"); 
const { v4: uuidv4 } = require("uuid");
const redis = require("redis");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (or specify allowed origins)
app.use(cors());

// Connexion à Redis
const client = redis.createClient({
url: process.env.REDIS_URL || "redis://localhost:6379"
});
client.connect();

app.use(express.json());

// Endpoint pour générer un lien
app.post("/generate", async (req, res) => {
const { destinataire, message_perso } = req.body;
if (!destinataire || !message_perso) {
    return res.status(400).json({ error: "Champs requis manquants." });
}

const endpoint = uuidv4(); // Génère un identifiant unique
const data = JSON.stringify({ destinataire, message_perso });
console.log("data : ", data);
await client.setEx(endpoint, 86400, data); // Expire en 24h

res.json({ link: `${req.protocol}://${req.get("host")}/${endpoint}` });
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
