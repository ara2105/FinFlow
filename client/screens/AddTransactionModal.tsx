import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Categories } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest } from "@/lib/query-client";
import type { Transaction, InsertTransaction } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AddTransaction">;
type RouteType = RouteProp<RootStackParamList, "AddTransaction">;

export default function AddTransactionModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const transactionId = route.params?.transactionId;
  const isEditing = Boolean(transactionId);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(new Date());

  const { data: existingTransaction, isLoading: loadingTransaction } = useQuery<Transaction>({
    queryKey: ["/api/transactions", transactionId],
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingTransaction) {
      setAmount(existingTransaction.amount.toString());
      setDescription(existingTransaction.description || "");
      setCategory(existingTransaction.category);
      setType(existingTransaction.type as "expense" | "income");
      setDate(new Date(existingTransaction.date));
    }
  }, [existingTransaction]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to create transaction");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertTransaction>) => {
      return apiRequest("PUT", `/api/transactions/${transactionId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to update transaction");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/transactions/${transactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete transaction");
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? "Edit Transaction" : "Add Transaction",
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()}>
          <ThemedText type="body">Cancel</ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton
          onPress={handleSave}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
            Save
          </ThemedText>
        </HeaderButton>
      ),
    });
  }, [navigation, isEditing, amount, description, category, type, date, theme]);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    const transactionData = {
      amount: numAmount,
      type,
      category,
      description: description.trim() || null,
      date: date.toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate(transactionData);
    } else {
      createMutation.mutate(transactionData as InsertTransaction);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (loadingTransaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.typeToggle}>
        <Pressable
          style={[
            styles.typeButton,
            {
              backgroundColor: type === "expense" ? theme.expense : theme.backgroundDefault,
              borderTopLeftRadius: BorderRadius.sm,
              borderBottomLeftRadius: BorderRadius.sm,
            },
          ]}
          onPress={() => setType("expense")}
        >
          <ThemedText
            type="body"
            style={{ color: type === "expense" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
          >
            Expense
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.typeButton,
            {
              backgroundColor: type === "income" ? theme.income : theme.backgroundDefault,
              borderTopRightRadius: BorderRadius.sm,
              borderBottomRightRadius: BorderRadius.sm,
            },
          ]}
          onPress={() => setType("income")}
        >
          <ThemedText
            type="body"
            style={{ color: type === "income" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
          >
            Income
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.amountContainer}>
        <ThemedText type="h1" style={{ color: type === "expense" ? theme.expense : theme.income }}>
          $
        </ThemedText>
        <TextInput
          style={[
            styles.amountInput,
            { color: type === "expense" ? theme.expense : theme.income },
          ]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          autoFocus
        />
      </View>

      <ThemedText type="body" style={[styles.label, { color: theme.textSecondary }]}>
        Category
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {Categories.filter((c) =>
          type === "income" ? c.id === "salary" || c.id === "other" : c.id !== "salary"
        ).map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor:
                  category === cat.id ? cat.color + "20" : theme.backgroundDefault,
                borderColor: category === cat.id ? cat.color : "transparent",
              },
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <View style={[styles.categoryIconSmall, { backgroundColor: cat.color + "30" }]}>
              <Feather name={cat.icon} size={20} color={cat.color} />
            </View>
            <ThemedText type="small" style={{ marginTop: Spacing.xs }}>
              {cat.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ThemedText type="body" style={[styles.label, { color: theme.textSecondary }]}>
        Description (optional)
      </ThemedText>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Add a note..."
        placeholderTextColor={theme.textSecondary}
      />

      {isEditing ? (
        <Pressable
          style={[styles.deleteButton, { backgroundColor: theme.expense + "15" }]}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={20} color={theme.expense} />
          <ThemedText type="body" style={{ color: theme.expense, marginLeft: Spacing.sm }}>
            Delete Transaction
          </ThemedText>
        </Pressable>
      ) : null}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  typeToggle: {
    flexDirection: "row",
    marginBottom: Spacing["2xl"],
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "700",
    minWidth: 100,
    textAlign: "center",
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  categoryScroll: {
    marginBottom: Spacing["2xl"],
  },
  categoryContainer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    borderWidth: 2,
    minWidth: 80,
  },
  categoryIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: Spacing["2xl"],
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
  },
});
