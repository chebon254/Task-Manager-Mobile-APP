import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Task, useTask } from '../context/TaskContext';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme/colors';
import { AllScreensParamList } from '../types/navigation';

type YourScreenNavigationProp = NavigationProp<AllScreensParamList>;

type TaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

const TaskDetailScreen = () => {
  const navigation = useNavigation<YourScreenNavigationProp>();
  const route = useRoute();
  const { taskId } = route.params as { taskId: string };
  
  const { tasks, updateTask, deleteTask } = useTask();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId, tasks]);

  const loadTask = () => {
    const foundTask = tasks.find(t => t.id === taskId);
    setTask(foundTask || null);
    setIsLoading(false);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    try {
      setIsUpdating(true);
      await updateTask(task.id, { status: newStatus });
      setTask({ ...task, status: newStatus });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDelete 
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!task) return;

    try {
      setIsUpdating(true);
      await deleteTask(task.id);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete task');
      setIsUpdating(false);
    }
  };

  const shareTask = async () => {
    if (!task) return;

    try {
      const shareContent = `Task: ${task.title}\n${task.description ? `Description: ${task.description}\n` : ''}Status: ${task.status}\nCategory: ${task.category.name}${task.dueDate ? `\nDue: ${formatDate(task.dueDate)}` : ''}`;
      
      await Share.share({
        message: shareContent,
        title: task.title,
      });
    } catch (error) {
      console.error('Error sharing task:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return Colors.success;
      case 'CANCELLED':
        return Colors.error;
      default:
        return Colors.warning;
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'time-outline';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Task Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The task you're looking for doesn't exist or has been deleted.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareTask}
          >
            <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Title */}
        <View style={styles.titleSection}>
          <Text style={[
            styles.taskTitle,
            task.status === 'COMPLETED' && styles.completedTitle
          ]}>
            {task.title}
          </Text>
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) }
          ]}>
            <Ionicons 
              name={getStatusIcon(task.status)} 
              size={16} 
              color={Colors.textPrimary} 
            />
            <Text style={styles.statusText}>
              {task.status.charAt(0) + task.status.slice(1).toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.categorySection}>
          <View style={styles.categoryInfo}>
            <View 
              style={[
                styles.categoryDot, 
                { backgroundColor: task.category.color }
              ]} 
            />
            <Text style={styles.categoryName}>{task.category.name}</Text>
          </View>
        </View>

        {/* Due Date */}
        {task.dueDate && (
          <View style={styles.dueDateSection}>
            <View style={styles.dueDateInfo}>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={isOverdue(task) ? Colors.error : Colors.primary} 
              />
              <View style={styles.dueDateText}>
                <Text style={[
                  styles.dueDateTitle,
                  isOverdue(task) && { color: Colors.error }
                ]}>
                  Due Date
                </Text>
                <Text style={[
                  styles.dueDateValue,
                  isOverdue(task) && { color: Colors.error }
                ]}>
                  {formatDate(task.dueDate)}
                </Text>
                {task.status === 'PENDING' && (
                  <Text style={[
                    styles.dueDateHelper,
                    isOverdue(task) && { color: Colors.error }
                  ]}>
                    {isOverdue(task) 
                      ? `Overdue by ${Math.abs(getDaysUntilDue(task.dueDate))} days`
                      : getDaysUntilDue(task.dueDate) === 0 
                      ? 'Due today'
                      : getDaysUntilDue(task.dueDate) === 1
                      ? 'Due tomorrow'
                      : `${getDaysUntilDue(task.dueDate)} days remaining`
                    }
                  </Text>
                )}
              </View>
            </View>
            {isOverdue(task) && task.status === 'PENDING' && (
              <Ionicons name="alert-circle" size={24} color={Colors.error} />
            )}
          </View>
        )}

        {/* Description */}
        {task.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{task.description}</Text>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.timestampsSection}>
          <Text style={styles.sectionTitle}>Task Information</Text>
          <View style={styles.timestampRow}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.timestampLabel}>Created:</Text>
            <Text style={styles.timestampValue}>{formatDateTime(task.createdAt)}</Text>
          </View>
          <View style={styles.timestampRow}>
            <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.timestampLabel}>Updated:</Text>
            <Text style={styles.timestampValue}>{formatDateTime(task.updatedAt)}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {/* Status Actions */}
          <View style={styles.statusActions}>
            {task.status !== 'COMPLETED' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.success }]}
                onPress={() => handleStatusChange('COMPLETED')}
                disabled={isUpdating}
              >
                <Ionicons name="checkmark-circle" size={20} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'PENDING' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.warning }]}
                onPress={() => handleStatusChange('PENDING')}
                disabled={isUpdating}
              >
                <Ionicons name="time-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Mark Pending</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'CANCELLED' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.error }]}
                onPress={() => handleStatusChange('CANCELLED')}
                disabled={isUpdating}
              >
                <Ionicons name="close-circle" size={20} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Cancel Task</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.deleteButton, isUpdating && styles.disabledButton]}
          onPress={handleDeleteTask}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.medium,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  taskTitle: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    lineHeight: 32,
    marginBottom: Spacing.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  categorySection: {
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  dueDateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dueDateText: {
    flex: 1,
  },
  dueDateTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  dueDateValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs / 2,
  },
  dueDateHelper: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  descriptionSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  timestampsSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  timestampLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    minWidth: 60,
  },
  timestampValue: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  actionsSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  statusActions: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  actionButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: FontSizes.md,
    color: Colors.error,
    fontWeight: FontWeights.medium,
  },
});

export default TaskDetailScreen;