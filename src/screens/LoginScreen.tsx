import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { generateJWT } from "../utils/jwt";
import { saveToken } from "../utils/storage";
import InputTextComponent from "../components/InputTextComponent";
import ButtonComponent from "../components/ButtonComponent";
import { GOOGLE_AUTH_CONFIG } from "../config/googleAuth";
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { getGoogleUser } from "../services/googleService";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorText, setEmailErrorText] = useState<string | undefined>(undefined);

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://accounts.google.com/o/oauth2/revoke",
  };

  const CLIENT_ID =
    Platform.OS === "ios" ? GOOGLE_AUTH_CONFIG.iosClientId : GOOGLE_AUTH_CONFIG.androidClientId;

  const SCOPES = ["openid", "https://www.googleapis.com/auth/userinfo.email"];

  const REDIRECT_URI = makeRedirectUri({
    native: "com.egbertgan.womtechtest://", // Explicitly add the ://
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      responseType: "code",
    },
    discovery,
  );

  // --- Email/Password Login ---
  const handleEmailLogin = async () => {
    setEmailError(false);
    setEmailErrorText(undefined);
    if (!email) {
      setEmailError(true);
      setEmailErrorText("Email wajib diisi");
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailErrorText("Masukkan email yang valid");
      return;
    }

    try {
      const token = generateJWT(email);
      await saveToken(token);

      navigation.replace("Home", { email });
    } catch (error) {
      console.log(error);
      Alert.alert("Login Failed");
    }
  };

  // --- Google Login ---
  const handleGoogleLogin = async () => {
    if (!request) return;

    try {
      const result = await promptAsync();
      console.log("Google Auth Result:", result);
      if (result.type !== "success") {
        console.warn("Google sign in was cancelled or failed");
        return;
      }

      const { code } = result.params;

      if (!request.codeVerifier) {
        Alert.alert("Error", "Missing code verifier, try again");
        return;
      }
      // Exchange code for token
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code,
          redirectUri: REDIRECT_URI,
          extraParams: {
            code_verifier: request.codeVerifier, // PKCE
          },
        },
        discovery,
      );

      if (!tokenResponse.accessToken) {
        throw new Error("No access token returned from Google");
      }

      // Get user info from Google
      const user = await getGoogleUser(tokenResponse.accessToken);
      const userEmail = user.email;

      // Save JWT and navigate
      const jwtToken = generateJWT(userEmail);
      await saveToken(jwtToken);

      navigation.replace("Home", { email: userEmail });
    } catch (error) {
      console.error("Google login failed:", error);
      Alert.alert("Google Login Failed");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
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

        <ButtonComponent
          title="Sign in with Google"
          onPress={handleGoogleLogin}
          disabled={!request}
          variant="google"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
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
    color: "#0F172A",
  },
});
