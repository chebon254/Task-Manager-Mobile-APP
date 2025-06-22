# 📱 PowerWater Task Manager

A beautiful and intuitive task management mobile application built with React Native and Expo. Organize your life, one task at a time!

![PowerWater Task Manager](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- 🎯 **Task Management**: Create, edit, delete, and organize your tasks
- 📁 **Category System**: Organize tasks with customizable categories
- 📅 **Due Dates**: Set and track task deadlines
- 📊 **Progress Tracking**: Visual progress indicators and statistics
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- 🔄 **Real-time Sync**: Cloud-based data synchronization
- 📱 **Cross-Platform**: Works on both iOS and Android

## 🚀 Quick Start Guide for Assessors

### Prerequisites

1. **Download Expo Go App**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Create Expo Account**
   - Sign up at [expo.dev](https://expo.dev) (optional but recommended)
   - Login to your Expo Go app with your account

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd task-manager-mobile-clean
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   
   Navigate to the AuthContext file:
   ```
   /src/context/AuthContext.tsx
   ```
   
   Update the API Base URL (around line 45) replace with your ngrok url:
   ```typescript
   // API Base URL
   const API_BASE_URL = "https://your-api-url.com/api";
   ```
   
   Replace `"https://humane-properly-bug.ngrok-free.app/api"` with your backend API URL.

4. **Start the Development Server**
   ```bash
   npx expo start
   ```

5. **Connect Your Mobile Device**
   - A QR code will appear in your terminal
   - Open **Expo Go** app on your phone
   - Scan the QR code with your camera (iOS) or the QR scanner in Expo Go (Android)
   - The app will build and launch on your device

## 📱 Using the App

### Getting Started

1. **Authentication**
   - **New Users**: Tap "Sign Up" to create a new account
   - **Demo Access**: Use the "Demo Account" button on login screen
     - Email: `kelvinchebon90@gmail.com`
     - Password: `password123`

2. **Navigation**
   - **Home**: Dashboard with statistics and recent tasks
   - **Tasks**: Complete task list with filtering options
   - **Profile**: User settings and category management

### Core Features

#### 📝 Task Management

1. **Creating Tasks**
   - Tap the "+" button on Home or Tasks screen
   - Fill in task details:
     - Title (required)
     - Description (optional)
     - Due date (optional)
     - Category (required)
     - Status (Pending, In Progress, Completed, Cancelled)

2. **Managing Tasks**
   - **View**: Tap any task to see full details
   - **Edit**: Tap the edit icon on task detail screen
   - **Delete**: Use delete button on task detail screen
   - **Quick Status**: Tap the circle icon to mark complete/incomplete

#### 📁 Category Management

1. **Accessing Categories**
   - Go to **Profile** tab
   - Tap "Manage Categories"

2. **Category Operations**
   - **Create**: Tap "+" button, choose name and color
   - **Edit**: Tap edit icon next to any category
   - **Delete**: Tap delete icon (only if category has no tasks)

#### 📊 Viewing Progress

- **Home Dashboard**: Overview of completion rates and statistics
- **Task Filters**: Filter by status, category, or search terms
- **Due Date Tracking**: Visual indicators for overdue and upcoming tasks

### 🎨 App Sections Overview

#### 🏠 Home Screen
- Welcome message with user greeting
- Statistics cards (completion rate, completed, pending, overdue tasks)
- Quick actions (New Task, All Tasks)
- Recent tasks and due soon sections
- Empty state guidance for new users

#### 📋 Tasks Screen
- Complete task list with search functionality
- Filter tabs (All, Pending, Completed, Cancelled)
- Category filters
- Pull-to-refresh functionality
- Task cards with category indicators and due dates

#### 👤 Profile Screen
- User information and statistics
- Category management access
- Settings toggles (notifications, dark mode)
- Data export options
- Account management (sign out, delete account)

#### ➕ Create/Edit Screens
- Intuitive form layouts
- Date picker integration
- Category selection with visual indicators
- Status management with icons
- Real-time validation

## 🔧 Technical Details

### Built With
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation solution
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence
- **LinearGradient** - Beautiful gradients
- **DateTimePicker** - Date selection

### Architecture
- **Context API** - State management (Auth & Tasks)
- **RESTful API** - Backend communication
- **JWT Authentication** - Secure user sessions
- **Modular Components** - Reusable UI elements

## 📱 Supported Platforms

- ✅ iOS 11.0+
- ✅ Android 6.0+ (API level 23+)

## 🎯 Key User Flows

1. **First Time User**
   ```
   Register → Create First Category → Add First Task → Explore Features
   ```

2. **Daily Usage**
   ```
   Open App → Check Home Dashboard → Add New Tasks → Mark Complete → Review Progress
   ```

3. **Organization**
   ```
   Profile → Manage Categories → Create/Edit Categories → Assign to Tasks
   ```

## 🐛 Troubleshooting

### Common Issues

1. **QR Code Not Scanning**
   - Ensure Expo Go app is installed and updated
   - Try scanning with your phone's camera app first
   - Check that both devices are on the same network

2. **App Won't Load**
   - Verify API URL is correct and accessible
   - Check internet connection
   - Try restarting the Expo development server

3. **Authentication Issues**
   - Ensure backend API is running
   - Check API URL configuration
   - Try the demo account credentials

---

**Happy Task Managing! 🎉**

*PowerWater Task Manager - Organize your life, one task at a time.*