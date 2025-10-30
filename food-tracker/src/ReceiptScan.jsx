import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { getTextFromImage } from './services/api/GoogleVision';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { promptTemplate } from './services/ai/prompt';
import { getOpenAIResponse } from './services/ai/openai';
import Popup from "./components/Popup";
import ItemTable from "./components/ItemTable";
import { Modal } from "react-native";

export default function ReceiptScan({showModal, handleCloseModal}) {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState('');
  const [showAddItemPopup, setShowAddItemPopup] = useState(false);

  // --- Open Camera ---
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
    }
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        includesBase64: true,
        quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageData(result);
        setAIResponse('');
    }
  };

  // --- Process Receipt Image ---
  const getData = async () => {
    if (!imageData) return;
    setShowAddItemPopup(true);
    setAIResponse('');
    setLoading(true);

    let base64 = imageData.assets[0].base64;
    if (!base64) {
        try {
            base64 = await readAsStringAsync(imageData.assets[0].uri, { encoding: EncodingType.Base64 });
        } catch (e) {
            Alert.alert('No image data', 'Unable to get base64 data from image.');
            setLoading(false);
            return;
        }
    }
  
    try {
      const result = await getTextFromImage(base64);
      const text = result.responses[0]?.textAnnotations?.[0]?.description || '';

      if (text && text.trim().length > 0) {
        const aiResult = await getOpenAIResponse(`${promptTemplate}\n${text}`);
        const aiContent = aiResult.choices[0]?.message?.content || '';

        let parsedResponse = { items: [] };
        try {
          parsedResponse = JSON.parse(aiContent);
          if (!Array.isArray(parsedResponse.items)) {
              parsedResponse.items = [];
          }
        } catch (e) {
          console.warn('Failed to parse AI response as JSON:', e);
        }

        setAIResponse(parsedResponse);
      } else {
        setAIResponse({ items: [] });
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process image or get AI response.');
      setAIResponse({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageData(null);
    setAIResponse('');
    setShowAddItemPopup(false);
    setLoading(false);
    handleCloseModal();
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.voiceOverlayBackdrop}>
        <View style={styles.voiceOverlay}>
          <View style={styles.overlayHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✖</Text>
            </TouchableOpacity>
          </View>
      
          <View style={{ flex: 1, backgroundColor: '#fff', paddingBottom: 40 }}>
            {/* --- Image Preview --- */}
            {imageData && (
              <Image
                source={{ uri: imageData.assets[0].uri }}
                style={{
                  width: '90%',
                  height: 300,
                  alignSelf: 'center',
                  marginTop: 20,
                  borderRadius: 12,
                }}
              />
            )}
    
            {/* --- Open Camera Button --- */}
            <TouchableOpacity
              style={{
                width: '90%',
                height: 50,
                marginTop: 20,
                backgroundColor: '#4c8bf5',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                borderRadius: 8,
              }}
              onPress={openCamera}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 20 }}>Take a photo</Text>
            </TouchableOpacity>
            
            {/* --- Get Text & AI Button --- */}
            <TouchableOpacity
              style={{
                width: '90%',
                height: 50,
                marginTop: 20,
                backgroundColor: imageData ? '#4c8bf5' : 'gray',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                borderRadius: 8,
              }}
              onPress={() => {
                getData();
              }}
              disabled={!imageData}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 20 }}>Add Items to Inventory</Text>
            </TouchableOpacity>
            
            {/* --- General Popup --- */}
            <Popup
              visible={showAddItemPopup}
              onClose={() => setShowAddItemPopup(false)}
              title="Please review your items"
              disclaimer="Results generated by AI may not be accuarate, retake photo if items are missing or incorrect."
              variant="slide"
            >
              {loading ? (
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, paddingVertical: 20 }}>
                  <ActivityIndicator size="large" color="black" />
                  <Text style={{ marginTop: 15, fontSize: 16, color: '#555' }}>Processing...</Text>
                </View>
              ) : (
                <ItemTable aiResponse={aiResponse} onClosePopup={handleClose} />
              )}
            </Popup>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addedButton: {
    backgroundColor: "#4CAF50",
  },
  voiceOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  voiceOverlay: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '75%',
    paddingBottom: 20,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 20,
    color: '#666',
  }
});
