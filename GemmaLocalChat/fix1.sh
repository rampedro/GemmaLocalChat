# 1. Kill hung simulator services to unlock "Placeholder" destinations
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService

# 2. Delete all corrupted native folders and previous path references
rm -rf ios android .expo node_modules package-lock.json

# 3. Install the Javascript dependencies from your package.json
# This ensures @react-native-ml-kit and llama.rn are ready for linking
npm install

# 4. Generate the new Native iOS project
# This maps all internal Xcode paths to your CURRENT directory
npx expo prebuild --clean

# 5. Install the 102 Cocoapods (Native dependencies)
# This is critical for the C++20 and Metal kernels required by Qwen
cd ios && pod install && cd ..

# 6. Boot the simulator to make it an "Eligible" destination
open -a Simulator

# 7. Launch the fresh build
npx expo run:ios
