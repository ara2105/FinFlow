import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Svg, { G, Path, Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Categories } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Transaction, Budget } from "@shared/schema";

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

function getMonthDateRange(date: Date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { startDate, endDate };
}

interface DonutChartProps {
  data: { category: string; amount: number; color: string }[];
  size: number;
}

function DonutChart({ data, size }: DonutChartProps) {
  const { theme } = useTheme();
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const radius = size / 2 - 20;
  const strokeWidth = 30;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0 || data.length === 0) {
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
    );
  }

  let cumulativePercent = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${center}, ${center}`}>
        {data.map((item, index) => {
          const percent = item.amount / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}
      </G>
    </Svg>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const currentDate = new Date();
  const { startDate, endDate } = getMonthDateRange(currentDate);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", startDate.toISOString(), endDate.toISOString()],
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { totalIncome, totalExpenses, netBalance, categoryBreakdown, recentTransactions } = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    
    const breakdown: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });

    const chartData = Object.entries(breakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        color: getCategoryInfo(category).color,
      }))
      .sort((a, b) => b.amount - a.amount);

    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      categoryBreakdown: chartData,
      recentTransactions: recent,
    };
  }, [transactions]);

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (transactionsLoading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl + 80,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h3" style={styles.monthTitle}>
          {monthName}
        </ThemedText>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { flex: 1, marginRight: Spacing.sm }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Income
            </ThemedText>
            <ThemedText type="h4" style={{ color: theme.income }}>
              {formatCurrency(totalIncome)}
            </ThemedText>
          </Card>
          <Card style={[styles.summaryCard, { flex: 1, marginLeft: Spacing.sm }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Expenses
            </ThemedText>
            <ThemedText type="h4" style={{ color: theme.expense }}>
              {formatCurrency(totalExpenses)}
            </ThemedText>
          </Card>
        </View>

        <Card style={styles.balanceCard}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Net Balance
          </ThemedText>
          <ThemedText
            type="h2"
            style={{ color: netBalance >= 0 ? theme.income : theme.expense }}
          >
            {formatCurrency(netBalance)}
          </ThemedText>
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Spending by Category
        </ThemedText>

        {categoryBreakdown.length > 0 ? (
          <Card style={styles.chartCard}>
            <View style={styles.chartContainer}>
              <DonutChart data={categoryBreakdown} size={180} />
            </View>
            <View style={styles.legendContainer}>
              {categoryBreakdown.slice(0, 4).map((item) => (
                <View key={item.category} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <ThemedText type="small" style={{ flex: 1 }}>
                    {getCategoryInfo(item.category).name}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {formatCurrency(item.amount)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Feather name="pie-chart" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No spending data yet
            </ThemedText>
          </Card>
        )}

        <ThemedText type="h4" style={styles.sectionTitle}>
          Recent Transactions
        </ThemedText>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => {
            const category = getCategoryInfo(transaction.category);
            const isExpense = transaction.type === "expense";
            return (
              <Pressable
                key={transaction.id}
                style={({ pressed }) => [
                  styles.transactionItem,
                  { backgroundColor: pressed ? theme.backgroundDefault : theme.cardBackground },
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
                  <Feather name={category.icon} size={20} color={category.color} />
                </View>
                <View style={styles.transactionDetails}>
                  <ThemedText type="body" numberOfLines={1}>
                    {transaction.description || category.name}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText
                  type="body"
                  style={{ color: isExpense ? theme.expense : theme.income, fontWeight: "600" }}
                >
                  {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
                </ThemedText>
              </Pressable>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Feather name="inbox" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No transactions yet
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Tap the + button to add one
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
        onPress={() => navigation.navigate("AddTransaction")}
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
  monthTitle: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.lg,
  },
  balanceCard: {
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chartCard: {
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  legendContainer: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyCard: {
    padding: Spacing["3xl"],
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
    marginRight: Spacing.md,
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
