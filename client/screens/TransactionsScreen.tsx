import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Categories } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest } from "@/lib/query-client";
import type { Transaction } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterType = "all" | "today" | "week" | "month";

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

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
}

function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: { [key: string]: Transaction[] } = {};
  
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });

  return Object.entries(groups)
    .map(([date, items]) => ({
      date: new Date(date),
      data: items,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    const now = new Date();

    if (filter === "today") {
      result = result.filter((t) => new Date(t.date).toDateString() === now.toDateString());
    } else if (filter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((t) => new Date(t.date) >= weekAgo);
    } else if (filter === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((t) => new Date(t.date) >= monthAgo);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          getCategoryInfo(t.category).name.toLowerCase().includes(query)
      );
    }

    return groupTransactionsByDate(result);
  }, [transactions, filter, searchQuery]);

  const handleDelete = (id: string, description: string) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${description || 'this transaction'}"?`,
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

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = getCategoryInfo(item.category);
    const isExpense = item.type === "expense";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.transactionItem,
          {
            backgroundColor: pressed ? theme.backgroundDefault : theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
        onLongPress={() => handleDelete(item.id, item.description || "")}
        onPress={() => navigation.navigate("AddTransaction", { transactionId: item.id })}
      >
        <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
          <Feather name={category.icon} size={20} color={category.color} />
        </View>
        <View style={styles.transactionDetails}>
          <ThemedText type="body" numberOfLines={1}>
            {item.description || category.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </ThemedText>
        </View>
        <ThemedText
          type="body"
          style={{ color: isExpense ? theme.expense : theme.income, fontWeight: "600" }}
        >
          {isExpense ? "-" : "+"}{formatCurrency(item.amount)}
        </ThemedText>
      </Pressable>
    );
  };

  const renderSection = ({ item }: { item: { date: Date; data: Transaction[] } }) => (
    <View style={styles.section}>
      <ThemedText type="small" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
        {formatDate(item.date)}
      </ThemedText>
      {item.data.map((transaction) => (
        <View key={transaction.id}>{renderTransaction({ item: transaction })}</View>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? theme.primary : theme.backgroundDefault,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <ThemedText
              type="small"
              style={{ color: filter === f.key ? "#FFFFFF" : theme.text }}
            >
              {f.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderSection}
        keyExtractor={(item) => item.date.toISOString()}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl + 80,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Feather name="inbox" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No transactions found
            </ThemedText>
          </Card>
        }
      />

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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    height: 44,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
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
  emptyCard: {
    padding: Spacing["3xl"],
    alignItems: "center",
    marginTop: Spacing["2xl"],
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
