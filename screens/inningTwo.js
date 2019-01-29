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
import Dialog from "react-native-dialog";
import { FloatingAction } from "react-native-floating-action";
import Interrupt from "../components/addInterrupt";
import { subtractOvers, generateGuid } from "../components/helpers";
import { Card } from "react-native-elements";

export default class InningTwo extends React.Component {
  static navigationOptions = {
    title: "Inning 2"
  };
  constructor(props) {
    super(props);
    this.state = {
      score: -5,
      open: true,
      init: true,
      gameID: "",
      targetScore: 0,
      missing: 0,
      acc: 0.0,
      ac: [],
      R1: 0.0,
      totalOvers: null,
      startingOvers: null,
      calculationData: {},
      interupts: [],
      dialog: false,
      gameData: {},
      cardString: null,
      globalValue: [0, 0, 0]
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
          () => {
            this.initglobalValue(start);
          }
        );
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  componentDidMount = () => {
    this._retrieveData();
    this.props.navigation.addListener("willFocus", this.load);
    // this.props.navigation.addListener("willBlur", this.save);
  };
  load = async () => {
    console.log("Loading Inning 1 Data");
    const self = this;
    try {
      const value = await AsyncStorage.getItem("Inning1");
      if (value !== null) {
        const data = JSON.parse(value);
        self.setState(
          {
            missing: data.missing,
            R1: data.R1
          },
          console.log("Inning 1 Data Loaded", data)
        );
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  // save = async () => {
  //   const self = this;
  //   console.log("Saving Inning 2");
  //   try {
  //     await AsyncStorage.mergeItem(
  //       "Inning2",
  //       JSON.stringify({ size: this.state.interupts.length })
  //     );
  //     console.log("Inning 2 Saved", this.state.interupts.length);
  //   } catch (error) {
  //     console.log(error);
  //     // Error saving data
  //   }
  // };

  closeInterrupt = () => {
    this.setState({ dialog: false });
  };

  openInterrupt = () => {
    if (this.state.init) {
      let temp = this.state.globalValue[2] - this.state.missing;
      temp *= 10;
      let R2 = this.state.calculationData[temp][0];
      this.setState({ R2: R2 }, () => {
        this.calculate();
      });
    }
    this.setState({ dialog: true });
  };

  calculate = () => {
    let R2 =
      this.state.calculationData[
        (this.state.globalValue[2] - this.state.missing) * 10
      ][0] - parseFloat(this.state.acc);
    let targetScore = 0;
    if (R2 > this.state.R1) {
      targetScore = Math.floor(
        this.state.score +
          (this.state.globalValue[0] * (R2 - this.state.R1)) / 100 +
          1
      );
    } else {
      targetScore = Math.floor(this.state.score * (R2 / this.state.R1) + 1);
    }
    this.setState({ R2: R2, targetScore: targetScore });
  };

  create = data => {
    let tempData = data;
    tempData["time"] = new Date().toLocaleString();
    let interruptArray = this.state.interupts;
    tempData["id"] = generateGuid();
    interruptArray.push(tempData);
    this.setState({ interupts: interruptArray }, async () => {
      console.log("Saving Inning 2");
      try {
        await AsyncStorage.mergeItem(
          "Inning2",
          JSON.stringify({ size: this.state.interupts.length })
        );
        console.log("Inning 2 Saved", this.state.interupts.length);
      } catch (error) {
        console.log(error);
        // Error saving data
      }
      this.calculateR2();
      this.generateCards();
    });
  };

  calculateR2 = () => {
    if (this.state.interupts.length > 0) {
      let missingOvers = this.state.missing;
      let acc = parseFloat(this.state.acc);
      let ac = this.state.ac;
      let data = this.state.calculationData;
      let lastadded = this.state.interupts[this.state.interupts.length - 1];
      let lastaddedOversLost = lastadded.oversLost;
      let lastaddedOversLeft = lastadded.oversLeft;
      let temp = (lastaddedOversLeft - lastaddedOversLost) * 10;
      let wickets = lastadded.wickets;
      acc =
        acc +
        (data[Math.floor(lastaddedOversLeft) * 10][wickets] -
          data[temp][wickets]);
      ac.push(
        data[Math.floor(lastaddedOversLeft) * 10][wickets] - data[temp][wickets]
      );
      missingOvers += lastaddedOversLost;
      // console.log(
      //   "Calculation",
      //   data[Math.floor(lastaddedOversLeft) * 10][wickets] +
      //     " - " +
      //     data[temp][wickets]
      // );
      // console.log("Acc:", acc.toFixed(1));

      this.setState(
        { acc: acc.toFixed(1), ac: ac, missing: missingOvers },
        () => {
          this.calculate();
        }
      );
    }
  };

  removeR2 = id => {
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
        // console.log("Acc: ", acc);
        this.calculateR2();
        this.generateCards();
      }
    );
  };
  onChange = (event, id) => {
    const value = event.nativeEvent.text;
    if (/^\d+$/.test(value)) {
      this.setState({ [id]: parseInt(value) });
    } else if (value.length === 0) {
      this.setState({ [id]: 0 });
    } else {
      this.setState({ [id]: this.state[id] });
    }
  };

  Submit = () => {
    if (this.state.score > 0) {
      this.setState({ open: false }, () => {
        this.calculate();
      });
    } else {
      alert("Score Cannot be less than 1");
    }
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
                  this.removeR2(interupt.id);
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

  getValue = input => {
    if (this.state[input] && this.state[input] != -5)
      return this.state[input].toString();
    else return "";
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
          inning={2}
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
        <View>
          <Text>Target: {this.state.targetScore.toString()}</Text>
        </View>

        <Dialog.Container visible={this.state.open}>
          <Dialog.Title>Inning 2 Setup</Dialog.Title>
          <Dialog.Description> </Dialog.Description>
          <View>
            <Dialog.Input
              label="Inning 1 Score"
              onChange={event => {
                this.onChange(event, "score");
              }}
              value={this.getValue("score")}
              underlineColorAndroid="#000"
              style={dependant.OS}
              keyboardType="numeric"
            />
            <Dialog.Button label="Submit" onPress={this.Submit} />
          </View>
        </Dialog.Container>
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
