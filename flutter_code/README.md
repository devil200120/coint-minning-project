# Mining App - Flutter Google Sign-In Integration

## 📁 Project Structure

```
flutter_code/
├── lib/
│   ├── main.dart                    # App entry point with splash screen
│   ├── services/
│   │   ├── api_service.dart         # Backend API calls
│   │   └── auth_service.dart        # Google Sign-In wrapper
│   └── screens/
│       ├── login_screen.dart        # Login UI with Google button
│       └── home_screen.dart         # Main dashboard after login
└── pubspec.yaml                     # Dependencies
```

## 🚀 Setup Instructions

### Step 1: Add Dependencies

The `pubspec.yaml` is already configured. Just run:

```bash
flutter pub get
```

### Step 2: Configure API Base URL

Open `lib/services/api_service.dart` and update the base URL:

```dart
static const String baseUrl = 'YOUR_BACKEND_URL/api';
// Example: 'https://your-server.com/api'
// For local testing: 'http://10.0.2.2:5000/api' (Android emulator)
// For local testing: 'http://localhost:5000/api' (iOS simulator)
```

### Step 3: Android Configuration

#### 3.1 Get SHA-1 Fingerprint

Run this command in your Flutter project root:

```bash
# For debug
cd android
./gradlew signingReport
```

Look for the SHA-1 under `Variant: debug`.

#### 3.2 Update `android/app/build.gradle`

Make sure you have:

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.miningapp"  // Your package name
        minSdkVersion 21
        // ...
    }
}
```

#### 3.3 Give Info to Admin

Provide these to the admin for Google Console setup:
- **Package Name**: `com.yourcompany.miningapp` (from build.gradle)
- **SHA-1 Fingerprint**: (from signingReport)

### Step 4: iOS Configuration (Optional)

#### 4.1 Update `ios/Runner/Info.plist`

Add inside the `<dict>` tag:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <!-- Replace with your iOS Client ID reversed -->
            <string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

## 🔐 Authentication Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│   Flutter App   │         │     Google       │         │    Backend     │
│                 │         │                  │         │                │
│  1. User taps   │         │                  │         │                │
│  "Sign in with  │────────►│ 2. Google        │         │                │
│   Google"       │         │    Sign-In UI    │         │                │
│                 │◄────────│                  │         │                │
│  3. Receives    │         │ 3. Returns       │         │                │
│     idToken     │         │    idToken       │         │                │
│                 │         │                  │         │                │
│  4. Sends       │─────────────────────────────────────►│ 5. Verifies    │
│     idToken     │         │                  │         │    idToken     │
│     to backend  │         │                  │         │                │
│                 │         │                  │         │ 6. Creates/    │
│                 │◄─────────────────────────────────────│    finds user  │
│  7. Receives    │         │                  │         │                │
│     JWT token   │         │                  │         │ 7. Returns JWT │
│                 │         │                  │         │                │
│  8. Stores JWT  │         │                  │         │                │
│     locally     │         │                  │         │                │
└─────────────────┘         └──────────────────┘         └────────────────┘
```

## 📋 API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google` | Google Sign-In/Sign-Up |
| GET | `/user/me` | Get current user |
| GET | `/user/profile` | Get user profile |
| GET | `/user/dashboard` | Get dashboard data |
| POST | `/user/daily-checkin` | Daily check-in |
| GET | `/mining/status` | Get mining status |
| POST | `/mining/start` | Start mining session |
| POST | `/mining/claim` | Claim mining rewards |
| GET | `/wallet` | Get wallet info |
| GET | `/referrals` | Get referrals |
| GET | `/notifications` | Get notifications |
| GET | `/referrals/validate/:code` | Validate referral code |
| POST | `/auth/logout` | Logout |

## 🎨 UI Features

1. **Splash Screen** - Shows logo while checking auth status
2. **Login Screen** - Google Sign-In button with optional referral code
3. **Home Screen** - Dashboard with:
   - Balance card
   - Mining status with progress
   - Daily check-in
   - Stats (total mined, referrals, streak)

## ⚠️ Important Notes

1. **Never commit Client IDs** to public repositories
2. **Test on real device** - Google Sign-In may not work on emulators properly
3. **Debug vs Release** - You need separate SHA-1 for release builds
4. **Backend must be running** - Make sure your backend server is accessible

## 🛠️ Troubleshooting

### "Sign in cancelled" Error
- User closed the Google sign-in popup

### "ApiException: 10" Error
- SHA-1 fingerprint mismatch
- Package name doesn't match Google Console
- Google Sign-In not properly configured

### "ApiException: 12500" Error  
- Check if Google Play Services is up to date on device

### Network Error
- Check if backend URL is correct
- For Android emulator, use `10.0.2.2` instead of `localhost`
- Check if backend server is running

## 📱 Testing

1. Run the app: `flutter run`
2. Tap "Sign in with Google"
3. Select a Google account
4. You should be redirected to Home screen

## 📞 Support

For any issues, contact the backend admin with:
- Error message screenshot
- Device/Emulator info
- Android/iOS version
