import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
} from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Zéro stockage : le message est encodé dans le lien lui-même.       */
/*  On le place après le « # » → le fragment n'est jamais envoyé au    */
/*  serveur, donc aucune donnée ne quitte le navigateur.              */
/* ------------------------------------------------------------------ */
function encodePayload(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodePayload(token) {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/* ------------------------------------------------------------------ */
/*  Decorative shared pieces                                          */
/* ------------------------------------------------------------------ */

// Soft blurred colour blobs floating slowly behind the content
function Blobs() {
  return (
    <>
      <motion.div
        className="blob"
        style={{ width: 320, height: 320, background: "#ff8fab", top: "-6%", left: "-8%" }}
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob"
        style={{ width: 260, height: 260, background: "#ffc3a0", bottom: "-8%", right: "-6%" }}
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob"
        style={{ width: 200, height: 200, background: "#ff5e7e", top: "40%", right: "10%" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

// A field of hearts drifting upward forever
function FloatingHearts({ count = 14, emojis = ["❤️", "💕", "💖", "🌸", "💗"] }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 26,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 8,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        drift: Math.random() * 60 - 30,
      })),
    [count, emojis]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute"
          style={{ left: `${h.left}%`, bottom: -40, fontSize: h.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -window.innerHeight - 80],
            x: [0, h.drift, 0],
            opacity: [0, 0.9, 0.9, 0],
            rotate: [0, h.drift > 0 ? 25 : -25, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {h.emoji}
        </motion.span>
      ))}
    </div>
  );
}

// Bursting hearts used as a celebration when the answer is "Oui"
function HeartBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        angle: (i / 28) * Math.PI * 2,
        dist: 120 + Math.random() * 220,
        size: 16 + Math.random() * 24,
        emoji: ["❤️", "💖", "💕", "✨", "💗"][i % 5],
        delay: Math.random() * 0.3,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{ fontSize: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            opacity: 0,
            scale: 1.3,
          }}
          transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pages                                                             */
/* ------------------------------------------------------------------ */

// Mentions légales / RGPD : liens discrets en bas de page + modale détaillée
function LegalFooter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span className="pointer-events-none fixed bottom-3 left-4 z-40 select-none text-[11px] font-light text-rose-900/40">
        © 2026 SHAU · Styvan Hauterville
      </span>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-4 z-40 text-[11px] font-light text-rose-900/40 underline-offset-2 transition-colors hover:text-rose-900/70 hover:underline"
      >
        CGU · Confidentialité
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-rose-900/40 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="glass max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] p-7 text-left text-rose-900/80"
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="font-script text-3xl font-bold text-rose-600">
                  Mentions &amp; confidentialité
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-rose-600 shadow"
                >
                  ✕
                </button>
              </div>

              <h4 className="mt-4 mb-1 text-sm font-semibold text-rose-700">
                🔒 Confidentialité (RGPD)
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Aucun compte, aucune inscription, aucun cookie de suivi ni outil d’analyse.</li>
                <li>
                  <strong>Aucune donnée n’est stockée</strong> : votre message est encodé
                  directement dans le lien généré. Il n’existe ni base de données ni serveur
                  qui le conserve.
                </li>
                <li>
                  Le contenu placé après le « # » du lien n’est même{" "}
                  <strong>jamais transmis au serveur</strong> : seul le navigateur du
                  destinataire le lit et le déchiffre.
                </li>
                <li>Aucune donnée n’est revendue, partagée avec des tiers ou exploitée à des fins commerciales.</li>
                <li>
                  Comme tout est contenu dans le lien, quiconque possède ce lien peut lire le
                  message : ne le partagez qu’avec la personne concernée.
                </li>
              </ul>

              <h4 className="mt-4 mb-1 text-sm font-semibold text-rose-700">
                📜 Conditions d’utilisation
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Service gratuit, proposé à titre ludique, sans garantie de disponibilité.</li>
                <li>
                  Vous êtes seul responsable du contenu que vous rédigez et partagez ; n’y
                  insérez aucune donnée sensible ou confidentielle.
                </li>
                <li>Le service peut être modifié, suspendu ou interrompu à tout moment.</li>
              </ul>

              <h4 className="mt-4 mb-1 text-sm font-semibold text-rose-700">
                ✉️ Contact &amp; droits
              </h4>
              <p className="text-sm">
                Aucune donnée personnelle n’étant collectée ni conservée, il n’existe aucun
                profil à consulter, exporter ou supprimer. Pour toute question :{" "}
                <a href="mailto:hello@shau.fr" className="font-semibold text-rose-600 underline">
                  hello@shau.fr
                </a>
                .
              </p>

              <p className="mt-5 text-center text-[11px] text-rose-900/40">
                © 2026 SHAU · Styvan Hauterville — Tous droits réservés.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateMessage />} />
        <Route path="/v" element={<ValentineMessage />} />
      </Routes>
      <LegalFooter />
    </Router>
  );
}

