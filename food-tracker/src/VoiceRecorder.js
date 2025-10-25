import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, Platform, Alert } from "react-native";
import { Audio } from "expo-av";

const VoiceRecorderHybrid = forwardRef(({ onTranscript }, ref) => {
  const [recording, setRecording] = useState(null);
  const [status, setStatus] = useState("");
  const [listening, setListening] = useState(false);
  const webRecognitionRef = useRef(null);


  const accumulatedTranscript = useRef("");


  const startRecording = async () => {
  if (Platform.OS === "web") {
    startWebListening();
    return;
  }

  try {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Microphone permission not granted");
      return;
    }

    // ✅ Always safe config for iOS + Android
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });


    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await rec.startAsync();

    setRecording(rec);
    setStatus("Recording...");
  } catch (err) {
    console.error("Failed to start recording:", err);
    setStatus("Error starting recording");
  }
};


  const stopRecording = async () => {
  if (Platform.OS === "web") {
    stopWebListening();
    return;
  }

  try {
    if (!recording) {
      console.warn("⚠️ No active recording found.");
      return;
    }

    setStatus("Processing...");
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setStatus("Uploading...");
    await sendToWhisper(uri);
  } catch (error) {
    console.error("Error stopping recording:", error);
    setStatus("Error stopping recording");
  }
};

  const sendToWhisper = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "audio.m4a",
        type: "audio/m4a",
      });
      formData.append("model", "whisper-1");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}` },
        body: formData,
      });

      const data = await response.json();
      console.log("Transcription:", data.text);
      setStatus("Done!");
      onTranscript?.(data.text);
    } catch (error) {
      console.error("Whisper error:", error);
      setStatus("Error sending to Whisper");
    }
  };

  const startWebListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    Alert.alert("Browser not supported", "Try using Chrome for voice input.");
    return;
  }

  // reset previous data
  accumulatedTranscript.current = "";

  const recognition = new SpeechRecognition();
  webRecognitionRef.current = recognition;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = true;

  recognition.onstart = () => {
    setListening(true);
    setStatus("Listening...");
  };

  recognition.onresult = (event) => {
    const latest = event.results[event.results.length - 1][0].transcript.trim();
    accumulatedTranscript.current += " " + latest; // 👈 store, don't send yet
    console.log("🗣 Heard:", latest);
  };

  recognition.onerror = (e) => {
    console.warn("SpeechRecognition error:", e.error);
    if (e.error === "no-speech" || e.error === "aborted") return;
    setStatus("Error listening");
  };

  recognition.onend = () => {
    // auto-restart if still active
    if (listening && webRecognitionRef.current) {
      console.log("⏳ Restarting after silence...");
      setTimeout(() => recognition.start(), 250);
    }
  };

  recognition.start();
};

const stopWebListening = () => {
  if (webRecognitionRef.current) {
    const rec = webRecognitionRef.current;
    webRecognitionRef.current = null;
    rec.onend = null; // prevent restart
    rec.stop();
  }
  setListening(false);
  setStatus("Stopped listening");

  // ✅ now deliver the full accumulated transcript
  const finalText = accumulatedTranscript.current.trim();
  if (finalText) {
    console.log("📝 Final transcript:", finalText);
    onTranscript?.(finalText);
  } else {
    console.log("⚠️ No speech detected.");
  }
};


  // expose controls to parent 👇
  useImperativeHandle(ref, () => ({
    start: startRecording,
    stop: stopRecording,
  }));

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
        {status}
      </Text>
    </View>
  );
});

export default VoiceRecorderHybrid;
