import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Context Providers
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { TaskProvider } from "./src/context/TaskContext";

// Screens
import CreateTaskScreen from "./src/screens/CreateTaskScreen";
import CreateCategoryScreen from "./src/screens/CreateCategoryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import SplashScreenComponent from "./src/screens/SplashScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import TasksScreen from "./src/screens/TasksScreen";

// Theme
import { Colors } from "./src/theme/colors";

// Navigation Types
import {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
} from "./src/types/navigation";

// Stack and Tab Navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const { width } = Dimensions.get("window");

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Loading Component for transition states
const LoadingScreen = () => (
  <LinearGradient
    colors={[Colors.gradientStart, Colors.gradientEnd]}
    style={styles.loadingContainer}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <ActivityIndicator size="large" color={Colors.textPrimary} />
  </LinearGradient>
);

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Updated Tab Navigator with floating style
const TabNavigator = () => {
  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Tasks") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "home-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#340f45", // Your specified color
        tabBarInactiveTintColor: "rgba(52, 15, 69, 0.4)", // Lighter version of your color
        tabBarStyle: {
          position: "absolute",
          bottom: 30,
          backgroundColor: Colors.textPrimary,
          borderTopColor: "transparent",
          borderTopWidth: 0,
          borderRadius: 20,
          paddingBottom: 16,
          paddingTop: 16,
          height: 76,
          // Proper centering approach for React Navigation v6+
          marginHorizontal: 20, // This creates equal margins on both sides
          // Remove width and left calculations - let marginHorizontal handle it
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 10,
          borderWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarBackground: () => null,
      })}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <MainTabs.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarLabel: "Tasks" }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </MainTabs.Navigator>
  );
};

// Root Navigator (with modals)
const RootNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
      <RootStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <RootStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <RootStack.Screen
        name="CreateCategory"
        component={CreateCategoryScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </RootStack.Navigator>
  );
};

// App Content (Inside Auth Provider)
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Hide splash screen after auth check is complete
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
    // Add loading state for transition from splash to login/home
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Brief loading period for smooth transition
  };

  // Show splash screen
  if (showSplash) {
    return <SplashScreenComponent onFinish={handleSplashFinish} />;
  }

  // Show loading while checking auth or transitioning
  if (isLoading || isTransitioning) {
    return <LoadingScreen />;
  }

  // Show auth flow or main app based on authentication status
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <TaskProvider>
          <RootNavigator />
        </TaskProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={Colors.gradientStart} />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Add this to containers that need to avoid the floating tab bar
  screenContainer: {
    flex: 1,
    paddingBottom: 76, // 60px tab height + 8px bottom margin + 8px extra spacing
  },

  // For scrollable content, add this to contentContainerStyle
  scrollViewContent: {
    paddingBottom: 76, // Same as above
  },

  // For FlatList components
  flatListContent: {
    paddingBottom: 76,
  },
});
