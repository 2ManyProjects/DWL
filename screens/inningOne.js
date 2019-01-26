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
import Dialog from "react-native-dialog";
import { FloatingAction } from "react-native-floating-action";

export default class InningOne extends React.Component {
  static navigationOptions = {
    title: "Inning 1"
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

  handleCancel = () => {
    this.setState({ dialog: false });
  };
  componentDidMount = () => {
    this._retrieveData();
  };
  render() {
    const { navigation, screenProps } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Welcome, {screenProps.user.name}!</Text>
        </View>

        <Dialog.Container visible={this.state.dialog}>
          <Dialog.Title>Inning of ##</Dialog.Title>
          <Dialog.Description> </Dialog.Description>
          <Dialog.Input
            label="Score"
            underlineColorAndroid="#000"
            style={dependant.OS}
          />
          <Dialog.Input
            label="Wickets Fallen"
            underlineColorAndroid="#000"
            style={dependant.OS}
          />
          <Dialog.Input
            label="Overs Bowled"
            underlineColorAndroid="#000"
            style={dependant.OS}
          />
          <Dialog.Input
            label="Over Lost"
            underlineColorAndroid="#000"
            style={dependant.OS}
          />
          <Dialog.Input
            label="Overs Left"
            underlineColorAndroid="#000"
            style={dependant.OS}
          />
          <Dialog.Button label="Submit" onPress={this.handleCancel} />
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
        </Dialog.Container>
        <FloatingAction
          position="center"
          onPressMain={() => {
            this.setState({ dialog: !this.state.dialog });
          }}
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

//Inning of $number
//Score
//Wickets Fallen
//Overs Bowled
//Over Lost
//Overs Left
