import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BudgetsScreen from "@/screens/BudgetsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type BudgetsStackParamList = {
  Budgets: undefined;
};

const Stack = createNativeStackNavigator<BudgetsStackParamList>();

export default function BudgetsStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          headerTitle: "Budgets",
        }}
      />
    </Stack.Navigator>
  );
}
