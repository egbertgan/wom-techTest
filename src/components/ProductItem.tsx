import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

type Props = {
  item: any;
  onPress?: () => void;
};

export default function ProductItem({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={styles.image} /> : null}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    marginTop: 4,
    color: "#333",
  },
});
