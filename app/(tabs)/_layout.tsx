
import { colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { Tabs } from 'expo-router';
import { TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { logout, user } = useAuth();

  const handleAddGame = () => {
    router.push('/add-game');
  };

  const handleProfile = () => {
    Alert.alert(
      'Profile',
      `Logged in as: ${user?.name}\n${user?.email}`,
      [
        { text: 'Logout', onPress: logout, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'League',
          tabBarIcon: ({ color, size }) => (
            <Icon name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Icon name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Game',
          tabBarIcon: ({ color, size }) => (
            <Icon name="add-circle" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleAddGame();
          },
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: 'Players',
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-circle" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleProfile();
          },
        }}
      />
    </Tabs>
  );
}
