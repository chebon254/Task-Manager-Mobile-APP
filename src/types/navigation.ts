export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
  CreateCategory: undefined;
};

// Combined type for all possible navigation destinations
export type AllScreensParamList = MainTabParamList & RootStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AllScreensParamList {}
  }
}