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
import Slider from "@react-native-community/slider";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Categories } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest } from "@/lib/query-client";
import type { Budget, InsertBudget } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AddBudget">;
type RouteType = RouteProp<RootStackParamList, "AddBudget">;

const EXPENSE_CATEGORIES = Categories.filter((c) => c.id !== "salary");

export default function AddBudgetModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const budgetId = route.params?.budgetId;
  const isEditing = Boolean(budgetId);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");
  const [alertThreshold, setAlertThreshold] = useState(80);

  const { data: existingBudget, isLoading: loadingBudget } = useQuery<Budget>({
    queryKey: ["/api/budgets", budgetId],
    enabled: isEditing,
  });

  const { data: existingBudgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  useEffect(() => {
    if (existingBudget) {
      setAmount(existingBudget.amount.toString());
      setCategory(existingBudget.category);
      setPeriod(existingBudget.period as "monthly" | "weekly");
      setAlertThreshold(existingBudget.alertThreshold);
    }
  }, [existingBudget]);

  const usedCategories = existingBudgets
    .filter((b) => b.id !== budgetId)
    .map((b) => b.category);

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !usedCategories.includes(c.id) || c.id === category
  );

  const createMutation = useMutation({
    mutationFn: async (data: InsertBudget) => {
      return apiRequest("POST", "/api/budgets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to create budget. This category may already have a budget.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertBudget>) => {
      return apiRequest("PUT", `/api/budgets/${budgetId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to update budget");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/budgets/${budgetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete budget");
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? "Edit Budget" : "Add Budget",
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
  }, [navigation, isEditing, amount, category, period, alertThreshold, theme]);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid budget amount");
      return;
    }

    const budgetData = {
      amount: numAmount,
      category,
      period,
      alertThreshold: Math.round(alertThreshold),
    };

    if (isEditing) {
      updateMutation.mutate(budgetData);
    } else {
      createMutation.mutate(budgetData as InsertBudget);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
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

  if (loadingBudget) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const selectedCategory = Categories.find((c) => c.id === category);

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
      <ThemedText type="body" style={[styles.label, { color: theme.textSecondary }]}>
        Category
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {availableCategories.map((cat) => (
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
        Budget Amount
      </ThemedText>
      <View style={styles.amountContainer}>
        <ThemedText type="h2" style={{ color: theme.primary }}>
          $
        </ThemedText>
        <TextInput
          style={[styles.amountInput, { color: theme.primary }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
        />
      </View>

      <ThemedText type="body" style={[styles.label, { color: theme.textSecondary }]}>
        Period
      </ThemedText>
      <View style={styles.periodToggle}>
        <Pressable
          style={[
            styles.periodButton,
            {
              backgroundColor: period === "monthly" ? theme.primary : theme.backgroundDefault,
              borderTopLeftRadius: BorderRadius.sm,
              borderBottomLeftRadius: BorderRadius.sm,
            },
          ]}
          onPress={() => setPeriod("monthly")}
        >
          <ThemedText
            type="body"
            style={{ color: period === "monthly" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
          >
            Monthly
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.periodButton,
            {
              backgroundColor: period === "weekly" ? theme.primary : theme.backgroundDefault,
              borderTopRightRadius: BorderRadius.sm,
              borderBottomRightRadius: BorderRadius.sm,
            },
          ]}
          onPress={() => setPeriod("weekly")}
        >
          <ThemedText
            type="body"
            style={{ color: period === "weekly" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
          >
            Weekly
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText type="body" style={[styles.label, { color: theme.textSecondary }]}>
        Alert Threshold: {Math.round(alertThreshold)}%
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
        Get notified when spending reaches this percentage
      </ThemedText>
      <Slider
        style={styles.slider}
        minimumValue={50}
        maximumValue={100}
        value={alertThreshold}
        onValueChange={setAlertThreshold}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.backgroundSecondary}
        thumbTintColor={theme.primary}
      />

      {isEditing ? (
        <Pressable
          style={[styles.deleteButton, { backgroundColor: theme.expense + "15" }]}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={20} color={theme.expense} />
          <ThemedText type="body" style={{ color: theme.expense, marginLeft: Spacing.sm }}>
            Delete Budget
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
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  amountInput: {
    fontSize: 40,
    fontWeight: "700",
    minWidth: 100,
    textAlign: "center",
  },
  periodToggle: {
    flexDirection: "row",
    marginBottom: Spacing["2xl"],
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  slider: {
    width: "100%",
    height: 40,
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