function Home() {
  return (
    <div className="bg-romance relative flex h-screen items-center justify-center overflow-hidden px-4">
      <Blobs />
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass relative z-10 flex max-w-md flex-col items-center rounded-[2rem] px-10 py-12 text-center"
      >
        <motion.div
          className="mb-2 text-6xl"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        >
          💖
        </motion.div>

        <h1 className="font-script text-5xl font-bold text-rose-600 drop-shadow-sm">
          Sois ma Valentine
        </h1>
        <p className="mt-3 mb-8 text-rose-800/70">
          Crée un message d’amour unique et envoie-le à la personne qui fait
          battre ton cœur.
        </p>

        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <Link
            to="/create"
            className="shimmer block w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/40 transition-shadow hover:shadow-rose-500/60"
          >
            💌 Créer mon message
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CreateMessage() {
  const [destinataire, setDestinataire] = useState("");
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generateLink = () => {
    setError(null);
    if (!destinataire.trim() || !message.trim() || !secret.trim()) {
      setError("Remplis tous les champs pour créer ton message 💕");
      return;
    }
    setLoading(true);
    try {
      const token = encodePayload({
        destinataire,
        message_perso: message,
        message_secret: secret,
      });
      setGeneratedLink(`${window.location.origin}/v#${token}`);
      setShowModal(true);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields = [
    {
      el: "input",
      placeholder: "À qui ? (nom du destinataire)",
      value: destinataire,
      set: setDestinataire,
    },
    {
      el: "textarea",
      placeholder: "Pourquoi dire oui ? Ton petit mot…",
      value: message,
      set: setMessage,
    },
    {
      el: "textarea",
      placeholder: "Le message secret révélé après le « oui » 💍",
      value: secret,
      set: setSecret,
    },
  ];

  return (
    <div className="bg-romance relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Blobs />
      <FloatingHearts count={10} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass relative z-10 w-full max-w-lg rounded-[2rem] px-8 py-10"
      >
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-rose-500 transition-colors hover:text-rose-700"
        >
          ← Retour
        </Link>

        <h2 className="font-script mb-1 text-4xl font-bold text-rose-600">
          Crée ton message
        </h2>
        <p className="mb-7 text-sm text-rose-800/60">
          Trois petits champs, et la magie opère ✨
        </p>

        <div className="flex flex-col gap-4">
          {fields.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              {f.el === "input" ? (
                <input
                  type="text"
                  className="romance-input"
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                />
              ) : (
                <textarea
                  rows={3}
                  className="romance-input resize-none"
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                />
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 text-center text-sm font-medium text-rose-600"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          onClick={generateLink}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.04 }}
          whileTap={{ scale: loading ? 1 : 0.96 }}
          className="shimmer mt-7 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/40 disabled:opacity-70"
        >
          {loading ? "Création en cours…" : "💖 Générer le lien"}
        </motion.button>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-900/40 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="glass w-full max-w-sm rounded-[1.75rem] p-7 text-center"
            >
              <motion.div
                className="mb-2 text-5xl"
                animate={{ rotate: [0, -12, 12, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
              >
                💌
              </motion.div>
              <h3 className="mb-1 text-xl font-bold text-rose-600">
                Ton lien est prêt !
              </h3>
              <p className="mb-4 text-sm text-rose-800/60">
                Copie-le et envoie-le à ton crush.
              </p>
              <input
                type="text"
                value={generatedLink || ""}
                readOnly
                className="romance-input text-center text-sm"
                onFocus={(e) => e.target.select()}
              />
              <div className="mt-5 flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copy}
                  className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 font-semibold text-white shadow-md"
                >
                  {copied ? "✅ Copié !" : "📋 Copier"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-white/70 px-4 py-2.5 font-semibold text-rose-600 shadow-md"
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ValentineMessage() {
  const [messageData, setMessageData] = useState(null);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noScale, setNoScale] = useState(1);

  useEffect(() => {
    try {
      const token = window.location.hash.replace(/^#/, "");
      if (!token) throw new Error("Lien invalide ou incomplet 💔");
      const data = decodePayload(token);
      if (!data || !data.destinataire) throw new Error("Lien invalide ou incomplet 💔");
      setMessageData(data);
    } catch {
      setError("Lien invalide ou incomplet 💔");
    }
  }, []);

  const dodge = () => {
    setNoPosition({
      x: Math.random() * 280 - 140,
      y: Math.random() * 220 - 110,
    });
    setNoScale((s) => Math.max(0.5, s - 0.08));
  };

  /* ---- Loading ---- */
  if (!messageData && !error) {
    return (
      <div className="bg-romance flex h-screen flex-col items-center justify-center gap-4">
        <motion.div
          className="text-6xl"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        >
          💗
        </motion.div>
        <p className="font-script text-2xl text-rose-600">Chargement…</p>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="bg-romance flex h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass max-w-sm rounded-3xl px-8 py-10 text-center"
        >
          <div className="mb-3 text-5xl">💔</div>
          <p className="text-lg font-semibold text-rose-700">{error}</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 font-semibold text-white shadow-md"
          >
            Créer le mien
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ---- Main ---- */
  return (
    <div className="bg-romance-deep relative flex h-screen flex-col items-center justify-center overflow-hidden px-4">
      <Blobs />
      <FloatingHearts count={accepted ? 22 : 12} />

      <AnimatePresence mode="wait">
        {!accepted ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="glass relative z-10 w-full max-w-lg rounded-[2rem] px-8 py-12 text-center"
          >
            <motion.div
              className="mb-4 text-6xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ❤️
            </motion.div>
            <h2 className="font-script text-4xl font-bold leading-tight text-rose-600 sm:text-5xl">
              Veux-tu être ma Valentine,
              <br />
              {messageData.destinataire} ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-rose-800/70">
              {messageData.message_perso}
            </p>

            <div className="relative mt-9 flex h-20 items-center justify-center gap-5">
              <motion.button
                onClick={() => setAccepted(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: [
                  "0 0 0 0 rgba(34,197,94,0.5)",
                  "0 0 0 16px rgba(34,197,94,0)",
                ] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-9 py-4 text-lg font-bold text-white shadow-lg"
              >
                Oui 💚
              </motion.button>

              <motion.button
                onMouseEnter={dodge}
                onClick={dodge}
                animate={{ x: noPosition.x, y: noPosition.y, scale: noScale }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="rounded-2xl bg-white/60 px-9 py-4 text-lg font-bold text-rose-400 shadow-md"
              >
                Non
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="yes"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center"
          >
            <HeartBurst />
            <motion.div
              className="mb-6 text-7xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              🥰
            </motion.div>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass mx-auto max-w-xl rounded-[2rem] px-8 py-8 font-script text-4xl font-bold leading-snug text-rose-600 sm:text-5xl"
            >
              {messageData.message_secret}
            </motion.h2>
            <motion.div
              className="mt-8 text-5xl"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              💕 💞 💓 💗 💖
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
