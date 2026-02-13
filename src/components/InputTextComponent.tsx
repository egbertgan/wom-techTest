import React, { useState } from "react";
import { TextInput, StyleSheet, Text, View, TextInputProps, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";

type Props = TextInputProps & {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  errorText?: string;
};

export default function InputTextComponent({
  placeholder,
  value,
  onChangeText,
  error = false,
  errorText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  ...rest
}: Props) {
  const [show, setShow] = useState(false);

  const isSecure = Boolean(secureTextEntry) && !show;

  return (
    <View>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={[styles.input, error && styles.errorInput]}
          placeholderTextColor="#7B7F86"
          selectionColor="#0F172A"
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShow((s) => !s)}
            style={styles.toggle}
            accessibilityLabel={show ? "Hide password" : "Show password"}
          >
            <Feather name={show ? "eye-off" : "eye"} size={18} color="#0F172A" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{errorText ?? "Field required"}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E6E9EE",
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  inputWrapper: {
    position: "relative",
  },
  toggle: {
    position: "absolute",
    right: 10,
    top: 18,
  },
  toggleText: {
    fontSize: 18,
  },
  errorInput: {
    borderColor: "#E63946",
  },
  errorText: {
    color: "#E63946",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});
