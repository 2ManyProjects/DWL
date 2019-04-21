import React from "react";
import { ScrollView, View, Text, Button, AsyncStorage } from "react-native";
import { ExpoConfigView } from "@expo/samples";
import { Updates } from "expo";

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: "Settings"
  };

  saveGame = async () => {
    console.log("Backingup Game");
    try {
      let value = JSON.parse(await AsyncStorage.getItem("tempGame"));
      let key;
      if (value.Inning1.gameID) {
        key = value.Inning1.gameID;
      } else if (value.Inning2.gameID) {
        key = value.Inning2.gameID;
      } else {
        alert("No Modifications to the Game File was Found");
        return;
      }
      let allFiles = await AsyncStorage.getAllKeys();
      if (allFiles.indexOf(key) === -1) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        alert("Game Saved");
        console.log("Game Saved");
      } else {
        await AsyncStorage.mergeItem(key, JSON.stringify(value));
        alert("Game Saved");
        console.log("Game Saved");
      }
    } catch (error) {
      console.log(error);
      // Error saving data
    }
  };
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          marginTop: 10,
          alignItems: "center"
        }}
      >
        <Button onPress={() => this.saveGame()} title="Save Current Game" />
        <Text>{"\n"}</Text>
        <Text>{"\n"}</Text>
        <Button onPress={() => Updates.reload()} title="Exit to Main Menu" />
        {/* <ExpoConfigView /> */}
      </View>
    );
  }
}
