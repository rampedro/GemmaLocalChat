# 🌌 BUZBEST Inc by (™ARYAI.AI)
> **The High-Performance Neural Edge Engine for iOS.**
> Developed & Maintained by **BuzBest Inc.**

![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-gold.svg)
![Architecture](https://img.shields.io/badge/Stack-C%2B%2B%20%2F%20React%20Native-blue.svg)
![NPU](https://img.shields.io/badge/Hardware-Apple%20Neural%20Engine-black.svg)

BUZBESTNote Taker AI is a zero-trust, local-first multimodal intelligence suite. It bridges the gap between high-level React Native UI and low-level C++ inference kernels, enabling **Llama 3.2 (GGUF)**, **Whisper**, and **Vision OCR** to run with near-zero latency on-device.

## 🧠 System Architecture
BUZBESTNote Taker utilizes a **Static-Linkage Microkernel** strategy:
- **Vision Layer:** Real-time character recognition via Apple Vision, mapping glyph coordinates to interactive UI tokens.
- **Inference Layer:** Metal-accelerated `llama.cpp` implementation utilizing **Deterministic Quantization (Q4_K_M)** for private reasoning.
- **Persistence Layer:** Zero-trust local encryption using the iOS Keychain and Secure Enclave.

## 🛠 Usage Protocol
### Prerequisites
- **Xcode 15.5+** | **Ruby 3.2+** | **Node 20+**
- Physical iOS Device (A15 Bionic or newer recommended for NPU acceleration).

### Cold Boot Setup
```bash
git clone https://github.com/rampedro/GemmaLocalChat
npm install
./setup_assets.sh  # Ingests model weights to FileSystem.documentDirectory
npx expo prebuild --platform ios
npx expo run:ios
```

## 🤝 Contributing
We adhere to a **High-Density Code Standard**. Please review `CONTRIBUTING.md` before opening a Pull Request. We prioritize:
1. **Memory Safety:** No raw pointers in C++ bridge logic.
2. **Inference Speed:** Benchmark all changes against the Apple Neural Engine.
3. **UI Fluidity:** 60FPS target for high-density tokenized layouts.

## ⚖️ License
Licensed under **CC BY-NC 4.0**. 
**Commercial exploitation is strictly prohibited** without a private license from BuzBest Inc..
