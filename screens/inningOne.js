import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  AsyncStorage
} from "react-native";
import { FloatingAction } from "react-native-floating-action";
import Interrupt from "../components/addInterrupt";
import { Card } from "react-native-elements";

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
      gameData: {},
      cardString: null
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

  create = data => {
    let interruptArray = this.state.interupts;
    interruptArray.push(data);
    this.setState({ interupts: interruptArray }, this.generateCards());
  };

  generateCards = () => {
    let data = "";
    const style = {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    };
    data = this.state.interupts.map((interupt, index) => {
      return (
        <Card key={index}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={style}>
              <Text>Score</Text>
              <Text>{interupt.score.toString()}</Text>
            </View>

            <View style={style}>
              <Text>Wickets</Text>
              <Text>{interupt.wickets.toString()}</Text>
            </View>

            <View style={style}>
              <Text>Ov/Bowled</Text>
              <Text>{interupt.oversBowled.toString()}</Text>
            </View>

            <View style={style}>
              <Text>Ov/Lost</Text>
              <Text>{interupt.oversLost.toString()}</Text>
            </View>
          </View>
        </Card>
      );
    });

    this.setState({ cardString: data });
  };

  render() {
    const { navigation, screenProps } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Welcome, {screenProps.user.name}!</Text>
        </View>
        <ScrollView>{this.state.cardString}</ScrollView>
        <Interrupt
          create={this.create}
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
