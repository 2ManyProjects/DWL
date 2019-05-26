import React, { Component } from "react";
import { SafeAreaView, View, StyleSheet, Platform, Text } from "react-native";
import Dialog from "react-native-dialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

class Init extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0
    };
  }

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

  componentWillReceiveProps(props) {
    // console.log("Props", this.props);
  }

  componentWillUpdate() {}

  Submit = () => {
    const temp = this.state.score;

    if (!this.props.disabled.disable) {
      if (temp > 0) {
        this.setState({ score: 0 }, this.props.closeInit(temp, true));
      } else {
        alert("Score Cannot be less than 1");
      }
    } else {
      if (
        temp >= this.props.gameRule.minOvers &&
        temp <= this.props.disabled.oversBowled
      ) {
        this.setState({ score: 0 }, this.props.closeInit(temp, false));
      } else {
        alert(
          "Overs Cannot be less than the Games minimum Overs or greater than the previous Innings Overs Bowled"
        );
      }
    }
  };

  Cancel = () => {
    this.setState({ score: 0 }, this.props.Cancel());
  };

  getValue = input => {
    if (this.state[input] && this.state[input] != -5)
      return this.state[input].toString();
    else return "";
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Dialog.Container visible={this.props.open}>
          <Dialog.Title>Inning 2 Setup</Dialog.Title>
          <Dialog.Description> </Dialog.Description>
          <Dialog.Input
            label={
              this.props.disabled.disable
                ? "Inning 2 playable Overs"
                : "Inning 1 Score"
            }
            onChange={event => {
              this.onChange(event, "score");
            }}
            value={this.getValue("score")}
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Button label="Submit" onPress={this.Submit} />
          <Dialog.Button label="Cancel" onPress={this.Cancel} />
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

export default Init;
