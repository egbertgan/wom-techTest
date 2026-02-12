import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import ButtonComponent from "../components/ButtonComponent";
import { deleteToken } from "../utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchProducts } from "../services/api";
import ProductItem from "../components/ProductItem";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation, route }: Props) {
  const email = route.params?.email ?? "";

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const resp = await fetchProducts(20, 0);
      setData(resp.products || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load data");
      Alert.alert("Error", err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => load(true), [load]);

  const renderItem = ({ item }: { item: any }) => (
    <ProductItem item={item} onPress={() => navigation.navigate("Detail", { product: item })} />
  );

  const handleLogout = async () => {
    try {
      await deleteToken();
      navigation.replace("Login");
    } catch (err) {
      console.error("Logout failed", err);
      Alert.alert("Error", "Logout failed");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.email}>Logged in as: {email}</Text>
          <ButtonComponent title="Logout" onPress={handleLogout} variant="logout" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : error && data.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: "red" }}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          />
        )}
      </View>
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
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  email: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
