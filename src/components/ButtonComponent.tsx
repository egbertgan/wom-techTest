import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "google" | "secondary" | "logout";
};

export default function ButtonComponent({ title, onPress, disabled, variant = "primary" }: Props) {
  const variantStyle =
    variant === "google"
      ? styles.google
      : variant === "secondary"
        ? styles.secondary
        : variant === "logout"
          ? styles.logout
          : styles.primary;

  return (
    <TouchableOpacity
      style={[styles.button, variantStyle, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, variant === "google" && styles.googleText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#0EA5A4",
  },
  secondary: {
    backgroundColor: "#64748B",
  },
  logout: {
    backgroundColor: "#EF4444",
  },

  google: {
    backgroundColor: "#DB4437",
  },
  text: {
    color: "white",
    fontWeight: "700",
  },
  googleText: {
    color: "white",
  },
  disabled: {
    opacity: 0.6,
  },
});
