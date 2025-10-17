import React, { useState } from "react";
import { Platform, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as Speech from "expo-speech"; // optional, for speaking responses on mobile

export default function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false);

  const startListening = async () => {
    if (Platform.OS === "web") {
      // ✅ Web speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Your browser doesn’t support speech recognition. Try Chrome.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Heard:", transcript);
        onTranscript(transcript);
      };

      recognition.start();
    } else {
      // ✅ Native fallback
      Alert.alert(
        "Speech Input Unavailable",
        "Speech recognition isn’t supported in Expo Go.\nTry on web or use expo-speech for output."
      );
      // Example of speaking back (optional)
      Speech.speak("Voice input is only supported on the web right now.");
    }
  };

  return (
    <View style={{ alignItems: "center", marginVertical: 10 }}>
      <TouchableOpacity
        onPress={startListening}
        disabled={listening}
        style={{
          backgroundColor: listening ? "#f44336" : "#4CAF50",
          padding: 14,
          borderRadius: 10,
          width: 200,
          alignItems: "center",
        }}
      >
        {listening ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "white", fontWeight: "600" }}>
            {Platform.OS === "web" ? "🎤 Start Voice Input" : "🎤 Voice Input"}
          </Text>
        )}
      </TouchableOpacity>

      {listening && (
        <Text style={{ marginTop: 8, color: "#555" }}>Listening...</Text>
      )}
    </View>
  );
}
