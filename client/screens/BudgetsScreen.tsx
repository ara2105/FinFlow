import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Categories } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest } from "@/lib/query-client";
import type { Budget, Transaction } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryInfo(categoryId: string) {
  return Categories.find((c) => c.id === categoryId) || Categories[Categories.length - 1];
}

function getDaysRemaining(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
}

function getMonthDateRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate, endDate };
}

interface ProgressBarProps {
  progress: number;
  color: string;
}

function ProgressBar({ progress, color }: ProgressBarProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clampedProgress}%`, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    }),
  }));

  return (
    <View style={[styles.progressBar, { backgroundColor: theme.backgroundDefault }]}>
      <Animated.View
        style={[
          styles.progressFill,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { startDate, endDate } = getMonthDateRange();

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", startDate.toISOString(), endDate.toISOString()],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    },
  });

  const budgetData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return budgets.map((budget) => {
      const spent = expensesByCategory[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      let color = theme.income;
      if (percentage >= 90) {
        color = theme.expense;
      } else if (percentage >= 70) {
        color = theme.warning;
      }

      return {
        ...budget,
        spent,
        percentage,
        color,
      };
    });
  }, [budgets, transactions, theme]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const daysRemaining = getDaysRemaining();

  const handleDelete = (id: string, category: string) => {
    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete the ${getCategoryInfo(category).name} budget?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  if (budgetsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl + 80,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {budgets.length > 0 ? (
          <Card style={styles.overallCard}>
            <View style={styles.overallHeader}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Monthly Budget
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {daysRemaining} days remaining
              </ThemedText>
            </View>
            <View style={styles.overallAmounts}>
              <ThemedText type="h3">
                {formatCurrency(totalSpent)}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {" / "}{formatCurrency(totalBudget)}
              </ThemedText>
            </View>
            <ProgressBar
              progress={totalPercentage}
              color={
                totalPercentage >= 90
                  ? theme.expense
                  : totalPercentage >= 70
                  ? theme.warning
                  : theme.income
              }
            />
          </Card>
        ) : null}

        <ThemedText type="h4" style={styles.sectionTitle}>
          Category Budgets
        </ThemedText>

        {budgetData.length > 0 ? (
          budgetData.map((budget) => {
            const category = getCategoryInfo(budget.category);
            return (
              <Pressable
                key={budget.id}
                onPress={() => navigation.navigate("AddBudget", { budgetId: budget.id })}
                onLongPress={() => handleDelete(budget.id, budget.category)}
              >
                <Card style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
                      <Feather name={category.icon} size={20} color={category.color} />
                    </View>
                    <View style={styles.budgetInfo}>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>
                        {category.name}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {Math.round(budget.percentage)}% used
                      </ThemedText>
                    </View>
                    <View style={styles.budgetAmounts}>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>
                        {formatCurrency(budget.spent)}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        / {formatCurrency(budget.amount)}
                      </ThemedText>
                    </View>
                  </View>
                  <ProgressBar progress={budget.percentage} color={budget.color} />
                </Card>
              </Pressable>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Feather name="pie-chart" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No budgets set
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Tap + to create your first budget
            </ThemedText>
          </Card>
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: tabBarHeight + Spacing.lg,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => navigation.navigate("AddBudget")}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overallCard: {
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  overallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  overallAmounts: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  budgetCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetAmounts: {
    alignItems: "flex-end",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyCard: {
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
