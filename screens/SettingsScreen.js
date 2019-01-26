import React from "react";
import { ScrollView, View, Text, Button } from "react-native";
import { ExpoConfigView } from "@expo/samples";

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: "Settings"
  };

  render() {
    const { navigation, screenProps } = this.props;
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return (
      // <View>
      //   <Text>My Profile</Text>
      //   <Text>Name: {screenProps.user.name}</Text>
      //   <Text>Username: {screenProps.user.username}</Text>
      //   <Text>Email: {screenProps.user.email}</Text>
      //   <Button onPress={() => navigation.goBack()} title="Back to Home" />
      <ExpoConfigView />
      // </View>
    );
  }
}
