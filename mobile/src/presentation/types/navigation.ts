export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  DiaryTab: undefined;
  ReflectionTab: undefined;
  SettingsTab: undefined;
};

export type AppStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  CreateRecord: undefined;
  RecordSaved: {
    recordId: string;
    nivelHumor: number;
  };
  RecordDetail: { recordId: string };
  EditRecord: { recordId: string };
  PrivacyPolicy: undefined;
  CustomMoodLabels: undefined;
  RemindersSettings: undefined;
  ProfessionalSupport: undefined;
};