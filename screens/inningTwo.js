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
      edit: false,
      editInterupt: {},
      score: -5,
      open: true,
      init: true,
      reset: false,
      gameID: "",
      R2: 100.0,
      initialMissing: 0,
      targetScore: 0,
      missing: 0,
      acc: 0.0,
      ac: [],
      R1: 100.0,
      totalOvers: null,
      startingOvers: null,
      calculationData: {},
      interupts: [],
      dialog: false,
      cardString: null,
      globalValue: [0, 0, 0]
    };
    console.log("Inning 2 contructed");
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

  _retrieveData = async savedFile => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem("GlobalData");
      if (value !== null) {
        const data = JSON.parse(value);
        const start = data.startingOvers;
        if (!savedFile) {
          self.setState(
            {
              gameID: data.gameID,
              totalOvers: data.totalOvers,
              startingOvers: start,
              calculationData: data.calculationData
            },
            this.initglobalValue(start)
          );
        } else {
          self.setState({
            calculationData: data.calculationData
          });
        }
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  async componentDidMount() {
    console.log("Inning 2 Mounted");
    const val = JSON.parse(await AsyncStorage.getItem("tempGame"));
    if (val.Inning2.gameID) {
      await this._retrieveData(true);
      await this.loadGame(val.Inning2);
    } else {
      this._retrieveData(false);
    }
    this.props.navigation.addListener("willFocus", this.load);
    // this.props.navigation.addListener("willBlur", this.save);
  }

  loadGame = async val => {
    this.setState(
      {
        edit: val.edit,
        editInterupt: val.editInterupt,
        score: val.score,
        open: val.open,
        init: val.init,
        reset: val.reset,
        gameID: val.gameID,
        R2: val.R2,
        initialMissing: val.initialMissing,
        targetScore: val.targetScore,
        missing: val.missing,
        acc: val.acc,
        ac: val.ac,
        R1: val.R1,
        totalOvers: val.totalOvers,
        startingOvers: val.startingOvers,
        interupts: val.interupts,
        dialog: val.dialog,
        globalValue: val.globalValue
      },
      () => {
        this.recalculate();
      }
    );
  };

  load = async () => {
    const self = this;
    if (this.state.reset) this.setState({ reset: false, open: true });
    try {
      const value = await AsyncStorage.getItem("Inning1");
      if (value !== null) {
        const data = JSON.parse(value);
        self.setState({
          missing: data.missing,
          initialMissing: data.missing,
          R1: data.R1
        });
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  closeInterrupt = () => {
    this.setState({
      dialog: false,
      edit: false,
      editInterupt: {},
      missingEditOvers: 0
    });
  };

  openInterrupt = (edit, interupt) => {
    if (this.state.init) {
      let temp = this.state.globalValue[2] - this.state.missing;
      temp *= 10;
      let R2 = this.state.calculationData[temp][0];
      this.setState({ R2: R2 }, () => {
        this.calculate();
      });
    }
    if (!edit) this.setState({ dialog: true, edit: false, editInterupt: {} });
    else
      this.setState({
        dialog: true,
        edit: true,
        editInterupt: interupt,
        missingEditOvers: interupt.oversLost * 2
      });
  };

  create = data => {
    let tempData = data;
    tempData["time"] = new Date().toLocaleString();
    let interruptArray = this.state.interupts;
    tempData["id"] = generateGuid();
    interruptArray.push(tempData);
    this.setState({ interupts: interruptArray }, async () => {
      try {
        await AsyncStorage.mergeItem(
          "Inning2",
          JSON.stringify({ size: this.state.interupts.length })
        );
      } catch (error) {
        console.log(error);
        // Error saving data
      }
      this.recalculate();
    });
  };

  edit = (oldInterrupt, newInterrupt) => {
    const interruptIndex = this.state.interupts.indexOf(oldInterrupt);
    let newList = this.state.interupts;
    this.removeR2(oldInterrupt.id);
    newList[interruptIndex] = newInterrupt;
    this.setState({ interupts: newList }, () => {
      this.recalculate();
    });
  };

  recalculate = () => {
    let missingOvers = this.state.initialMissing;
    let acc = 0.0;
    let ac = [];
    let data = this.state.calculationData;
    for (let x = 0; x < this.state.interupts.length; x++) {
      let lastadded = this.state.interupts[x];
      let lastaddedOversLost = lastadded.oversLost;
      let lastaddedOversLeft = lastadded.oversLeft;
      let temp = Math.floor((lastaddedOversLeft - lastaddedOversLost) * 10);
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
    }
    this.setState(
      { acc: acc.toFixed(1), ac: ac, missing: missingOvers },
      () => {
        this.calculate();
      }
    );
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
    // console.log("R2", R2);
    // console.log("targetScore", targetScore);

    this.setState({ R2: R2, targetScore: targetScore });

    this.generateCards();
  };

  removeR2 = id => {
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

  backupData = async () => {
    const data = {
      edit: this.state.edit,
      editInterupt: this.state.editInterupt,
      score: this.state.score,
      open: this.state.open,
      init: this.state.init,
      reset: this.state.reset,
      gameID: this.state.gameID,
      R2: this.state.R2,
      initialMissing: this.state.initialMissing,
      targetScore: this.state.targetScore,
      missing: this.state.missing,
      acc: this.state.acc,
      ac: this.state.ac,
      R1: this.state.R1,
      totalOvers: this.state.totalOvers,
      startingOvers: this.state.startingOvers,
      interupts: this.state.interupts,
      dialog: this.state.dialog,
      globalValue: this.state.globalValue
    };

    console.log("Backingup Inning 2");
    try {
      let value = JSON.parse(await AsyncStorage.getItem("tempGame"));
      value.Inning2 = data;
      await AsyncStorage.mergeItem("tempGame", JSON.stringify(value));
      console.log("Inning 2 BackedUp");
    } catch (error) {
      console.log(error);
      // Error saving data
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

            {/* <Text>{interupt.id}</Text> */}

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
                  this.openInterrupt(true, interupt);
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

    this.setState({ cardString: data }, this.backupData);
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
            this.openInterrupt(false, {});
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-end"
          }}
        >
          <Text>Target: {this.state.targetScore.toString()}</Text>
          <Button
            title="Reset"
            color="#FF8800"
            onPress={() => {
              this.setState(
                {
                  score: -5,
                  targetScore: 0,
                  initialMissing: 0,
                  reset: true,
                  init: true,
                  interupts: [],
                  acc: 100.0,
                  ac: [],
                  missing: 0
                },
                async () => {
                  try {
                    await AsyncStorage.mergeItem(
                      "Inning2",
                      JSON.stringify({ size: 0 })
                    );
                    console.log("Inning 2 Saved", 0);
                  } catch (error) {
                    console.log(error);
                    // Error saving data
                  }
                }
              );
            }}
          >
            Reset
          </Button>
        </View>

        <Dialog.Container visible={this.state.open}>
          <Dialog.Title>Inning 2 Setup</Dialog.Title>
          <Dialog.Description> </Dialog.Description>
          <KeyboardAwareScrollView>
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
          </KeyboardAwareScrollView>
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
