import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/HomeScreen";
import Order from "./src/Order";
import Restaurant from "./src/Restaurant";
import Works from "./src/Works";
import { useFonts } from 'expo-font';
import RetailLogin from "./src/Retail/RetailLogin";
import { registerRootComponent } from 'expo';
import Retail from "./src/Retail/Retail";
import RetailRegister from "./src/Retail/RetailRegister";
import { Appearance } from "react-native";

registerRootComponent(App);

const Stack = createNativeStackNavigator();

// Force appearance to light mode
Appearance.set({ colorScheme: 'light' });

export default function App() {
  const [fontsLoaded] = useFonts({
    'LeagueSpartan-Regular': require('./assets/fonts/LeagueSpartan-VariableFont_wght.ttf')
  });
  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="RetailLogin" component={RetailLogin} />
        <Stack.Screen name="RetailRegister" component={RetailRegister} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RetailHome" component={Retail} />
        <Stack.Screen name="Order" component={Order} />
        <Stack.Screen name="Restaurant" component={Restaurant} />
        <Stack.Screen name="HowItWorks" component={Works} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
