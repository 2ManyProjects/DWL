import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Platform,
  ScrollView,
  AlertIOS,
  AsyncStorage,
  TouchableOpacity,
  Alert
} from "react-native";
import Dialog from "react-native-dialog";
import Interrupt from "../components/addInterrupt";
import { subtractOvers, generateGuid } from "../components/helpers";
import Init from "./Init";
import Icon from "react-native-vector-icons/AntDesign";
import { StackActions, NavigationActions } from "react-navigation";

import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
  Cell
} from "react-native-table-component";

export default class InningTwo extends React.Component {
  _color = "#fff";
  static navigationOptions = {
    title: "Inning 2"
  };
  constructor(props) {
    super(props);
    this.state = {
      tableHead: [
        "Score",
        "Wkts",
        "Ovs/Bwld",
        "Ovs/Lost",
        "Curr/Tgt",
        "Info",
        "Del"
      ],
      initialTarget: 0,
      tableData: [],
      targetArray: [],
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
      calculations: false,
      calculationData: {},
      interupts: [],
      dialog: false,
      showTutorial: false,
      globalValue: [0, 0, 0],
      disabled: { disable: false, time: null, score: 0, oversBowled: 0 },
      endGame: { disable: false, time: null, score: 0, oversBowled: 0 },
      gameRule: { Overs: 15, G: 90, minOvers: 3, id: 0 }
    };
    this.setup = this.setup.bind(this);
    // console.log("Inning 2 contructed");
  }

  Cancel = () => {
    this.setState({ open: false }, () => {
      this.reset();
    });
  };

