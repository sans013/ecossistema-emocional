import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserExportData } from '../../domain/entities/User';
import { BottomTabBar } from '../components/BottomTabBar';
import { CreateRecordScreen } from '../screens/CreateRecordScreen';
import { CustomMoodLabelsScreen } from '../screens/CustomMoodLabelsScreen';
import { DiaryScreen } from '../screens/DiaryScreen';
import { EditRecordScreen } from '../screens/EditRecordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LgpdConsentScreen } from '../screens/LgpdConsentScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { ProfessionalSupportScreen } from '../screens/ProfessionalSupportScreen';
import { RecordDetailScreen } from '../screens/RecordDetailScreen';
import { RecordSavedScreen } from '../screens/RecordSavedScreen';
import { ReflectionScreen } from '../screens/ReflectionScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RemindersSettingsScreen } from '../screens/RemindersSettingsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { COLORS } from '../theme/tokens';
import {
  AppStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from '../types/navigation';
import { useSession } from '../viewmodels/SessionContext';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

export interface RootNavigatorProps {
  exportUserData: () => Promise<UserExportData>;
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function createMainTabNavigator(exportUserData: () => Promise<UserExportData>) {
  return function MainTabNavigator() {
    return (
      <MainTabs.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <BottomTabBar
            {...props}
            onPressCreateRecord={() => {
              const parentNav = props.navigation.getParent<{
                navigate: (route: keyof AppStackParamList) => void;
              }>();
              parentNav?.navigate('CreateRecord');
            }}
          />
        )}
      >
        <MainTabs.Screen name="HomeTab" component={HomeScreen} />
        <MainTabs.Screen name="DiaryTab" component={DiaryScreen} />
        <MainTabs.Screen name="ReflectionTab">
          {() => <ReflectionScreen exportUserData={exportUserData} />}
        </MainTabs.Screen>
        <MainTabs.Screen name="SettingsTab" component={SettingsScreen} />
      </MainTabs.Navigator>
    );
  };
}

export function RootNavigator({ exportUserData }: RootNavigatorProps) {
  const { isBootstrapping, isAuthenticated, user } = useSession();

  const MainTabNavigator = useMemo(
    () => createMainTabNavigator(exportUserData),
    [exportUserData]
  );

  if (isBootstrapping) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : !user?.consentimentoLgpd ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="MainTabs" component={LgpdConsentScreen} />
          <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </AppStack.Navigator>
      ) : (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="MainTabs" component={MainTabNavigator} />
          <AppStack.Screen name="CreateRecord" component={CreateRecordScreen} />
          <AppStack.Screen name="RecordSaved" component={RecordSavedScreen} />
          <AppStack.Screen name="RecordDetail" component={RecordDetailScreen} />
          <AppStack.Screen name="EditRecord" component={EditRecordScreen} />
          <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <AppStack.Screen name="CustomMoodLabels" component={CustomMoodLabelsScreen} />
          <AppStack.Screen name="RemindersSettings" component={RemindersSettingsScreen} />
          <AppStack.Screen name="ProfessionalSupport" component={ProfessionalSupportScreen} />
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F3',
  },
});