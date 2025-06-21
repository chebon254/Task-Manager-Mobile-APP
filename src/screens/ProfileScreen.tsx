import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme/colors';
import { AllScreensParamList } from '../types/navigation';

type YourScreenNavigationProp = NavigationProp<AllScreensParamList>;

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { tasks, categories } = useTask();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Calculate user statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
  const totalCategories = categories.length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your tasks and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Coming Soon',
              'Account deletion feature will be available in a future update.'
            );
          }
        }
      ]
    );
  };

  const openSettings = (settingName: string) => {
    Alert.alert('Coming Soon', `${settingName} settings will be available in a future update.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.joinDate}>Member since {joinDate}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
              <Text style={styles.statValue}>{completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={32} color={Colors.warning} />
              <Text style={styles.statValue}>{pendingTasks}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="folder-outline" size={32} color={Colors.primary} />
              <Text style={styles.statValue}>{totalCategories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={32} color={Colors.info} />
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSubtitle}>Get notified about due tasks</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={notificationsEnabled ? Colors.textPrimary : Colors.textSecondary}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>Switch to dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={darkModeEnabled ? Colors.textPrimary : Colors.textSecondary}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => openSettings('Categories')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="color-palette-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Manage Categories</Text>
                <Text style={styles.settingSubtitle}>Add, edit, or delete categories</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => openSettings('Data Export')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="download-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Export Data</Text>
                <Text style={styles.settingSubtitle}>Download your tasks and data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => openSettings('Backup & Sync')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Backup & Sync</Text>
                <Text style={styles.settingSubtitle}>Sync your data across devices</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Information</Text>
          
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => openSettings('Help Center')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingSubtitle}>Get help and support</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => openSettings('Privacy Policy')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingSubtitle}>How we protect your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => openSettings('Terms of Service')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingSubtitle}>Terms and conditions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.logoutCard}
            onPress={handleLogout}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: Colors.error }]}>Sign Out</Text>
                <Text style={styles.settingSubtitle}>Sign out of your account</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteCard}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={24} color={Colors.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: Colors.error }]}>Delete Account</Text>
                <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

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
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  userSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: Spacing.md,
    ...Shadows.large,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSizes.xxxl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  joinDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  statValue: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  logoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  deleteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs / 2,
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default ProfileScreen;