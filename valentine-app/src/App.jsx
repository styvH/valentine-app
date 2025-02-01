import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Route, Routes, Link, useParams } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateMessage />} />
        <Route path="/:endpoint" element={<ValentineMessage />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div className="flex h-screen items-center justify-center bg-pink-100">
      <Link to="/create" className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-700">
        Créer votre message
      </Link>
    </div>
  );
}

function CreateMessage() {
  const [destinataire, setDestinataire] = useState("");
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const generateLink = async () => {
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinataire: destinataire, message_perso: message, message_secret: secret }),
    });
  
    const data = await response.json();
  
    if (data.endpoint) {
      const fullLink = `http://localhost:5173/${data.endpoint}`; // Construct the full link
      setGeneratedLink(fullLink);
      setShowModal(true); // Show modal after fetching
    }
  };  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-4">
      <h2 className="text-2xl font-bold mb-4">Créer votre message</h2>
      <input
        type="text"
        placeholder="Nom du destinataire"
        value={destinataire}
        onChange={(e) => setDestinataire(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-md"
      />
      <textarea
        placeholder="Pourquoi dire Oui ?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-md"
      />
      <textarea
        placeholder="C'est un oui ! Un Message d'amour ?"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-md"
      />
      <button
        onClick={generateLink}
        className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-700"
      >
        Générer le lien
      </button>

      {/* MODAL (POP-UP) */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Votre lien est prêt !</h3>
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="border p-2 rounded w-full text-center"
            />
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
              >
                Copier
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ValentineMessage() {
  const { endpoint } = useParams();
  const [messageData, setMessageData] = useState(null);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
          throw new Error("Message not found or expired.");
        }
        const data = await response.json();
        setMessageData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMessage();
  }, [endpoint]);

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  if (!messageData) {
    return <div className="text-center mt-20">Chargement...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 relative overflow-hidden">
{!accepted ? (
  <>
    <h2 className="text-2xl font-bold mb-4">
      Veux-tu être ma Valentine {messageData.destinataire} ? ❤️
    </h2>
    <p className="mb-4 text-gray-700">{messageData.message_perso}</p>
    <div className="flex gap-4">
      <button
        onClick={() => setAccepted(true)}
        className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700"
      >
        Oui
      </button>
      <motion.button
        onHoverStart={() =>
          setNoPosition({
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
          })
        }
        animate={{ x: noPosition.x, y: noPosition.y }}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md cursor-pointer"
      >
        Non
      </motion.button>
    </div>
  </>
) : (
  <div className="text-center">
    <h2 className="text-3xl font-bold mb-4">❤️ {messageData.message_secret} ❤️</h2>
    <motion.div
      initial={{ y: 500, opacity: 0 }}
      animate={{ y: -500, opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity }}
      className="text-red-500 text-4xl"
    >
      ❤️❤️❤️❤️❤️
    </motion.div>
  </div>
)}

    </div>
  );
}
