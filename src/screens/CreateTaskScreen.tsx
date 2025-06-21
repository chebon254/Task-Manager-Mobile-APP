import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTask } from '../context/TaskContext';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme/colors';
import { AllScreensParamList } from '../types/navigation';

type YourScreenNavigationProp = NavigationProp<AllScreensParamList>;

type TaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

const CreateTaskScreen = () => {
  const navigation = useNavigation<YourScreenNavigationProp>();
  const { categories, createTask, fetchCategories, isLoading } = useTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      await fetchCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate?.toISOString(),
        status,
        categoryId: selectedCategoryId,
      });

      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const removeDueDate = () => {
    setDueDate(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (taskStatus: TaskStatus) => {
    switch (taskStatus) {
      case 'COMPLETED':
        return Colors.success;
      case 'CANCELLED':
        return Colors.error;
      default:
        return Colors.warning;
    }
  };

  const getStatusIcon = (taskStatus: TaskStatus) => {
    switch (taskStatus) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'time-outline';
    }
  };

  const handleCreateCategory = () => {
    navigation.navigate('CreateCategory');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Task</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter task title..."
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              multiline={false}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Task Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add task description..."
              placeholderTextColor={Colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category</Text>
            <TouchableOpacity 
              style={styles.addCategoryButton}
              onPress={handleCreateCategory}
            >
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addCategoryText}>Add Category</Text>
            </TouchableOpacity>
          </View>
          
          {categories.length === 0 ? (
            <View style={styles.noCategoriesContainer}>
              <Ionicons name="folder-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.noCategoriesTitle}>No Categories Yet</Text>
              <Text style={styles.noCategoriesSubtitle}>
                Create your first category to organize your tasks
              </Text>
              <TouchableOpacity 
                style={styles.createFirstCategoryButton}
                onPress={handleCreateCategory}
              >
                <Text style={styles.createFirstCategoryText}>Create Category</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategoryId === category.id && styles.selectedCategoryCard
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <View 
                    style={[
                      styles.categoryColor, 
                      { backgroundColor: category.color }
                    ]} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategoryId === category.id && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                  {selectedCategoryId === category.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color={Colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date (Optional)</Text>
          {dueDate ? (
            <View style={styles.dueDateContainer}>
              <View style={styles.dueDateInfo}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.dueDateText}>{formatDate(dueDate)}</Text>
              </View>
              <View style={styles.dueDateActions}>
                <TouchableOpacity 
                  style={styles.dueDateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dueDateButtonText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dueDateButton}
                  onPress={removeDueDate}
                >
                  <Text style={[styles.dueDateButtonText, { color: Colors.error }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addDueDateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.addDueDateText}>Add due date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            {(['PENDING', 'COMPLETED', 'CANCELLED'] as TaskStatus[]).map((taskStatus) => (
              <TouchableOpacity
                key={taskStatus}
                style={[
                  styles.statusCard,
                  status === taskStatus && styles.selectedStatusCard
                ]}
                onPress={() => setStatus(taskStatus)}
              >
                <Ionicons 
                  name={getStatusIcon(taskStatus)}
                  size={20} 
                  color={status === taskStatus ? Colors.textPrimary : getStatusColor(taskStatus)} 
                />
                <Text style={[
                  styles.statusText,
                  status === taskStatus && styles.selectedStatusText
                ]}>
                  {taskStatus.charAt(0) + taskStatus.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton, 
            (!title.trim() || !selectedCategoryId || isSubmitting) && styles.disabledButton
          ]}
          onPress={handleCreateTask}
          disabled={!title.trim() || !selectedCategoryId || isSubmitting}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={Colors.textPrimary} />
                <Text style={styles.createButtonText}>Create Task</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  closeButton: {
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
  placeholder: {
    width: 40,
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
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addCategoryText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  inputContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  textInput: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    padding: Spacing.md,
    fontWeight: FontWeights.medium,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  noCategoriesContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  noCategoriesTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  noCategoriesSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  createFirstCategoryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  createFirstCategoryText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  categoriesContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
    minWidth: 100,
  },
  selectedCategoryCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  selectedCategoryText: {
    color: Colors.textPrimary,
  },
  dueDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadows.small,
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dueDateText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
  dueDateActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dueDateButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dueDateButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  addDueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  addDueDateText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    ...Shadows.small,
  },
  selectedStatusCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  selectedStatusText: {
    color: Colors.textPrimary,
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
  createButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    gap: Spacing.sm,
  },
  createButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
});

export default CreateTaskScreen;