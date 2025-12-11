import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { UserSettings } from "@shared/schema";

const AVATARS = [
  { icon: "dollar-sign" as const, color: "#2E7D32" },
  { icon: "credit-card" as const, color: "#1976D2" },
  { icon: "trending-up" as const, color: "#7B1FA2" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      return apiRequest("PUT", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/data");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      Alert.alert("Success", "All data has been cleared.");
    },
  });

  const handleAvatarChange = () => {
    const currentIndex = settings?.avatarIndex || 0;
    const newIndex = (currentIndex + 1) % AVATARS.length;
    updateMutation.mutate({ avatarIndex: newIndex });
  };

  const handleCurrencyChange = () => {
    const currentIndex = CURRENCIES.indexOf(settings?.currency || "USD");
    const newIndex = (currentIndex + 1) % CURRENCIES.length;
    updateMutation.mutate({ currency: CURRENCIES[newIndex] });
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your transactions, budgets, and settings? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Delete",
              "This will permanently delete all your financial data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Everything",
                  style: "destructive",
                  onPress: () => clearDataMutation.mutate(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const avatarIndex = settings?.avatarIndex || 0;
  const avatar = AVATARS[avatarIndex];
  const displayName = settings?.displayName || "User";
  const currency = settings?.currency || "USD";

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.profileHeader}>
        <Pressable
          style={({ pressed }) => [
            styles.avatarContainer,
            { backgroundColor: avatar.color + "20", opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleAvatarChange}
        >
          <Feather name={avatar.icon} size={48} color={avatar.color} />
        </Pressable>
        <ThemedText type="h3" style={styles.displayName}>
          {displayName}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Tap avatar to change
        </ThemedText>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Preferences
      </ThemedText>

      <Card style={styles.settingsCard}>
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            { backgroundColor: pressed ? theme.backgroundDefault : "transparent" },
          ]}
          onPress={handleCurrencyChange}
        >
          <View style={styles.settingLeft}>
            <Feather name="dollar-sign" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingLabel}>
              Currency
            </ThemedText>
          </View>
          <View style={styles.settingRight}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {currency}
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Feather name="bell" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingLabel}>
              Budget Alerts
            </ThemedText>
          </View>
          <Pressable
            style={[
              styles.toggle,
              {
                backgroundColor: settings?.notificationsEnabled
                  ? theme.primary
                  : theme.backgroundSecondary,
              },
            ]}
            onPress={() =>
              updateMutation.mutate({
                notificationsEnabled: !settings?.notificationsEnabled,
              })
            }
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  backgroundColor: "#FFFFFF",
                  transform: [
                    { translateX: settings?.notificationsEnabled ? 20 : 0 },
                  ],
                },
              ]}
            />
          </Pressable>
        </View>
      </Card>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Data
      </ThemedText>

      <Card style={styles.settingsCard}>
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            { backgroundColor: pressed ? theme.backgroundDefault : "transparent" },
          ]}
          onPress={handleClearData}
        >
          <View style={styles.settingLeft}>
            <Feather name="trash-2" size={20} color={theme.expense} />
            <ThemedText type="body" style={[styles.settingLabel, { color: theme.expense }]}>
              Clear All Data
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </Card>

      <ThemedText type="h4" style={styles.sectionTitle}>
        About
      </ThemedText>

      <Card style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Feather name="info" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingLabel}>
              Version
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            1.0.0
          </ThemedText>
        </View>
      </Card>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  displayName: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  settingsCard: {
    padding: 0,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingLabel: {
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
});
