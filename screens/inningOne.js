import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  ScrollView,
  AsyncStorage
} from "react-native";
import { FloatingAction } from "react-native-floating-action";
import Interrupt from "../components/addInterrupt";
import { subtractOvers, generateGuid } from "../components/helpers";
import { Card } from "react-native-elements";

export default class InningOne extends React.Component {
  static navigationOptions = {
    title: "Inning 1"
  };
  constructor(props) {
    super(props);
    this.state = {
      gameID: "", //
      missing: 0, //
      acc: 0.0,
      ac: [],
      R1: 100.0, //
      totalOvers: null,
      startingOvers: null,
      calculationData: {},
      interupts: [],
      dialog: false,
      gameData: {},
      cardString: null,
      globalValue: [0, 0, 0] //
    };
  }

  //R1 = data[GlobalValue[2]*10][0];

  initglobalValue = val => {
    let total = this.state.totalOvers;
    let start = val;
    let arr = this.state.globalValue;
    if (total < 20) {
      total = 15;
      arr[0] = 90;
    } else if (total < 25) {
      total = 20;
      arr[0] = 120;
    } else if (total < 30) {
      total = 25;
      arr[0] = 150;
    } else if (total < 55) {
      total = 50;
      arr[0] = 200;
    }
    arr[1] = total;
    arr[2] = start;
    this.setState({ globalValue: arr });
  };

  _retrieveData = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem("GlobalData");
      if (value !== null) {
        const data = JSON.parse(value);
        const start = data.startingOvers;
        self.setState(
          {
            gameID: data.gameID,
            totalOvers: data.totalOvers,
            startingOvers: start,
            calculationData: data.calculationData,
            gameData: data.gameData
          },
          this.initglobalValue(start)
        );
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  componentDidMount = () => {
    this.props.navigation.addListener("willFocus", this.load);
    this.props.navigation.addListener("willBlur", this.save);
    this._retrieveData();
  };
  load = () => {
    console.log("On Screen");
  };

  save = async () => {
    const data = {
      missing: this.state.missing,
      R1: this.state.R1
    };
    try {
      await AsyncStorage.setItem("Inning1", JSON.stringify(data));
    } catch (error) {
      console.log(error);
      // Error saving data
    }
  };

  closeInterrupt = () => {
    this.setState({ dialog: false });
  };

  openInterrupt = () => {
    this.setState({ dialog: true });
  };

  create = data => {
    let tempData = data;
    tempData["time"] = new Date().toLocaleString();
    let interruptArray = this.state.interupts;
    tempData["id"] = generateGuid();
    interruptArray.push(tempData);
    this.setState({ interupts: interruptArray }, () => {
      this.calculaterR1();
      this.generateCards();
    });
  };

  calculaterR1 = () => {
    let missingOvers = this.state.missing;
    let acc = parseFloat(this.state.acc);
    let ac = this.state.ac;
    let data = this.state.calculationData;
    let lastadded = this.state.interupts[this.state.interupts.length - 1];
    let lastaddedOversLost = lastadded.oversLost;
    let lastaddedOversLeft = lastadded.oversLeft;
    let temp = Math.floor((lastaddedOversLeft - lastaddedOversLost / 2) * 10);
    let wickets = lastadded.wickets;

    acc =
      acc +
      (data[Math.floor(lastaddedOversLeft) * 10][wickets] -
        data[temp][wickets]);
    ac.push(
      data[Math.floor(lastaddedOversLeft) * 10][wickets] - data[temp][wickets]
    );
    missingOvers += lastaddedOversLost / 2;
    console.log(
      "Calculation",
      data[Math.floor(lastaddedOversLeft) * 10][wickets] +
        " - " +
        data[temp][wickets]
    );
    console.log("Acc: ", acc.toFixed(1));

    this.setState(
      { acc: acc.toFixed(1), ac: ac, missing: missingOvers },
      () => {
        this.getR1();
      }
    );
  };

  getR1 = () => {
    let R1 =
      this.state.calculationData[this.state.globalValue[2] * 10][0] -
      parseFloat(this.state.acc);
    this.setState({ R1: R1 }, () => {
      console.log("R1", this.state.R1);
    });
  };

  removeR1 = id => {
    let inter = this.state.interupts;
    let missingOvers = this.state.missing;
    let ac = this.state.ac;
    let temp;
    for (let i = 0; i < inter.length; i++) {
      if (inter[i].id === id) {
        temp = inter[i];
        inter.splice(i, 1);
        ac.splice(i, 1);
        break;
      }
    }

    missingOvers -= Math.floor(temp.oversLost / 2);
    let acc = 0.0;
    for (let i = 0; i < ac.length; i++) {
      acc += ac[i];
    }
    this.setState(
      { acc: acc, ac: ac, missing: missingOvers, interupts: inter },
      () => {
        console.log("Acc: ", acc);
        this.getR1();
        this.generateCards();
      }
    );
  };

  generateCards = () => {
    let data = "";
    const style = {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10
    }; //
    data = this.state.interupts.map((interupt, index) => {
      return (
        <Card key={index}>
          <View style={style}>
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

            <Text>{interupt.time.toString()}</Text>

            <Text>{interupt.id}</Text>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
                alignItems: "center"
              }}
            >
              <Button
                onPress={() => {
                  alert("pressed Edit");
                }}
                title="Edit"
                color="#FF8800"
              />
              <Text>{"     "}</Text>
              <Button
                onPress={() => {
                  this.removeR1(interupt.id);
                }}
                title="Delete"
                color="#FF8800"
              />
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
          <Text> </Text>
        </View>
        <ScrollView>{this.state.cardString}</ScrollView>
        <Interrupt
          inning={1}
          create={this.create}
          closeInterrupt={this.closeInterrupt}
          open={this.state.dialog}
          missing={this.state.missing}
          globals={this.state.globalValue}
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
