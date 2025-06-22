import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Category, useTask } from "../context/TaskContext";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "../theme/colors";
import { AllScreensParamList } from "../types/navigation";

type CategoriesScreenNavigationProp = NavigationProp<AllScreensParamList>;

const CategoriesScreen = () => {
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const {
    categories,
    isLoading,
    refreshing,
    fetchCategories,
    deleteCategory,
    refreshData,
  } = useTask();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      await fetchCategories();
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const onRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    }
  };

  const handleEditCategory = (category: Category) => {
    navigation.navigate('EditCategory', { categoryId: category.id });
  };

  const handleDeleteCategory = (category: Category) => {
    if (category._count?.tasks && category._count.tasks > 0) {
      Alert.alert(
        "Cannot Delete Category",
        `This category contains ${category._count.tasks} task(s). Please move or delete the tasks first.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteCategory(category.id),
        },
      ]
    );
  };

  const confirmDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      Alert.alert("Success", "Category deleted successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete category");
    }
  };

  const renderCategoryItem = ({ item: category }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryContent}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.categoryDot,
              { backgroundColor: category.color },
            ]}
          />
          <View style={styles.categoryText}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryTaskCount}>
              {category._count?.tasks || 0} tasks
            </Text>
          </View>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCategory(category)}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCategory(category)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateCategory")}
          >
            <Ionicons name="add" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textPrimary}
            colors={[Colors.textPrimary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name="folder-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Categories</Text>
            <Text style={styles.emptySubtitle}>
              Create your first category to organize your tasks!
            </Text>
            <TouchableOpacity
              style={styles.createCategoryButton}
              onPress={() => navigation.navigate("CreateCategory")}
            >
              <Text style={styles.createCategoryText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
  },
  categoriesList: {
    flex: 1,
  },
  categoriesListContent: {
    padding: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.md,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs / 2,
  },
  categoryTaskCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  categoryActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
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
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  createCategoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.medium,
  },
  createCategoryText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
});

export default CategoriesScreen;