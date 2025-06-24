import React, { createContext, ReactNode, useContext, useReducer } from 'react';
import { apiClient } from './AuthContext'; // Import the configured axios instance

// Types
export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // Fixed: Added IN_PROGRESS
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

export interface TaskFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // Fixed: Added IN_PROGRESS
  categoryId?: string;
  search?: string;
}

interface TaskState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface TaskContextType extends TaskState {
  // Task operations
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'category'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'category'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Category operations
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: { name: string; color: string }) => Promise<void>;
  updateCategory: (id: string, categoryData: { name?: string; color?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // UI operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
}

// Action types
type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string };

// Initial state
const initialState: TaskState = {
  tasks: [],
  categories: [],
  isLoading: false,
  error: null,
  refreshing: false,
};

// Reducer
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };
    case 'SET_REFRESHING':
      return {
        ...state,
        refreshing: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        refreshing: false,
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        refreshing: false,
        error: null,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        isLoading: false,
        error: null,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        isLoading: false,
        error: null,
      };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        isLoading: false,
        refreshing: false,
        error: null,
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
        isLoading: false,
        error: null,
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const handleApiError = (error: any): string => {
    console.error('API Error:', error);
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  };

  // Task operations
  const fetchTasks = async (filters?: TaskFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.search) params.append('search', filters.search);

      console.log('Fetching tasks with URL:', `/tasks?${params.toString()}`);

      const response = await apiClient.get(`/tasks?${params.toString()}`);

      console.log('Tasks response:', response.data);

      if (response.data.success) {
        dispatch({ type: 'SET_TASKS', payload: response.data.data.tasks });
      } else {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Don't re-throw here, let the component handle it gracefully
      console.error('Error fetching tasks:', errorMessage);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'category'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.post('/tasks', taskData);

      if (response.data.success) {
        dispatch({ type: 'ADD_TASK', payload: response.data.data.task });
      } else {
        throw new Error(response.data.message || 'Failed to create task');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'category'>>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.put(`/tasks/${id}`, taskData);

      if (response.data.success) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data.data.task });
      } else {
        throw new Error(response.data.message || 'Failed to update task');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.delete(`/tasks/${id}`);

      if (response.data.success) {
        dispatch({ type: 'DELETE_TASK', payload: id });
      } else {
        throw new Error(response.data.message || 'Failed to delete task');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Category operations
  const fetchCategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      console.log('Fetching categories...');

      const response = await apiClient.get('/categories');

      console.log('Categories response:', response.data);

      if (response.data.success) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data.data.categories });
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Don't re-throw here, let the component handle it gracefully
      console.error('Error fetching categories:', errorMessage);
    }
  };

  const createCategory = async (categoryData: { name: string; color: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.post('/categories', categoryData);

      if (response.data.success) {
        dispatch({ type: 'ADD_CATEGORY', payload: response.data.data.category });
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryData: { name?: string; color?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.put(`/categories/${id}`, categoryData);

      if (response.data.success) {
        dispatch({ type: 'UPDATE_CATEGORY', payload: response.data.data.category });
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.delete(`/categories/${id}`);

      if (response.data.success) {
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
      } else {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      await Promise.all([fetchTasks(), fetchCategories()]);
    } catch (error) {
      console.error('Refresh data error:', error);
      // Error is already handled in individual functions
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  };

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        setLoading,
        setError,
        refreshData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Hook to use task context
export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};