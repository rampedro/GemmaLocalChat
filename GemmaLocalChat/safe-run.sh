#!/bin/bash

# Define a checksum file to track changes
CHECKSUM_FILE=".build_checksum"
CURRENT_CHECKSUM=$(md5 -q app.json package.json ios/Podfile 2>/dev/null || md5sum app.json package.json ios/Podfile)

# Function to perform a full native refresh
full_native_refresh() {
    echo "🚀 Native changes detected. Performing full refresh..."
    rm -rf ios android .expo
    npx expo prebuild --clean
    cd ios && pod install && cd ..
    echo "$CURRENT_CHECKSUM" > "$CHECKSUM_FILE"
}

# 1. Check if the native folders exist or if config has changed
if [ ! -d "ios" ] || [ ! -f "$CHECKSUM_FILE" ] || [ "$CURRENT_CHECKSUM" != "$(cat $CHECKSUM_FILE)" ]; then
    full_native_refresh
else
    echo "✅ No native changes. Skipping prebuild and pod install."
fi

# 2. Always run the incremental build to the device
echo "📲 Launching to device..."
npx expo run:ios --device
