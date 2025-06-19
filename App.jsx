import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import Order from "./Order";
import Restaurant from "./Restaurant";
import Works from "./Works";
import './global.css';
import { useFonts } from 'expo-font';
import RetailLogin from "./Retail/RetailLogin";
import { registerRootComponent } from 'expo';
import Retail from "./Retail/Retail";

registerRootComponent(App);

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'LeagueSpartan-Regular': require('./assets/fonts/LeagueSpartan-VariableFont_wght.ttf')
  });
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RetailLogin" component={RetailLogin} />
          <Stack.Screen name="RetailHome" component={Retail} />
          <Stack.Screen name="Order" component={Order} />
          <Stack.Screen name="Restaurant" component={Restaurant} />
          <Stack.Screen name="HowItWorks" component={Works} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
