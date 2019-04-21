import React, { Component } from "react";
import { SafeAreaView, View, StyleSheet, Platform, Text } from "react-native";
import Dialog from "react-native-dialog";
import { subtractOvers } from "./helpers";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

class Interrupt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      edit: false,
      editInterupt: {},
      wickets: 0,
      totalOvers: 0,
      oversBowledBall: 0,
      oversLostBall: 0,
      oversBowled: 0,
      oversLost: 0,
      oversLeft: 0
    };
  }

  onChange = (event, id) => {
    const value = event.nativeEvent.text;
    if (/^\d+$/.test(value)) {
      // let val = value.toFixed(1);

      let val = value;
      switch (id) {
        case "score":
          if (value != "0") this.setState({ [id]: parseInt(value) });
          else this.setState({ [id]: 0 });
          break;
        case "wickets":
          if (val < 11) {
            if (value != "0") this.setState({ [id]: parseInt(value) });
            else this.setState({ [id]: 0 });
          } else {
            alert("Invalid Number of Wickets");
          }
          break;
        case "oversBowled":
          if (value != "0") this.setState({ [id]: parseInt(value) });
          else this.setState({ [id]: 0 });
          break;
        case "oversBowledBall":
          if (value <= 6) {
            if (value != "0") this.setState({ [id]: parseInt(value) });
            else this.setState({ [id]: 0 });
          } else alert("No more thank 6 balls in an over");
          break;
        case "oversLost":
          if (value != "0") this.setState({ [id]: parseInt(value) });
          else this.setState({ [id]: 0 });
          break;
        case "oversLostBall":
          if (value <= 6) this.setState({ [id]: parseInt(value) });
          else alert("No more thank 6 balls in an over");
          break;
        default:
          break;
      }
    } else if (value.length === 0) {
      this.setState({ [id]: 0 });
    } else {
      this.setState({ [id]: this.state[id] });
    }
  };

  getValue = input => {
    if (this.state[input] && this.state[input] != 0)
      return this.state[input].toString();
    else return "";
  };

  componentWillReceiveProps(props) {
    // console.log("Props", this.props);
    if (this.props.willEdit) {
      this.setState({
        score: this.props.interupt.score,
        wickets: this.props.interupt.wickets,
        oversBowled: this.props.interupt.oversBowled,
        oversBowledBall: this.props.interupt.oversBowledBall,
        oversLostBall: this.props.interupt.oversLostBall,
        oversLost: this.props.interupt.oversLost,
        oversLeft: this.props.interupt.oversLeft,
        edit: this.props.willEdit,
        editInterupt: this.props.interupt
      });
    }
    this.setState({ totalOvers: this.props.globals[2] - this.props.missing });
  }

  componentWillUpdate() {}

  handleCreate = () => {
    let BowledBalls = 0;
    let LostBalls = 0;
    if (this.state.oversBowledBall > 0)
      BowledBalls = this.state.oversBowledBall / 10;
    if (this.state.oversLostBall > 0)
      BowledBalls = this.state.oversLostBall / 10;
    let data = {
      score: this.state.score,
      wickets: this.state.wickets,
      oversBowled: this.state.oversBowled + BowledBalls,
      oversLost: this.state.oversLost + LostBalls,
      oversLeft: subtractOvers(this.state.totalOvers, this.state.oversBowled)
    };
    if (this.state.edit) {
      const editInterupt = this.state.editInterupt;
      data["id"] = editInterupt.id;
      data["time"] = editInterupt.time;
      this.handleCancel();
      this.props.edit(editInterupt, data);
    } else {
      this.handleCancel();
      this.props.create(data);
    }
  };
  getTitle = () => {
    return "Inning of " + this.state.totalOvers.toString();
  };

  handleCancel = () => {
    this.setState(
      {
        score: 0,
        edit: false,
        editInterupt: {},
        wickets: 0,
        oversBowled: 0,
        oversBowledBall: 0,
        oversLostBall: 0,
        oversLost: 0,
        oversLeft: 0
      },
      this.props.closeInterrupt()
    );
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Dialog.Container visible={this.props.open}>
          <Dialog.Title>{this.getTitle()}</Dialog.Title>
          <Dialog.Description> </Dialog.Description>
          <KeyboardAwareScrollView>
            <Dialog.Input
              label="Score"
              onChange={event => {
                this.onChange(event, "score");
              }}
              value={this.getValue("score")}
              underlineColorAndroid="#000"
              style={dependant.OS}
              keyboardType="numeric"
            />
            <Dialog.Input
              label="Wickets Fallen"
              onChange={event => {
                this.onChange(event, "wickets");
              }}
              value={this.getValue("wickets")}
              underlineColorAndroid="#000"
              style={dependant.OS}
              keyboardType="numeric"
            />
            <View
              style={{
                flex: 1,
                flexDirection: "row"
              }}
            >
              <Dialog.Input
                label="Overs Bowled"
                onChange={event => {
                  this.onChange(event, "oversBowled");
                }}
                value={this.getValue("oversBowled")}
                underlineColorAndroid="#000"
                style={dependant.OS}
                keyboardType="decimal-pad"
              />
              <Dialog.Input
                label="Balls Bowled"
                onChange={event => {
                  this.onChange(event, "oversBowledBall");
                }}
                value={this.getValue("oversBowledBall")}
                underlineColorAndroid="#000"
                style={dependant.OS}
                keyboardType="decimal-pad"
              />
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row"
              }}
            >
              <Dialog.Input
                label="Over Lost Current Inning"
                onChange={event => {
                  this.onChange(event, "oversLost");
                }}
                value={this.getValue("oversLost")}
                underlineColorAndroid="#000"
                style={dependant.OS}
                keyboardType="decimal-pad"
              />
              {/* <Dialog.Input
                label="Balls Bowled"
                onChange={event => {
                  this.onChange(event, "oversLostBall");
                }}
                value={this.getValue("oversLostBall")}
                underlineColorAndroid="#000"
                style={dependant.OS}
                keyboardType="decimal-pad"
              /> */}
            </View>
            <Text>
              Overs Left:{" "}
              {subtractOvers(
                this.state.totalOvers,
                this.state.oversBowled
              ).toString()}
            </Text>
            <Dialog.Button label="Submit" onPress={this.handleCreate} />
            <Dialog.Button label="Cancel" onPress={this.handleCancel} />
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

export default Interrupt;
