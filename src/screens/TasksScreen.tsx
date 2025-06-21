import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Task, TaskFilters, useTask } from '../context/TaskContext';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme/colors';
import { AllScreensParamList } from '../types/navigation';

type FilterTab = 'all' | 'pending' | 'completed' | 'cancelled';
type TasksScreenNavigationProp = NavigationProp<AllScreensParamList>;

const TasksScreen = () => {
  const navigation = useNavigation<TasksScreenNavigationProp>();
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

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters when they change
    applyFilters();
  }, [activeFilter, searchQuery, selectedCategoryId]);

  const loadData = async () => {
    try {
      await Promise.all([fetchTasks(), fetchCategories()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const filters: TaskFilters = {};
      
      if (activeFilter !== 'all') {
        filters.status = activeFilter.toUpperCase() as 'PENDING' | 'COMPLETED' | 'CANCELLED';
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      if (selectedCategoryId) {
        filters.categoryId = selectedCategoryId;
      }

      await fetchTasks(filters);
    } catch (error) {
      console.error('Error applying filters:', error);
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

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setSelectedCategoryId(null);
  };

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

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getTaskCount = (filter: FilterTab) => {
    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === 'PENDING').length;
      case 'completed':
        return tasks.filter(task => task.status === 'COMPLETED').length;
      case 'cancelled':
        return tasks.filter(task => task.status === 'CANCELLED').length;
      default:
        return tasks.length;
    }
  };

  const renderTaskItem = ({ item: task }: { item: Task }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        isOverdue(task) && styles.overdueTask
      ]}
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
            color={
              task.status === 'COMPLETED' 
                ? Colors.success 
                : isOverdue(task) 
                ? Colors.error 
                : Colors.textSecondary
            }
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
          {task.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          )}
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
                <Text style={[
                  styles.dueDate,
                  isOverdue(task) && styles.overdueDateText
                ]}>
                  {formatDate(task.dueDate)}
                </Text>
                {isOverdue(task) && (
                  <Ionicons 
                    name="alert-circle" 
                    size={14} 
                    color={Colors.error} 
                    style={styles.overdueIcon} 
                  />
                )}
              </>
            )}
          </View>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <Ionicons name="add" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabs}
          contentContainerStyle={styles.filterTabsContent}
        >
          {(['all', 'pending', 'completed', 'cancelled'] as FilterTab[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === filter && styles.activeFilterTabText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
              <View style={styles.filterTabBadge}>
                <Text style={styles.filterTabBadgeText}>
                  {getTaskCount(filter)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilters}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryFilter,
              !selectedCategoryId && styles.activeCategoryFilter
            ]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[
              styles.categoryFilterText,
              !selectedCategoryId && styles.activeCategoryFilterText
            ]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryFilter,
                selectedCategoryId === category.id && styles.activeCategoryFilter
              ]}
              onPress={() => setSelectedCategoryId(
                selectedCategoryId === category.id ? null : category.id
              )}
            >
              <View 
                style={[
                  styles.categoryFilterDot, 
                  { backgroundColor: category.color }
                ]} 
              />
              <Text style={[
                styles.categoryFilterText,
                selectedCategoryId === category.id && styles.activeCategoryFilterText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Clear Filters */}
        {(activeFilter !== 'all' || searchQuery || selectedCategoryId) && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tasks List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        style={styles.tasksList}
        contentContainerStyle={styles.tasksListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons 
              name={searchQuery ? "search" : "document-outline"} 
              size={64} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Results Found' : 'No Tasks'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `No tasks match "${searchQuery}"`
                : 'Create your first task to get started!'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.createTaskButton}
                onPress={() => navigation.navigate('CreateTask')}
              >
                <Text style={styles.createTaskText}>Create Task</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
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
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  searchContainer: {
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  filtersContainer: {
    backgroundColor: Colors.backgroundLight,
    paddingVertical: Spacing.sm,
  },
  filterTabs: {
    marginBottom: Spacing.sm,
  },
  filterTabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  activeFilterTabText: {
    color: Colors.textPrimary,
  },
  filterTabBadge: {
    backgroundColor: Colors.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  filterTabBadgeText: {
    fontSize: 10,
    color: Colors.background,
    fontWeight: FontWeights.semibold,
  },
  categoryFilters: {
    marginBottom: Spacing.sm,
  },
  categoryFiltersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  activeCategoryFilter: {
    backgroundColor: Colors.primary,
  },
  categoryFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryFilterText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  activeCategoryFilterText: {
    color: Colors.textPrimary,
  },
  clearFiltersButton: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearFiltersText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    padding: Spacing.lg,
  },
  taskCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  overdueTask: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
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
  taskDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
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
  overdueDateText: {
    color: Colors.error,
    fontWeight: FontWeights.medium,
  },
  overdueIcon: {
    marginLeft: Spacing.xs,
  },
  taskActions: {
    marginLeft: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
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
  createTaskButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.medium,
  },
  createTaskText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
});

export default TasksScreen;