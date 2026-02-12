import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchProductById } from "../services/api";
import ProductItem from "../components/ProductItem";

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
    return () => {
      mounted = false;
    };
  }, [productParam]);

  if (loading && !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && !product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <ProductItem item={product} />
      <View style={styles.detail}>
        {product.images && product.images.length > 0 ? (
          <Image source={{ uri: product.images[0] }} style={styles.hero} />
        ) : null}
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.desc}>{product.description}</Text>
        <Text style={styles.meta}>Brand: {product.brand}</Text>
        <Text style={styles.meta}>Category: {product.category}</Text>
        <Text style={styles.meta}>Price: ${product.price}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  desc: { fontSize: 14, color: "#333", marginBottom: 8 },
  meta: { fontSize: 14, color: "#555", marginBottom: 4 },
});