  initglobalValue = val => {
    let start = val;
    let arr = this.state.globalValue;
    arr[0] = this.state.gameRule.G;
    arr[1] = this.state.gameRule.Overs;
    arr[2] = start;
    console.log("DATA", start);
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
              calculationData: data.calculationData,
              gameRule: data.gameRule,
              showTutorial: data.showTutorial
            },
            () => {
              this.initglobalValue(start);
            }
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
    const val = JSON.parse(await AsyncStorage.getItem("tempGame"));
    if (val.Inning2.gameID) {
      await this._retrieveData(true);
      await this.loadGame(val.Inning2);
    } else {
      await this._retrieveData(false);
    }
    this.props.navigation.addListener("willFocus", this.load);
    await this.load();
    // this.props.navigation.addListener("willBlur", this.save);
  }

  loadGame = async val => {
    this.setState(
      {
        edit: val.edit,
        editInterupt: val.editInterupt,
        targetArray: val.targetArray,
        score: val.score,
        open: val.open,
        init: val.init,
        reset: val.reset,
        gameID: val.gameID,
        R2: val.R2,
        initialMissing: val.initialMissing,
        targetScore: val.targetScore,
        missing: val.missing,
        initialTarget: val.initialTarget,
        acc: val.acc,
        ac: val.ac,
        R1: val.R1,
        totalOvers: val.totalOvers,
        startingOvers: val.startingOvers,
        interupts: val.interupts,
        dialog: val.dialog,
        globalValue: val.globalValue,
        endGame: val.endGame,
        gameRule: val.gameRule,
        disabled: val.disabled,
        showTutorial: val.showTutorial
      },
      () => {
        this.recalculate();
      }
    );
  };

  load = async () => {
    const self = this;
    if (this.state.reset) {
      this.setState({
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
        initialTarget: 0,
        ac: [],
        R1: 100.0,
        totalOvers: null,
        startingOvers: null,
        interupts: [],
        dialog: false,
        targetArray: [],
        showTutorial: false,
        endGame: { disable: false, time: null, score: 0, oversBowled: 0 },
        disabled: { disable: false, time: null, score: 0, oversBowled: 0 }
      });
    }
    try {
      const value = await AsyncStorage.getItem("Inning1");
      if (value !== null) {
        const data = JSON.parse(value);
        console.log("R1 DATA: ", data.R1);
        if (data.disabled === undefined) {
          data.disabled = {
            disable: false,
            time: null,
            score: 0,
            oversBowled: 0
          };
        } else {
          // console.log("R1 Disabled: ", data.disabled);
        }
        self.setState(
          {
            missing:
              self.state.missing !== 0 ? self.state.missing : data.missing,
            initialMissing:
              self.state.initialMissing !== 0
                ? self.state.initialMissing
                : data.missing,
            R1: data.R1,
            disabled: data.disabled
          },
          () => {
            if (data.disabled.disable) {
              self.setState({ score: data.disabled.score }, () => {
                if (
                  Math.floor(data.disabled.oversBowled) ===
                  self.state.gameRule.minOvers
                ) {
                  self.setState(
                    {
                      initialMissing:
                        self.state.gameRule.Overs - self.state.gameRule.minOvers
                    },
                    () => {
                      self.recalculate();
                    }
                  );
                }
              });
            }
          }
        );
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
      this.setState({ R2: R2, init: false }, () => {
        this.calculate(false);
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
      if (this.state.interupts.length !== this.state.targetArray.length) {
        let tempArray = this.state.targetArray;
        tempArray.push({ id: tempData.id, score: null });
        this.setState({ targetArray: tempArray }, () => {
          this.recalculate();
        });
      } else {
        this.recalculate();
      }
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
      let temp = Math.floor(
        subtractOvers(lastaddedOversLeft, lastaddedOversLost) * 10
      );
      let wickets = lastadded.wickets;
      let initial = 0;
      let next = 0;
      // console.log("wickets", wickets, "temp ", temp);
      if (Math.floor(lastaddedOversLeft * 10) !== 0)
        initial = data[Math.floor(lastaddedOversLeft * 10)][wickets];
      else initial = 0.0;
      if (temp !== 0) next = data[temp][wickets];
      else next = 0.0;
      acc = acc + (initial - next);
      ac.push(initial - next);
      missingOvers += lastaddedOversLost;
      console.log("Calculation", initial + " - " + next);
      console.log("Acc:", acc.toFixed(1));
    }
    this.setState(
      { acc: acc.toFixed(1), ac: ac, missing: missingOvers },
      () => {
        this.calculate(false);
      }
    );
  };

  calculate = init => {
    let R2 = 0.0;
    R2 =
      this.state.calculationData[
        (this.state.globalValue[2] - this.state.initialMissing) * 10
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

    if (init) {
      this.setState({ initialTarget: targetScore });
    }

    if (
      this.state.targetArray.length > 0 &&
      this.state.targetArray[this.state.targetArray.length - 1].score === null
    ) {
      let tempArray = this.state.targetArray;
      tempArray[this.state.targetArray.length - 1] = {
        id: tempArray[this.state.targetArray.length - 1].id,
        score: targetScore
      };
      this.setState(
        { targetArray: tempArray },
        console.log("TargetArray", tempArray)
      );
    }
    console.log("ENDGAME", this.state.endGame);
    if (this.state.endGame.disable) {
      if (Platform.OS !== "ios") {
        alert(
          "The Current Batting team has" +
            (this.state.endGame.score >= targetScore ? " won " : " lost ") +
            "with the targetScore being " +
            targetScore +
            " and their score being " +
            this.state.endGame.score
        );
      }
    }
    console.log("[X - ?] ", this.state.globalValue[2]);
    console.log("[? - X]2 ", this.state.initialMissing);
    console.log("Global Value ", this.state.globalValue[0]);
    console.log("Score", this.state.score);
    console.log("R1", this.state.R1);
    console.log("R2", R2);
    console.log("targetScore", targetScore);

    this.setState({ R2: R2, targetScore: targetScore });

    this.generateTable();
  };

  removeR2 = id => {
    let inter = this.state.interupts;
    let tarArray = this.state.targetArray;
    const self = this;
    for (let i = 0; i < inter.length; i++) {
      if (inter[i].id === id) {
        if (i < inter.length - 1 && i !== 0) {
          Alert.alert(
            "Interrupt Message",
            "This action will also clear all Interrupts after this one",
            [
              {
                text: "OK",
                onPress: i => {
                  let inter = self.state.interupts;
                  let tarArray = self.state.targetArray;
                  console.log("I", i, " Inter ", inter);
                  let missing = self.state.missing;
                  for (let x = i; x < i.length; x++) {
                    missing -= inter[x].oversLost;
                    console.log(
                      "Inter time",
                      inter[x].time,
                      " Compare",
                      self.state.disabled.time
                    );
                    if (inter[x].time === self.state.endGame.time) {
                      self.setState({
                        endGame: {
                          disable: false,
                          time: null,
                          score: 0,
                          oversBowled: 0
                        }
                      });
                    }
                  }
                  inter.splice(i, inter.length - 1);
                  tarArray.splice(i, inter.length - 1);
                  self.setState(
                    {
                      interupts: inter,
                      missing: missing,
                      targetArray: tarArray
                    },
                    () => {
                      self.recalculate();
                    }
                  );
                }
              },
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel"
              }
            ],
            { cancelable: false }
          );
        } else {
          if (inter[i].time === this.state.endGame.time) {
            this.setState({
              endGame: { disable: false, time: null, score: 0, oversBowled: 0 }
            });
          }
          const missing = this.state.missing - inter[i].oversLost;
          inter.splice(i, 1);
          tarArray.splice(i, 1);
          this.setState(
            { interupts: inter, missing: missing, targetArray: tarArray },
            () => {
              this.recalculate();
            }
          );
        }
        break;
      }
    }
  };

  Submit = (val, def) => {
    try {
      AsyncStorage.mergeItem("Inning2", JSON.stringify({ size: 1 }));
    } catch (error) {
      console.log(error);
      // Error saving data
    }
    if (def) {
      this.setState({ open: false, score: val }, () => {
        this.calculate(true);
      });
    } else {
      // let tempArray = this.state.globalValue;
      // tempArray[2] = this.state.gameRule.Overs;
      this.setState(
        {
          open: false,
          missing: this.state.globalValue[2] - parseInt(val),
          initialMissing: this.state.globalValue[2] - parseInt(val)
          // globalValue: tempArray
        },
        () => {
          this.calculate(true);
        }
      );
    }
  };

  setup() {
    if (
      Math.floor(this.state.disabled.oversBowled) ===
      this.state.gameRule.minOvers
    ) {
      return false;
    } else {
      return true;
    }
  }

  backupData = async () => {
    const data = {
      edit: this.state.edit,
      editInterupt: this.state.editInterupt,
      targetArray: this.state.targetArray,
      initialTarget: this.state.initialTarget,
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
      globalValue: this.state.globalValue,
      disabled: this.state.disabled,
      endGame: this.state.endGame,
      gameRule: this.state.gameRule,
      showTutorial: this.state.showTutorial
    };

    // console.log("Backingup Inning 2");
    try {
      let value = JSON.parse(await AsyncStorage.getItem("tempGame"));
      value.Inning2 = data;
      await AsyncStorage.mergeItem("tempGame", JSON.stringify(value));
      // console.log("Inning 2 BackedUp");
    } catch (error) {
      console.log(error);
      // Error saving data
    }
  };

  reset = () => {
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
          await AsyncStorage.mergeItem("Inning2", JSON.stringify({ size: 0 }));
          const resetAction = StackActions.reset({
            index: 1,
            actions: [NavigationActions.navigate({ routeName: "InningOne" })]
          });
          this.props.navigation.dispatch(resetAction);
          const navigateAction = NavigationActions.navigate({
            routeName: "InningOne",

            params: {},

            action: NavigationActions.navigate({ routeName: "InningOne" })
          });

          this.props.navigation.dispatch(navigateAction);
          // console.log("Inning 2 Saved", 0);
        } catch (error) {
          console.log(error);
          // Error saving data
        }
      }
    );
  };

  generateTable = () => {
    const info = index => (
      <TouchableOpacity>
        <View
          style={{
            alignItems: "center"
          }}
        >
          <Icon
            name="exclamationcircle"
            type="antdesign"
            color="#FF8800"
            onPress={() => {
              alert(this.state.interupts[index].time.toString());
            }}
            style={{ backgroundColor: this._color, paddingLeft: 5 }}
            size={26}
          />
        </View>
      </TouchableOpacity>
    );
    const del = index => (
      <TouchableOpacity>
        <View
          style={{
            alignItems: "center"
          }}
        >
          <Icon
            onPress={() => {
              this.removeR2(this.state.interupts[index].id);
            }}
            style={{ backgroundColor: this._color, paddingLeft: 0 }}
            size={26}
            color="#FF8800"
            name="closecircle"
            type="antdesign"
          />
        </View>
      </TouchableOpacity>
    );
    const text = String => (
      <TouchableOpacity>
        <View
          style={{
            alignItems: "center"
          }}
        >
          <Text>{String}</Text>
        </View>
      </TouchableOpacity>
    );
    let data = this.state.interupts.map(data => {
      return [];
    });
    for (let x = 0; x < this.state.interupts.length; x++) {
      data[x].push(text(this.state.interupts[x].score.toString()));
      data[x].push(text(this.state.interupts[x].wickets.toString()));
      data[x].push(text(this.state.interupts[x].oversBowled.toString()));
      data[x].push(text(this.state.interupts[x].oversLost.toString()));
      data[x].push(text(this.state.targetArray[x].score.toString()));
      data[x].push(info(x));
      data[x].push(del(x));
    }
    this.setState({ tableData: data }, this.backupData);
  };

  getValue = input => {
    if (this.state[input] && this.state[input] != -5)
      return this.state[input].toString();
    else return "";
  };

  disable = data => {
    let finalData = {
      disable: data.disable,
      time: data.time,
      score: data.score,
      oversBowled: data.oversBowled
    };
    this.setState({ endGame: finalData }, () => {
      this.create(data.interrupt);
    });
  };

  render() {
    const titleStyle = {
      fontWeight: "bold",
      fontSize: 18
    };
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            justifyContent: "space-evenly",
            flexDirection: "row",
            marginTop: 20,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#000"
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18
            }}
          >
            1st Inn: {this.state.score.toString()}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18
            }}
          >
            2nd Inn Ov:{" "}
            {this.state.gameRule !== undefined &&
              (
                this.state.globalValue[2] - this.state.initialMissing
              ).toString()}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18
            }}
          >
            Target: {this.state.initialTarget}
          </Text>
        </View>
        <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
          <Row
            data={this.state.tableHead}
            style={tableStyle.head}
            textStyle={tableStyle.text}
          />
          <Rows data={this.state.tableData} textStyle={tableStyle.text} />
        </Table>
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
          gameRule={this.state.gameRule}
          disable={this.disable}
          showTutorial={this.state.showTutorial}
        />

        <View style={[{ paddingTop: 15 }]}>
          <View
            style={[{ width: "30%", alignSelf: "center", paddingBottom: 15 }]}
          >
            <Button
              title="Add Interruption"
              color="#FF8800"
              disabled={this.state.endGame.disable}
              onPress={() => {
                this.openInterrupt(false);
              }}
            />
          </View>
          <Dialog.Container visible={this.state.calculations}>
            <Dialog.Title>Inning 2 Calculations</Dialog.Title>
            <Text>Target: {this.state.targetScore.toString()}</Text>
            <Text>R1: {this.state.R1.toFixed(1).toString()}</Text>
            <Text>R2: {this.state.R2.toFixed(1).toString()}</Text>
            <Text>Initial Missing: {this.state.initialMissing.toString()}</Text>
            <Text>Total Missing: {this.state.missing.toString()}</Text>
            <Text>G: {this.state.globalValue[0].toString()}</Text>
            {this.state.gameRule !== undefined && (
              <Text>Total Overs: {this.state.gameRule.Overs.toString()}</Text>
            )}
            <Dialog.Button
              label="Close"
              onPress={() => {
                this.setState({ calculations: false });
              }}
            />
          </Dialog.Container>
          <View
            style={[
              {
                flexDirection: "row",
                paddingLeft: 50,
                paddingRight: 50,
                justifyContent: "space-between"
              }
            ]}
          >
            <Button
              title="Summary"
              color="#FF8800"
              onPress={() => {
                this.setState({ calculations: true });
              }}
            />
            <Button title="Reset" color="#FF8800" onPress={this.reset} />
          </View>
          {this.setup() && (
            <Init
              open={this.state.open}
              closeInit={this.Submit}
              disabled={this.state.disabled}
              gameRule={this.state.gameRule}
              Cancel={this.Cancel}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const tableStyle = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6 },
  btn: { width: 58, height: 18, backgroundColor: "#78B7BB", borderRadius: 2 },
  btnText: { textAlign: "center", color: "#fff" }
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  }
});
