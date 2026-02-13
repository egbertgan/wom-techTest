import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, Switch } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { generateJWT } from "../utils/jwt";
import { saveToken } from "../utils/storage";
import InputTextComponent from "../components/InputTextComponent";
import ButtonComponent from "../components/ButtonComponent";
import { GOOGLE_AUTH_CONFIG } from "../config/googleAuth";

// Import library baru
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useTheme } from "../theme/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorText, setEmailErrorText] = useState<string | undefined>(undefined);

  // Inisialisasi Google Sign-In saat komponen dimuat
  useEffect(() => {
    GoogleSignin.configure({
      // PENTING: Gunakan webClientId dari Google Cloud Console meskipun di Android/iOS
      webClientId: GOOGLE_AUTH_CONFIG.webClientId,
      offlineAccess: false,
      scopes: ["profile", "email"],
    });
  }, []);
  const { colors, toggle, isDark } = useTheme();

  const handleEmailLogin = async () => {
    // ... (Logika email login tetap sama seperti sebelumnya)
    if (!email) {
      setEmailError(true);
      setEmailErrorText("Email wajib diisi");
      return;
    }
    const token = generateJWT(email);
    await saveToken(token);
    navigation.replace("Home", { email });
  };

  // --- Google Login (Versi Baru) ---
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log(response?.data?.idToken);
      // Data user berada di response.data (versi terbaru library)
      const userEmail = response.data?.user.email;

      if (userEmail) {
        const jwtToken = generateJWT(userEmail);
        await saveToken(jwtToken);
        navigation.replace("Home", { email: userEmail });
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User membatalkan login");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Proses login sedang berjalan");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Play Services tidak tersedia");
      } else {
        console.error("Google Login Error:", error);
        Alert.alert("Login Gagal", "Terjadi kesalahan saat login dengan Google");
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 12, alignItems: "flex-end" }}>
        <Switch
          value={isDark}
          onValueChange={toggle}
          trackColor={{ false: "#767577", true: colors.primary }}
          thumbColor={isDark ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
        <InputTextComponent
          placeholder="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (t) {
              setEmailError(false);
              setEmailErrorText(undefined);
            }
          }}
          keyboardType="email-address"
          error={emailError}
          errorText={emailErrorText}
        />

        <InputTextComponent
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
        />

        <ButtonComponent title="Login" onPress={handleEmailLogin} variant="primary" />

        <View style={{ marginVertical: 8 }} />

        {/* Properti disabled={!request} dihapus karena tidak lagi diperlukan */}
        <ButtonComponent title="Sign in with Google" onPress={handleGoogleLogin} variant="google" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    marginBottom: 14,
    textAlign: "center",
    fontWeight: "700",
  },
});
