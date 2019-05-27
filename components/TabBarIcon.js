import React from "react";
import { Icon } from "expo";
import Art from "react-native-vector-icons/MaterialCommunityIcons";
// import Art from "react-native-vector-icons/AntDesign";

import Colors from "../constants/Colors";

export default class TabBarIcon extends React.Component {
  render() {
    return this.props.name === "ios-options" ||
      this.props.name === "md-options" ? (
      <Icon.Ionicons
        name={this.props.name}
        size={26}
        style={{ marginBottom: -3 }}
        color={
          this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault
        }
      />
    ) : (
      <Art
        name={this.props.name}
        size={26}
        style={{ marginBottom: -3 }}
        color={
          this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault
        }
      />
    );
  }
}
