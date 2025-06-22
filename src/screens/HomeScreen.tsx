import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import { Task, useTask } from '../context/TaskContext';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme/colors';
import { AllScreensParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NavigationProp<AllScreensParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { 
    tasks, 
    categories, 
    isLoading, 
    refreshing, 
    fetchTasks, 
    fetchCategories, 
    refreshData,
    updateTask 
  } = useTask();

  const [greeting, setGreeting] = useState('');

  // Debug function to test direct API calls
  // const testApiCall = async () => {
  //   try {
  //     // Get token from storage
  //     const token = await AsyncStorage.getItem('access_token');
  //     console.log('Token from storage:', token?.substring(0, 20) + '...');
      
  //     if (!token) {
  //       console.error('No token found in storage');
  //       Alert.alert('Debug', 'No token found in storage');
  //       return;
  //     }

  //     // Make a direct API call
  //     const response = await axios.get(
  //       'https://humane-properly-bug.ngrok-free.app/api/tasks',
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //           'ngrok-skip-browser-warning': 'true',
  //         },
  //         timeout: 10000,
  //       }
  //     );

  //     console.log('Direct API call success:', response.data);
  //     Alert.alert('Debug Success', `Got ${response.data.data?.tasks?.length || 0} tasks`);
  //   } catch (error: any) {
  //     console.error('Direct API call error:', error.response?.data || error.message);
  //     Alert.alert('Debug Error', error.response?.data?.message || error.message);
  //   }
  // };

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Only fetch data if user is authenticated and we have a token
    if (user && user.id) {
      // Add a small delay to ensure auth state is fully set
      const timer = setTimeout(() => {
        loadData();
      }, 500); // Increased delay to 500ms
      
      return () => clearTimeout(timer);
    }
  }, [user]); // Depend on user instead of empty array

  const loadData = async () => {
    try {
      console.log('Loading data for user:', user?.email);
      
      // Check if we have tokens first
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found, skipping data load');
        return;
      }
      
      await Promise.all([fetchTasks(), fetchCategories()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    }
  };

  const handleTaskToggle = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status === 'PENDING';
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get due soon tasks (next 7 days)
  const dueSoonTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= nextWeek;
  }).slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <View style={styles.headerActions}>
              {/* Debug Button */}
              {/* <TouchableOpacity 
                style={styles.debugButton}
                onPress={testApiCall}
              >
                <Ionicons name="bug" size={20} color={Colors.textPrimary} />
              </TouchableOpacity> */}
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { flex: 2 }]}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Completion Rate</Text>
                <Text style={styles.statValue}>{completionRate}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${completionRate}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                <Text style={styles.statValue}>{completedTasks}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="time-outline" size={24} color={Colors.warning} />
                <Text style={styles.statValue}>{pendingTasks}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="alert-circle" size={24} color={Colors.error} />
                <Text style={styles.statValue}>{overdueTasks}</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('CreateTask')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={28} color={Colors.textPrimary} />
                <Text style={styles.quickActionText}>New Task</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Tasks')}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="list" size={28} color={Colors.primary} />
                <Text style={[styles.quickActionText, { color: Colors.textDark }]}>
                  All Tasks
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Due Soon */}
        {dueSoonTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Due Soon</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {dueSoonTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <View style={styles.taskContent}>
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => handleTaskToggle(task)}
                  >
                    <Ionicons
                      name={task.status === 'COMPLETED' ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={task.status === 'COMPLETED' ? Colors.success : Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text 
                      style={[
                        styles.taskTitle,
                        task.status === 'COMPLETED' && styles.completedTaskTitle
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View 
                        style={[
                          styles.categoryDot, 
                          { backgroundColor: task.category.color }
                        ]} 
                      />
                      <Text style={styles.categoryName}>{task.category.name}</Text>
                      {task.dueDate && (
                        <>
                          <Text style={styles.metaSeparator}>•</Text>
                          <Text style={styles.dueDate}>
                            {formatDate(task.dueDate)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Tasks */}
        {recentTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Tasks</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <View style={styles.taskContent}>
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => handleTaskToggle(task)}
                  >
                    <Ionicons
                      name={task.status === 'COMPLETED' ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={task.status === 'COMPLETED' ? Colors.success : Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text 
                      style={[
                        styles.taskTitle,
                        task.status === 'COMPLETED' && styles.completedTaskTitle
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View 
                        style={[
                          styles.categoryDot, 
                          { backgroundColor: task.category.color }
                        ]} 
                      />
                      <Text style={styles.categoryName}>{task.category.name}</Text>
                      {task.dueDate && (
                        <>
                          <Text style={styles.metaSeparator}>•</Text>
                          <Text style={styles.dueDate}>
                            {formatDate(task.dueDate)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Tasks Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first task to get started with organizing your day!
            </Text>
            <TouchableOpacity 
              style={styles.createFirstTaskButton}
              onPress={() => navigation.navigate('CreateTask')}
            >
              <Text style={styles.createFirstTaskText}>Create First Task</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    opacity: 0.9,
  },
  userName: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  avatarContainer: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.small,
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textPrimary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
  seeAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  quickActionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  quickActionContent: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
  },
  quickActionText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.sm,
  },
  taskCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  taskCheckbox: {
    marginRight: Spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  metaSeparator: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.xs,
  },
  dueDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  createFirstTaskButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.medium,
  },
  createFirstTaskText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;