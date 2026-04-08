import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker'; // Add this
import { extractText } from 'expo-pdf-text-extract'; // Add this
import { initLlama } from 'llama.rn';

const MODEL_URL = 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf';
const MODEL_PATH = `${FileSystem.documentDirectory}model.gguf`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState(null);
  const [status, setStatus] = useState('Initializing...');
  const [dlProgress, setDlProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfText, setPdfText] = useState(''); // State to hold PDF context

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(MODEL_PATH);
        if (!info.exists) {
          setStatus('Downloading Model (1.6GB)...');
          const downloader = FileSystem.createDownloadResumable(
            MODEL_URL, MODEL_PATH, {},
            (p) => setDlProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite)
          );
          await downloader.downloadAsync();
        }

        setStatus('Loading GPU Kernels...');
        const ctx = await initLlama({
          model: MODEL_PATH,
          use_mlock: true,
          n_ctx: 4096, // Increased context window for PDFs
          n_gpu_layers: 99
        });

        setContext(ctx);
        setStatus('Ready');
      } catch (e) {
        setStatus('Error: ' + e.message);
      }
    })();
  }, []);

  // New function to pick and extract PDF
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled) {
        setStatus('Extracting PDF...');
        const text = await extractText(result.assets[0].uri);
        setPdfText(text);
        setStatus('PDF Loaded');
        Alert.alert("Success", "PDF context loaded!");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to read PDF");
    }
  };

  const send = async () => {
    if (!inputText.trim() || !context || isTyping) return;
    const userMsg = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Inject PDF text into the prompt as system instructions
      const systemPrompt = pdfText ? `Context from PDF: ${pdfText.substring(0, 3000)}\n\n` : '';
      const prompt = `<start_of_turn>user\n${systemPrompt}${userMsg.content}<end_of_turn>\n<start_of_turn>model\n`;
      
      const response = await context.completion({
        prompt,
        n_predict: 256,
        stop: ["<end_of_turn>", "<eos>"],
        temperature: 0.7
      });
      setMessages(prev => [...prev, { role: 'model', content: response.text.trim() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'system', content: 'Inference failed.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gemma Local</Text>
          <Text style={styles.status}>{status} {dlProgress > 0 && dlProgress < 1 ? `(${(dlProgress*100).toFixed(0)}%)` : ''}</Text>
          {/* Add PDF Button */}
          <TouchableOpacity onPress={pickDocument} style={styles.pdfBtn}>
            <Text style={styles.pdfBtnText}>{pdfText ? "📄 PDF Loaded" : "📎 Attach PDF"}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.chat}>
          {messages.map((m, i) => (
            <View key={i} style={m.role === 'user' ? styles.ub : styles.mb}>
              <Text style={m.role === 'user' ? styles.ut : styles.mt}>{m.content}</Text>
            </View>
          ))}
          {isTyping && <ActivityIndicator size="small" color="#007AFF" style={{marginTop: 10}} />}
        </ScrollView>
        <View style={styles.inputBar}>
          <TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder="Ask about the PDF..." editable={!!context && !isTyping} />
          <TouchableOpacity style={styles.btn} onPress={send} disabled={!context || isTyping}>
            <Text style={styles.btnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  status: { fontSize: 10, color: '#888' },
  pdfBtn: { backgroundColor: '#E1E9FF', padding: 8, borderRadius: 8 },
  pdfBtnText: { color: '#007AFF', fontSize: 12, fontWeight: '600' },
  chat: { flex: 1, padding: 16 },
  ub: { alignSelf: 'flex-end', backgroundColor: '#007AFF', padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  mb: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  ut: { color: '#fff' },
  mt: { color: '#000' },
  inputBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  btn: { marginLeft: 10, backgroundColor: '#007AFF', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 20 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
