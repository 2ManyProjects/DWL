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
  AsyncStorage,
  TouchableOpacity,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import Interrupt from "../components/addInterrupt";
import { subtractOvers, generateGuid } from "../components/helpers";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
  Cell
} from "react-native-table-component";

export default class InningOne extends React.Component {
  _color = "#fff";
  static navigationOptions = {
    title: "Inning 1"
  };
  constructor(props) {
    super(props);
    this.state = {
      tableHead: ["Score", "Wkts", "Ovs/Bwld", "Ovs/Lost", "Info", "Del"],
      tableData: [],
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
      cardString: null,
      globalValue: [0, 0, 0],
      gameRule: {},
      disabled: { disable: false, time: null, score: 0, oversBowled: 0 }
    };
    // console.log("Inning 1 contructed");
  }

  initglobalValue = val => {
    let start = val;
    let arr = this.state.globalValue;
    arr[0] = this.state.gameRule.G;
    arr[1] = this.state.gameRule.Overs;
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
              calculationData: data.calculationData,
              gameRule: data.gameRule
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
    // console.log("Inning 1 Mounted");
    const val = JSON.parse(await AsyncStorage.getItem("tempGame"));
    if (val.Inning1.gameID) {
      await this._retrieveData(true);
      await this.loadGame(val.Inning1);
    } else {
      await this._retrieveData(false);
    }
    this.props.navigation.addListener("willFocus", this.load);
    // this.props.navigation.addListener("willBlur", this.save);
  }

  loadGame = async val => {
    this.setState(
      {
        edit: val.edit,
        editInterupt: val.editInterupt,
        gameID: val.gameID,
        missing: val.missing,
        acc: val.acc,
        ac: val.ac,
        R1: val.R1,
        totalOvers: val.totalOvers,
        startingOvers: val.startingOvers,
        interupts: val.interupts,
        dialog: val.dialog,
        globalValue: val.globalValue,
        gameRule: val.gameRule,
        disabled: val.disabled
      },
      () => {
        this.recalculate();
      }
    );
  };

