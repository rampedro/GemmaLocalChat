#!/bin/bash

# 1. Update app.json for iOS 26.3 and Qwen 2.5 Hardware Requirements
# This uses 'sed' to inject the Network and Memory entitlements
cat <<EOF > app.json
{
  "expo": {
    "name": "BuzNote AI",
    "slug": "buznote-ai",
    "version": "1.0.0",
    "newArchEnabled": false,
    "ios": {
      "bundleIdentifier": "com.aryai.buznote",
      "deploymentTarget": "17.0",
      "infoPlist": {
        "NSCameraUsageDescription": "Analyze handwritten clinical notes via Apple Neural Engine.",
        "NSPhotoLibraryUsageDescription": "Process document images and PDF context.",
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        },
        "com.apple.developer.kernel.increased-memory-limit": true
      }
    },
    "plugins": [
      ["expo-build-properties", {
        "ios": {
          "useFrameworks": "static",
          "deploymentTarget": "17.0"
        }
      }],
      ["expo-camera", { "cameraPermission": "Allow access to scan handwriting." }],
      ["llama.rn", { "enableEntitlements": true, "forceCxx20": true }]
    ],
    "android": {
      "permissions": ["android.permission.CAMERA", "android.permission.RECORD_AUDIO"],
      "package": "com.aryai.buznote"
    }
  }
}
EOF

# 2. Clear the "No Internet" Cache and Stale Paths
rm -rf ios android .expo
rm -rf ~/Library/Developer/Xcode/DerivedData/BuzNoteAI-*

# 3. Regenerate the Native Enclave
npx expo prebuild --clean

# 4. Re-link the 102 Native Pods
cd ios
pod install
cd ..

# 5. Launch to your physical device
# Ensure your iPhone is plugged in and on the same Wi-Fi
npx expo run:ios --device
