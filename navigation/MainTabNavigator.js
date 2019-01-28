import React, { Component } from "react";
import { AppRegistry, Platform } from "react-native";
import { createAppContainer, createBottomTabNavigator } from "react-navigation";
import TabBarIcon from "../components/TabBarIcon";
import InningOne from "../screens/inningOne";
import SettingsScreen from "../screens/SettingsScreen";
import InningTwo from "../screens/inningTwo";

const AppNavigator = createAppContainer(
  createBottomTabNavigator({
    InningOne: {
      screen: InningOne,
      navigationOptions: {
        tabBarLabel: "Inning 1",
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
            focused={focused}
            name={Platform.OS === "ios" ? "ios-close-circle" : "md-baseball"}
          />
        )
      }
    },
    Settings: {
      screen: SettingsScreen,
      navigationOptions: {
        tabBarLabel: "Settings",
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
            focused={focused}
            name={Platform.OS === "ios" ? "ios-options" : "md-options"}
          />
        )
      }
    },
    InningTwo: {
      screen: InningTwo,
      navigationOptions: {
        tabBarLabel: "Inning 2",
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
            focused={focused}
            name={Platform.OS === "ios" ? "ios-close-circle" : "md-baseball"}
          />
        )
      }
    }
  })
);

class MyApp extends Component {
  render() {
    const screenProps = {
      user: {
        name: "John Doe",
        username: "johndoe123",
        email: "john@doe.com"
      }
    };

    return <AppNavigator screenProps={screenProps} />;
  }
}

export default MyApp;

AppRegistry.registerComponent("MyApp", () => MyApp);