  load = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem("Inning2");
      if (value !== null) {
        console.log("Value ", value);
        const start = JSON.parse(value).size > 0;
        self.setState({
          block: start
        });
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
      alert("Please Reset Inning 2 before modifying Inning 1");
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
    let interruptArray = this.state.interupts;
    tempData["id"] = generateGuid();
    interruptArray.push(tempData);
    this.setState({ interupts: interruptArray }, () => {
      this.recalculate();
    });
  };
  edit = (oldInterrupt, newInterrupt) => {
    const interruptIndex = this.state.interupts.indexOf(oldInterrupt);
    let newList = this.state.interupts;
    this.removeR1(oldInterrupt.id);
    newList[interruptIndex] = newInterrupt;
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
      let temp = Math.floor(
        subtractOvers(lastaddedOversLeft, lastaddedOversLost) /* / 2*/ * 10
      );
      console.log(
        "Temp",
        temp,
        "OL",
        lastaddedOversLeft,
        "OLost",
        lastaddedOversLost
      );
      let wickets = lastadded.wickets;
      let initial = 0;
      let next = 0;
      if (Math.floor(lastaddedOversLeft * 10) !== 0)
        initial = data[Math.floor(lastaddedOversLeft * 10)][wickets];
      else initial = 0.0;
      if (temp !== 0) next = data[temp][wickets];
      else next = 0.0;
      acc = acc + (initial - next);
      ac.push(initial - next);
      console.log("ACC", acc);
      missingOvers += lastaddedOversLost /* / 2*/;
    }
    this.setState(
      { acc: acc.toFixed(1), ac: ac, missing: missingOvers },
      () => {
        this.calculateR1();
      }
    );
  };

  calculateR1 = () => {
    let R1 =
      this.state.calculationData[this.state.globalValue[2] * 10][0] -
      parseFloat(this.state.acc);
    console.log("R1", R1);
    this.setState({ R1: R1 }, async () => {
      const data = {
        missing: this.state.missing,
        R1: this.state.R1,
        gameRule: this.state.gameRule,
        disabled: this.state.disabled
      };

      this.generateCards();
      this.generateTable();
      try {
        await AsyncStorage.mergeItem("Inning1", JSON.stringify(data));
      } catch (error) {
        console.log(error);
        // Error saving data
      }
      // console.log("R1", this.state.R1);
    });
  };

  removeR1 = id => {
    let inter = this.state.interupts;
    const self = this;
    for (let i = 0; i < inter.length; i++) {
      if (inter[i].id === id) {
        if (i < inter.length - 1 && inter.length !== 1) {
          Alert.alert(
            "Interrupt Message",
            "This action will also clear all Interrupts after this one",
            [
              {
                text: "OK",
                onPress: i => {
                  let inter = self.state.interupts;
                  console.log("I", i, " Inter ", inter);
                  for (let x = i; x < inter.length; x++) {
                    console.log(
                      "Inter time",
                      inter[x].time,
                      " Compare",
                      self.state.disabled.time
                    );
                    if (inter[x].time === self.state.disabled.time) {
                      self.setState({
                        disabled: {
                          disable: false,
                          time: null,
                          score: 0,
                          oversBowled: 0
                        }
                      });
                    }
                  }
                  inter.splice(i, inter.length - 1);
                  self.setState({ interupts: inter }, () => {
                    self.recalculate();
                  });
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
          if (inter[i].time === this.state.disabled.time) {
            this.setState({
              disabled: { disable: false, time: null, score: 0, oversBowled: 0 }
            });
          }

          inter.splice(i, 1);
          this.setState({ interupts: inter }, () => {
            this.recalculate();
          });
        }
        break;
      }
    }
  };

  backupData = async () => {
    const data = {
      edit: this.state.edit,
      editInterupt: this.state.editInterupt,
      gameID: this.state.gameID,
      missing: this.state.missing,
      acc: this.state.acc,
      ac: this.state.ac,
      R1: this.state.R1,
      totalOvers: this.state.totalOvers,
      startingOvers: this.state.startingOvers,
      interupts: this.state.interupts,
      dialog: this.state.dialog,
      globalValue: this.state.globalValue,
      gameRule: this.state.gameRule,
      disabled: this.state.disabled
    };

    console.log("Backingup Inning 1");
    try {
      let value = JSON.parse(await AsyncStorage.getItem("tempGame"));
      value.Inning1 = data;
      await AsyncStorage.mergeItem("tempGame", JSON.stringify(value));
      // console.log("Inning 1 BackedUp");
    } catch (error) {
      console.log(error);
      // Error saving data
    }
  };

  disable = data => {
    this.setState({ disabled: data });
  };

  getSpacing = (len, data) => {
    let string = "";
    for (let x = 0; x < 3 - len; x++) {
      switch (data) {
        case 0:
          string += "     ";
          break;
        case 1:
          string += "      ";
          break;
        case 2:
          string += "   ";
          break;
        case 4:
          string += "  ";
          break;
      }
    }
    return string;
  };

  generateCards = () => {
    let data = "";
    const testStyle = {
      // borderBottomWidth: 1,
      // borderBottomColor: "#000",
      fontWeight: "bold",
      fontSize: 15
    };
    const iconSize = 26;
    data = this.state.interupts.map((interupt, index) => {
      return (
        <View
          key={index}
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            paddingBottom: 15
          }}
        >
          <TextInput
            editable={false}
            style={[testStyle, { backgroundColor: this._color }]}
            value={interupt.score.toString()}
          />
          <TextInput
            editable={false}
            style={[testStyle, { backgroundColor: this._color }]}
            value={
              this.getSpacing(interupt.wickets.toString().length, 0) +
              interupt.wickets.toString()
            }
          />
          <TextInput
            editable={false}
            style={[testStyle, { backgroundColor: this._color }]}
            value={
              this.getSpacing(interupt.oversBowled.toString().length, 1) +
              interupt.oversBowled.toString()
            }
          />
          <TextInput
            editable={false}
            style={[testStyle, { backgroundColor: this._color }]}
            value={
              this.getSpacing(interupt.oversLost.toString().length, 2) +
              interupt.oversLost.toString()
            }
          />
          <Icon
            name="exclamationcircle"
            type="antdesign"
            color="#FF8800"
            onPress={() => {
              alert(interupt.time.toString());
            }}
            style={{ backgroundColor: this._color, paddingLeft: 5 }}
            size={iconSize}
          />
          <Icon
            onPress={() => {
              if (this.state.block) {
                alert(
                  "Please Clear interupts from Inning 2 before modifying Inning 1"
                );
              } else {
                this.removeR1(interupt.id);
              }
            }}
            style={{ backgroundColor: this._color, paddingLeft: 0 }}
            size={iconSize}
            color="#FF8800"
            name="closecircle"
            type="antdesign"
          />
          <View
            style={{
              borderBottomColor: "gray",
              borderBottomWidth: 1
            }}
          />
        </View>
      );
    });

    this.setState({ cardString: data }, this.backupData);
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
              if (this.state.block) {
                alert(
                  "Please Clear interupts from Inning 2 before modifying Inning 1"
                );
              } else {
                this.removeR1(this.state.interupts[index].id);
              }
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
      data[x].push(info(x));
      data[x].push(del(x));
    }
    this.setState({ tableData: data });
  };

  render() {
    const { navigation, screenProps } = this.props;
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
            Format:{" "}
            {this.state.gameRule.Overs !== undefined &&
              this.state.gameRule.Overs.toString()}
          </Text>
          {/* <Text
            style={{
              fontWeight: "bold",
              fontSize: 18
            }}
          >
            Overs Lost: {this.state.missing.toString()}
          </Text> */}
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18
            }}
          >
            Started As: {this.state.globalValue[2].toString()}
          </Text>
        </View>

        {/* <View
          style={{
            justifyContent: "space-evenly",
            flexDirection: "row",
            marginTop: 10,
            paddingBottom: 10
          }}
        >
          <Text style={[titleStyle, { backgroundColor: this._color }]}>Sc</Text>
          <Text style={[titleStyle, { backgroundColor: this._color }]}>
            Wts
          </Text>
          <Text style={[titleStyle, { backgroundColor: this._color }]}>
            O/B
          </Text>
          <Text style={[titleStyle, { backgroundColor: this._color }]}>
            O/L
          </Text>
          <Text style={[titleStyle, { backgroundColor: this._color }]}>
            Info
          </Text>
          <Text style={[titleStyle, { backgroundColor: this._color }]}>
            Dlt
          </Text>
        </View>
        <ScrollView>{this.state.cardString}</ScrollView> */}
        <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
          <Row
            data={this.state.tableHead}
            style={tableStyle.head}
            textStyle={tableStyle.text}
          />
          <Rows data={this.state.tableData} textStyle={tableStyle.text} />
        </Table>

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
          gameRule={this.state.gameRule}
          disable={this.disable}
        />
        <View
          style={[{ width: "30%", alignSelf: "center", paddingBottom: 15 }]}
        >
          <Button
            title="Add Interrupt"
            color="#FF8800"
            disabled={this.state.disabled.disable}
            onPress={() => {
              this.openInterrupt(false);
            }}
          />
        </View>
        {/* <FloatingAction
          position="center"
          showBackground={false}
          onPressMain={() => {
            this.openInterrupt(false);
          }}
        /> */}
      </SafeAreaView>
    );
  }
}

const tableStyle = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6 }
});

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
