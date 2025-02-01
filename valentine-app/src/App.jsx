import { useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

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
  const [generatedLink, setGeneratedLink] = useState(null);

  const generateLink = async () => {
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinataire, message_perso: message })
    });
    const data = await response.json();
    setGeneratedLink(data.link);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-4">
      <h2 className="text-2xl font-bold mb-4">Créer votre message</h2>
      <input type="text" placeholder="Nom du destinataire" value={destinataire} onChange={e => setDestinataire(e.target.value)} className="border p-2 rounded mb-2" />
      <textarea placeholder="Message personnalisé" value={message} onChange={e => setMessage(e.target.value)} className="border p-2 rounded mb-2"></textarea>
      <button onClick={generateLink} className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md">Générer le lien</button>
      {generatedLink && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <p>Votre lien :</p>
          <input type="text" value={generatedLink} readOnly className="border p-2 w-full" />
          <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Copier</button>
        </div>
      )}
    </div>
  );
}

function ValentineMessage() {
  const [accepted, setAccepted] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 relative overflow-hidden">
      {!accepted ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Veux-tu être ma Valentine ?</h2>
          <div className="flex gap-4">
            <button onClick={() => setAccepted(true)} className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700">
              Oui
            </button>
            <motion.button
              onHoverStart={() => setNoPosition({ x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 })}
              animate={{ x: noPosition.x, y: noPosition.y }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md cursor-pointer"
            >
              Non
            </motion.button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Message secret ! ❤️</h2>
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
