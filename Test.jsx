import "./global.css"; // Make sure the path is correct
import { StatusBar } from "expo-status-bar";
import { Text, View, Image } from "react-native";

export default function Test() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-100 p-4">
            <Text className="text-3xl font-bold text-purple-700 mb-4">
                Welcome to NativeWind!
            </Text>
            <Image
                source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
                className="w-24 h-24 rounded-full shadow-md"
            />
            <Text className="text-lg text-gray-600 mt-4">
                Styling React Native with ease.
            </Text>
            <View className="mt-8 p-3 bg-blue-500 rounded-lg">
                <Text className="text-white text-base">
                    This button is styled with Tailwind!
                </Text>
            </View>
        </View>
    );
}