import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

// Extend the InternalAxiosRequestConfig to include our custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}

// Action types
type AuthAction =
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_ERROR' }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'TOKEN_REFRESH'; payload: { accessToken: string; refreshToken: string } };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'TOKEN_REFRESH':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = 'https://humane-properly-bug.ngrok-free.app/api';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Token refresh logic with improved error handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Helper function to get stored refresh token
const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting stored refresh token:', error);
    return null;
  }
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = apiClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = state.accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with improved logic
    const responseInterceptor = apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest: CustomAxiosRequestConfig = error.config;

        // Don't intercept auth endpoints to avoid recursion
        if (originalRequest.url?.includes('/auth/login') || 
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        // Handle 401 errors with improved logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Get refresh token from AsyncStorage directly
            const storedRefreshToken = await getStoredRefreshToken();
            
            if (!storedRefreshToken) {
              console.error('No refresh token available');
              throw new Error('No refresh token available');
            }

            // Make refresh request using a clean axios instance
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: storedRefreshToken,
            }, {
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
            });

            if (refreshResponse.data.success) {
              const { token, refreshToken } = refreshResponse.data.data;
              
              // Update storage
              await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
                AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
              ]);
              
              // Update state
              dispatch({
                type: 'TOKEN_REFRESH',
                payload: { accessToken: token, refreshToken },
              });

              // Update original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }

              processQueue(null, token);
              
              // Retry original request
              return apiClient(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            processQueue(refreshError, null);
            
            // Clear auth data and logout
            await clearAuthData();
            dispatch({ type: 'AUTH_LOGOUT' });
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [state.accessToken]);

  // Load user data from storage on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const [accessToken, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, accessToken, refreshToken },
        });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const storeAuthData = async (user: User, accessToken: string, refreshToken: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      // Use clean axios instance for login to avoid interceptor issues
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        await storeAuthData(user, token, refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, accessToken: token, refreshToken },
        });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Login failed';
        
        if (status === 401) {
          throw new Error('Invalid email or password');
        } else if (status === 400) {
          throw new Error(message);
        } else if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      // Use clean axios instance for register to avoid interceptor issues
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        await storeAuthData(user, token, refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, accessToken: token, refreshToken },
        });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          // Validation errors
          if (data.details && Array.isArray(data.details)) {
            const errorMessages = data.details.join(', ');
            throw new Error(errorMessages);
          } else {
            throw new Error(data.message || 'Invalid input data');
          }
        } else if (status === 409) {
          throw new Error('Email already exists');
        } else if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Registration failed');
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const currentRefreshToken = await getStoredRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Use clean axios instance instead of apiClient to avoid interceptor loops
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: currentRefreshToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.data.success) {
        const { token, refreshToken } = response.data.data;
        
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        ]);
        
        dispatch({
          type: 'TOKEN_REFRESH',
          payload: { accessToken: token, refreshToken },
        });

        return token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the configured axios instance for use in other parts of the app
export { apiClient };