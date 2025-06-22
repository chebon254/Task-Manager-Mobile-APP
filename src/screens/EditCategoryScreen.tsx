import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
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
import { Category, useTask } from '../context/TaskContext';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme/colors';
import { AllScreensParamList } from '../types/navigation';

type EditCategoryScreenNavigationProp = NavigationProp<AllScreensParamList>;

// Predefined color options for categories
const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

const EditCategoryScreen = () => {
  const navigation = useNavigation<EditCategoryScreenNavigationProp>();
  const route = useRoute();
  const { categoryId } = route.params as { categoryId: string };
  
  const { categories, updateCategory, isLoading } = useTask();

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = () => {
    const foundCategory = categories.find((c) => c.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      setName(foundCategory.name);
      setSelectedColor(foundCategory.color);
    }
  };

  const handleUpdateCategory = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Category name must be at least 2 characters long');
      return;
    }

    if (name.trim().length > 50) {
      Alert.alert('Error', 'Category name must be less than 50 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await updateCategory(categoryId, {
        name: name.trim(),
        color: selectedColor,
      });

      Alert.alert('Success', 'Category updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.loadingContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color={Colors.textPrimary} />
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Category</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter category name..."
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleUpdateCategory}
            />
          </View>
          <Text style={styles.helperText}>
            {name.length}/50 characters
          </Text>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {CATEGORY_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color={Colors.textPrimary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <View 
                style={[
                  styles.previewColorDot, 
                  { backgroundColor: selectedColor }
                ]} 
              />
              <Text style={styles.previewText}>
                {name.trim() || 'Category Name'}
              </Text>
              <Text style={styles.previewCount}>
                {category._count?.tasks || 0} tasks
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Update Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.updateButton, 
            (!name.trim() || isSubmitting) && styles.disabledButton
          ]}
          onPress={handleUpdateCategory}
          disabled={!name.trim() || isSubmitting}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.updateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <>
                <Ionicons name="save" size={20} color={Colors.textPrimary} />
                <Text style={styles.updateButtonText}>Update Category</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: Spacing.sm,
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
  sectionTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
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
  helperText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  previewContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.small,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    ...Shadows.small,
  },
  previewColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  previewText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  previewCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
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
  updateButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    gap: Spacing.sm,
  },
  updateButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
  },
});

export default EditCategoryScreen;