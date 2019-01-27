import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Platform,
  Button,
  AsyncStorage
} from "react-native";
import { FloatingAction } from "react-native-floating-action";
import Interrupt from "../components/addInterrupt";

export default class InningTwo extends React.Component {
  static navigationOptions = {
    title: "Inning 2"
  };
  constructor(props) {
    super(props);
    this.state = {
      gameID: "",
      totalOvers: null,
      startingOvers: null,
      calculationData: {},
      interupts: [],
      dialog: false,
      gameData: {}
    };
  }

  _retrieveData = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem("GlobalData");
      if (value !== null) {
        const data = JSON.parse(value);

        self.setState({
          gameID: data.gameID,
          totalOvers: data.totalOvers,
          startingOvers: data.startingOvers,
          calculationData: data.calculationData,
          gameData: data.gameData
        });
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  componentDidMount = () => {
    this._retrieveData();
  };

  closeInterrupt = () => {
    this.setState({ dialog: false });
  };

  openInterrupt = () => {
    this.setState({ dialog: true });
  };

  render() {
    const { navigation, screenProps } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Welcome, {screenProps.user.name}!</Text>
        </View>
        <Interrupt
          closeInterrupt={this.closeInterrupt}
          open={this.state.dialog}
        />
        {/* <Button title="Add" onPress={this.openInterrupt} /> */}
        <FloatingAction
          position="center"
          showBackground={false}
          onPressMain={this.openInterrupt}
        />
      </SafeAreaView>
    );
  }
}

const dependant = StyleSheet.create({
  OS: {
    borderBottomWidth: Platform.OS === "ios" ? 1 : 0,
    borderBottomColor: "#000"
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  }
});
