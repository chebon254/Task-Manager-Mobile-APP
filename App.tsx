import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';

// Screens
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import CreateCategoryScreen from './src/screens/CreateCategoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SplashScreenComponent from './src/screens/SplashScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import TasksScreen from './src/screens/TasksScreen';

// Theme
import { Colors } from './src/theme/colors';

// Navigation Types
import {
    AuthStackParamList,
    MainTabParamList,
    RootStackParamList
} from './src/types/navigation';

// Stack and Tab Navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <MainTabs.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTabs.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <MainTabs.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
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
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <RootStack.Screen 
        name="CreateTask" 
        component={CreateTaskScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <RootStack.Screen 
        name="CreateCategory" 
        component={CreateCategoryScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </RootStack.Navigator>
  );
};

// App Content (Inside Auth Provider)
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Hide splash screen after auth check is complete
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Show splash screen
  if (showSplash) {
    return (
      <SplashScreenComponent 
        onFinish={() => setShowSplash(false)} 
      />
    );
  }

  // Show loading while checking auth
  if (isLoading) {
    return null; // Or a loading component
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