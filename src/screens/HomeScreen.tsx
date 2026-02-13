import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Switch } from "react-native";
import ButtonComponent from "../components/ButtonComponent";
import { deleteToken, getToken } from "../utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchProducts } from "../services/api";
import ProductItem from "../components/ProductItem";
import { isTokenExpired } from "../utils/jwt";
import { useTheme } from "../theme/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation, route }: Props) {
  const email = route.params?.email ?? "";
  const { colors, toggle, isDark } = useTheme();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      const tokenStr = await getToken();
      if (!tokenStr) {
        navigation.replace("Login");
        return;
      } else {
        try {
          if (isTokenExpired(tokenStr) == true) {
            await deleteToken();
            navigation.replace("Login");
            return;
          }
          if (isRefresh) {
            setRefreshing(true);
            setLoading(true);
          } else {
            setLoading(true);
          }
          setError(null);
          const resp = await fetchProducts(20, 0);
          setData(resp.products || []);
        } catch (e) {
          // invalid token
          await deleteToken();
          navigation.replace("Login");
          return;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load data");
      Alert.alert("Error", err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Run token check and load after back navigation
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!active) return;
        await load();
      })();
      return () => {
        active = false;
      };
    }, [load]),
  );

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 12, paddingTop: 8, alignItems: "flex-end" }}>
          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={isDark ? "#f4f3f4" : "#f4f3f4"}
            style={{ marginBottom: 8 }}
          />
        </View>

        <View style={styles.header}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.email, { color: colors.text, flex: 1, marginRight: 8 }]}
          >
            {email}
          </Text>
          <View style={{ flexShrink: 0 }}>
            <ButtonComponent title="Logout" onPress={handleLogout} variant="logout" />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
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
