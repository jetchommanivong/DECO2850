import { useState } from "react";

export default function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn’t support speech recognition. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;   // stop after user stops talking
    recognition.interimResults = false; // only final results
    recognition.lang = "en-US"; // set language

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Heard:", transcript);
      onTranscript(transcript); // send to parent (e.g., App)
    };

    recognition.start();
  };

  return (
    <button onClick={startListening}>
      {listening ? "🎤 Listening..." : "Start Voice Input"}
    </button>
  );
}
