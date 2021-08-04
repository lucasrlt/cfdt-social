import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import strings from '../strings.json';
import {createStackNavigator} from '@react-navigation/stack';
import * as React from 'react';
import {Image, Text, View} from 'react-native';
import {gs} from './constants/styles';
import {AuthContext} from './context/AuthProvider';
import CfdtNewsScreen from './screens/CfdtNewsScreen';
import FirstLoginScreen from './screens/FirstLoginScreen';
import LoginScreen from './screens/LoginScreen';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import NewsIcon from '../assets/feed_white.svg';
import FeedIcon from '../assets/rss_feed_white.svg';
import ChatIcon from '../assets/chat_white.svg';
import ProfileIcon from '../assets/account_circle_white.svg';
import cfdtLogo from '../assets/cfdt_logo.png';
import ProfileScreen from './screens/ProfileScreen';
import PostWritingScreen from './screens/PostWritingScreen';
import CommentsScreen from './screens/CommentsScreen';
import PostsProvider from './context/PostsProvider';
import FeedScreen from './screens/FeedScreen';
import MediaFullScreen from './screens/MediaFullScreen';
import PollCreationScreen from './screens/PollCreationScreen';
import ChatsScreen from './screens/ChatsScreen';
import ConversationScreen from './screens/ConversationScreen';
import NewMessageScreen from './screens/NewMessageScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getHeaderTitle(route) {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen during if there hasn't been any navigation inside the screen
  // In our case, it's "Feed" as that's the first screen inside the navigator
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'News';

  let title = '';
  switch (routeName) {
    case 'News':
      title = strings.pages.news;
      break;
    case 'Profile':
      title = strings.pages.profile;
      break;
    case 'Chat':
      title = strings.pages.chat;
      break;
    case 'Feed':
      title = strings.pages.feed;
      break;
  }

  const styles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    image: {width: 35, height: 35, marginRight: 12},
  };

  return (
    <View style={styles.container}>
      <Image source={cfdtLogo} style={styles.image} />
      <Text style={defaultHeaderTitleStyle}>{title}</Text>
    </View>
  );
}

export const defaultHeaderTitleStyle = {
  fontFamily: 'CenturyGothic',
  fontWeight: 'bold',
  color: 'white',
  fontSize: 20,
};

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation() {
  const authContext = React.useContext(AuthContext);

  return (
    <NavigationContainer>
      {authContext.isLoggedIn && !authContext.isFirstLogin ? (
        <PostsProvider>
          <RootNavigator />
        </PostsProvider>
      ) : (
        <LoginNavigator />
      )}
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function LoginNavigator() {
  const authContext = React.useContext(AuthContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={!authContext.isFirstLogin ? LoginScreen : FirstLoginScreen}
        options={{header: () => <></>}}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: gs.colors.primary,
        },
        headerTitleStyle: defaultHeaderTitleStyle,
        headerTintColor: 'white',
        headerTitleAlign: 'center',

        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name="Home"
        component={TabNavigator}
        options={({route}) => ({
          headerTitle: getHeaderTitle(route),
        })}
      />
      <Stack.Screen
        name="PostWriting"
        component={PostWritingScreen}
        options={{headerTitle: 'Publier'}}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{headerTitle: 'Publication'}}
      />
      <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
      <Stack.Screen
        name="MediaFull"
        component={MediaFullScreen}
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: gs.colors.black,
            shadowColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="PollCreation"
        component={PollCreationScreen}
        options={{headerTitle: 'Sondage'}}
      />
      <Stack.Screen
        name="NewMessage"
        component={NewMessageScreen}
        options={{headerTitle: 'Nouveau Message'}}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: gs.colors.white,
        inactiveTintColor: '#CCCCCC',
        tabStyle: {backgroundColor: gs.colors.primary, padding: 5},
      }}>
      <Tab.Screen
        name="News"
        component={CfdtNewsScreen}
        options={{
          tabBarLabel: strings.pages.news,
          tabBarIcon: ({color}) => <NewsIcon fill={color} />,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: strings.pages.feed,
          tabBarIcon: ({color}) => <FeedIcon fill={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatsScreen}
        options={{
          tabBarLabel: strings.pages.chat,
          tabBarIcon: ({color}) => <ChatIcon fill={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: strings.pages.profile,
          tabBarIcon: ({color}) => <ProfileIcon fill={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
