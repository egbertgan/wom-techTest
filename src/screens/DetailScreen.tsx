import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchProductById } from "../services/api";
import ProductItem from "../components/ProductItem";
import ButtonComponent from "../components/ButtonComponent";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export default function DetailScreen({ route }: Props) {
  const productParam = route.params?.product;
  const [product, setProduct] = useState<any | null>(productParam ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (productParam && productParam.id) return; // already have data
      if (!productParam?.id) return;
      try {
        setLoading(true);
        const resp = await fetchProductById(productParam.id);
        if (mounted) setProduct(resp);
      } catch (err: any) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Failed to load detail");
          Alert.alert("Error", err.message || "Failed to load detail");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
  }, [productParam]);
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.gallery}>
          {product.images && product.images.length > 0 ? (
            <Image source={{ uri: product.images[0] }} resizeMode="contain" style={styles.hero} />
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          <View>
            <Text style={styles.meta}>Brand: {product.brand}</Text>
            <Text style={styles.meta}>Category: {product.category}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    padding: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  detail: {
    padding: 12,
  },
  hero: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  headerCard: {
    marginBottom: 12,
  },
  gallery: {
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4, color: "#0F172A" },
  desc: { fontSize: 14, color: "#475569", marginBottom: 8 },
  meta: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  price: { fontSize: 18, color: "#0EA5A4", fontWeight: "800" },
  sectionDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
  },
});
