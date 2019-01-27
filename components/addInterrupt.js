import React, { Component } from "react";
import { SafeAreaView, StyleSheet, Platform, Text } from "react-native";
import Dialog from "react-native-dialog";

class Interrupt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 50,
      wickets: 3,
      oversBowled: 20,
      oversLost: 10,
      oversLeft: 0
    };
  }

  onChange = (event, id) => {
    const value = event.nativeEvent.text;
    if (/^\d+$/.test(value)) {
      const val = parseInt(value);
      switch (id) {
        case "score":
          this.setState({ [id]: val });
          break;
        case "wickets":
          if (val < 11) {
            this.setState({ [id]: val });
          } else {
            alert("Invalid Number of Wickets");
          }
          break;
        case "oversBowled":
          this.setState({ [id]: val });
          break;
        case "oversLost":
          this.setState({ [id]: val });
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

  componentWillReceiveProps(props) {}

  handleCreate = () => {
    const data = {
      score: this.state.score,
      wickets: this.state.wickets,
      oversBowled: this.state.oversBowled,
      oversLost: this.state.oversLost,
      oversLeft: this.state.oversLeft
    };
    this.props.create(data);
    this.handleCancel();
  };

  handleCancel = () => {
    this.setState(
      {
        score: 0,
        wickets: 0,
        oversBowled: 0,
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
          <Dialog.Title>Inning of ##</Dialog.Title>
          <Dialog.Description> </Dialog.Description>
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
          <Dialog.Input
            label="Overs Bowled"
            onChange={event => {
              this.onChange(event, "oversBowled");
            }}
            value={this.getValue("oversBowled")}
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Input
            label="Over Lost"
            onChange={event => {
              this.onChange(event, "oversLost");
            }}
            value={this.getValue("oversLost")}
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Text>Overs Left ##</Text>
          <Dialog.Button label="Submit" onPress={this.handleCreate} />
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
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
