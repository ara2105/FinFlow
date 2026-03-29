import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AddTransactionModal from "@/screens/AddTransactionModal";
import AddBudgetModal from "@/screens/AddBudgetModal";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  AddTransaction: { transactionId?: string } | undefined;
  AddBudget: { budgetId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionModal}
        options={{
          presentation: "modal",
          headerTitle: "Add Transaction",
        }}
      />
      <Stack.Screen
        name="AddBudget"
        component={AddBudgetModal}
        options={{
          presentation: "modal",
          headerTitle: "Add Budget",
        }}
      />
    </Stack.Navigator>
  );
}
