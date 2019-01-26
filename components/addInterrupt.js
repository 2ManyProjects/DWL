import React, { Component } from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";
import Dialog from "react-native-dialog";

class Interrupt extends Component {
  constructor(props) {
    super(props);
  }

  onChange = (event, id) => {
    const { value } = event.nativeEvent;
    alert(event.value);
    console.log("Data" + id, event);
    if (/^\d+$/.test(value)) {
      const value = parseInt(input);
      if (overs) console.log("Change", event.target.id);
      else {
        // if (value <= this.state.totalOvers) {
        //   this.setState({ startingOvers: value }, () => {
        //     this.checkInputs();
        //   });
        // } else {
        //   this.setState({ startingOvers: 0 }, () => {
        //     this.checkInputs();
        //   });
        //   alert("Starting Overs Cannot be Greater than Total Overs");
        // }
      }
    }
  };

  componentWillReceiveProps(props) {}

  handleCancel = () => {
    this.props.closeInterrupt();
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
              this.onChange(event, "Score");
            }}
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Input
            label="Wickets Fallen"
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Input
            label="Overs Bowled"
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Input
            label="Over Lost"
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Input
            label="Overs Left"
            underlineColorAndroid="#000"
            style={dependant.OS}
            keyboardType="numeric"
          />
          <Dialog.Button label="Submit" onPress={this.handleCancel} />
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
