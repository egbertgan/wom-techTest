import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { generateJWT } from "../utils/jwt";
import { saveToken } from "../utils/storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { getGoogleUser } from "../services/googleService";
import InputTextComponent from "../components/InputTextComponent";
import ButtonComponent from "../components/ButtonComponent";
import { GOOGLE_AUTH_CONFIG } from "../config/googleAuth";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_AUTH_CONFIG.androidClientId,
    iosClientId: GOOGLE_AUTH_CONFIG.iosClientId,
  });

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email & password required");
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

  const handleGoogleLogin = async () => {
    console.log(request?.redirectUri);

    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;

      if (!accessToken) return;

      try {
        const user = await getGoogleUser(accessToken);

        const userEmail = user.email;

        const jwtToken = generateJWT(userEmail);
        await saveToken(jwtToken);

        navigation.replace("Home", { email: userEmail });
      } catch (error) {
        console.log(error);
        Alert.alert("Google Login Failed");
      }
    }
  };

  useEffect(() => {
    handleGoogleLogin();
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <InputTextComponent placeholder="Email" value={email} onChangeText={setEmail} />

      <InputTextComponent
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <ButtonComponent title="Login with Email" onPress={handleEmailLogin} />

      <View style={{ marginVertical: 10 }} />

      <ButtonComponent title="Login with Google" onPress={() => promptAsync()} disabled={!request} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
});
