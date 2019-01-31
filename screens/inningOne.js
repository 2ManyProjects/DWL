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
      edit: false,
      editInterupt: {},
      gameID: "", //
      missing: 0, //
      acc: 0.0,
      ac: [],
      missingEditOvers: 0,
      R1: 100.0, //
      totalOvers: null,
      startingOvers: null,
      calculationData: {},
      interupts: [],
      dialog: false,
      block: false,
      gameData: {},
      cardString: null,
      globalValue: [0, 0, 0] //
    };
  }

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
    // this.props.navigation.addListener("willBlur", this.save);
    this._retrieveData();
  };
  load = async () => {
    const self = this;
    console.log("Loading Inning 2 Data");
    try {
      const value = await AsyncStorage.getItem("Inning2");
      if (value !== null) {
        const start = JSON.parse(value).size > 0;
        self.setState(
          {
            block: start
          },
          console.log("Inning 2 Data Loaded")
        );
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  // save = async () => {
  //   console.log("Saving Inning 1");
  //   const data = {
  //     missing: this.state.missing,
  //     R1: this.state.R1
  //   };
  //   try {
  //     await AsyncStorage.mergeItem("Inning1", JSON.stringify(data));
  //     console.log("Inning 1 Saved", data);
  //   } catch (error) {
  //     console.log(error);
  //     // Error saving data
  //   }
  // };

  closeInterrupt = () => {
    this.setState({
      dialog: false,
      edit: false,
      editInterupt: {},
      missingEditOvers: 0
    });
  };

  openInterrupt = (edit, interupt) => {
    if (this.state.block) {
      alert("Please Clear interupts from Inning 2 before modifying Inning 1");
    } else {
      if (!edit) this.setState({ dialog: true, edit: false, editInterupt: {} });
      else
        this.setState({
          dialog: true,
          edit: true,
          editInterupt: interupt,
          missingEditOvers: interupt.oversLost * 2
        });
    }
  };

  create = data => {
    let tempData = data;
    tempData["time"] = new Date().toLocaleString();
    let interruptArray = this.state.interupts;
    tempData["id"] = generateGuid();
    interruptArray.push(tempData);
    this.setState({ interupts: interruptArray }, () => {
      this.recalculate();
      //this.calculaterR1();
    });
  };
  edit = (oldInterrupt, newInterrupt) => {
    const interruptIndex = this.state.interupts.indexOf(oldInterrupt);
    let newList = this.state.interupts;
    this.removeR1(oldInterrupt.id);
    newList[interruptIndex] = newInterrupt;
    console.log("NEW LIST", newList);
    this.setState({ interupts: newList }, () => {
      this.recalculate();
    });
  };

  recalculate = () => {
    let missingOvers = 0;
    let acc = 0.0;
    let ac = [];
    let data = this.state.calculationData;
    for (let x = 0; x < this.state.interupts.length; x++) {
      let lastadded = this.state.interupts[x];
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
    }
    this.setState(
      { acc: acc.toFixed(1), ac: ac, missing: missingOvers },
      () => {
        this.calculateR1();
      }
    );
  };

  calculateR1 = () => {
    console.log(
      "start",
      this.state.calculationData[this.state.globalValue[2] * 10][0]
    );
    console.log("-", parseFloat(this.state.acc));
    let R1 =
      this.state.calculationData[this.state.globalValue[2] * 10][0] -
      parseFloat(this.state.acc);
    this.setState({ R1: R1 }, async () => {
      const data = {
        missing: this.state.missing,
        R1: this.state.R1
      };

      this.generateCards();
      try {
        await AsyncStorage.mergeItem("Inning1", JSON.stringify(data));
        console.log("Inning 1 Saved", data);
      } catch (error) {
        console.log(error);
        // Error saving data
      }
      // console.log("R1", this.state.R1);
    });
  };

  removeR1 = id => {
    let inter = this.state.interupts;
    for (let i = 0; i < inter.length; i++) {
      if (inter[i].id === id) {
        inter.splice(i, 1);
        break;
      }
    }
    this.setState({ interupts: inter }, () => {
      this.recalculate();
    });
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
                  if (this.state.block) {
                    alert(
                      "Please Clear interupts from Inning 2 before modifying Inning 1"
                    );
                  } else {
                    this.openInterrupt(true, interupt);
                  }
                }}
                title="Edit"
                color="#FF8800"
              />
              <Text>{"     "}</Text>
              <Button
                onPress={() => {
                  if (this.state.block) {
                    alert(
                      "Please Clear interupts from Inning 2 before modifying Inning 1"
                    );
                  } else {
                    this.removeR1(interupt.id);
                  }
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
          edit={this.edit}
          willEdit={this.state.edit}
          interupt={this.state.editInterupt}
          missingOver={this.state.missingEditOvers}
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
          onPressMain={() => {
            this.openInterrupt(false);
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
