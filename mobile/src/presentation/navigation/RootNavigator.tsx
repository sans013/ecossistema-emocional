import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '../components/BottomTabBar';
import { LgpdConsentScreen } from '../screens/LgpdConsentScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
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

function RoutePlaceholder() {
  return <View style={styles.placeholder} />;
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
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
      <MainTabs.Screen name="HomeTab" component={RoutePlaceholder} />
      <MainTabs.Screen name="DiaryTab" component={RoutePlaceholder} />
      <MainTabs.Screen name="ReflectionTab" component={RoutePlaceholder} />
      <MainTabs.Screen name="SettingsTab" component={RoutePlaceholder} />
    </MainTabs.Navigator>
  );
}

export function RootNavigator() {
  const { isBootstrapping, isAuthenticated, user } = useSession();

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
          <AppStack.Screen name="CreateRecord" component={RoutePlaceholder} />
          <AppStack.Screen name="RecordSaved" component={RoutePlaceholder} />
          <AppStack.Screen name="RecordDetail" component={RoutePlaceholder} />
          <AppStack.Screen name="EditRecord" component={RoutePlaceholder} />
          <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <AppStack.Screen name="CustomMoodLabels" component={RoutePlaceholder} />
          <AppStack.Screen name="RemindersSettings" component={RoutePlaceholder} />
          <AppStack.Screen name="ProfessionalSupport" component={RoutePlaceholder} />
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
  placeholder: {
    flex: 1,
    backgroundColor: '#F4F7F3',
  },
});