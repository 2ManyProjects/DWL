import React from "react";
import {
  SafeAreaView,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TextInput,
  View
} from "react-native";
import { AsyncStorage } from "react-native";
import { Card } from "react-native-elements";
import Dialog from "react-native-dialog";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false, dataString: "", settings: [] };
    this.init();
  }

  init = async () => {
    let settings = await AsyncStorage.getItem("Settings");
    const def = [
      { Overs: 15, G: 90, minOvers: 3, id: 0 },
      { Overs: 20, G: 120, minOvers: 5, id: 1 },
      { Overs: 25, G: 150, minOvers: 7, id: 2 },
      { Overs: 50, G: 200, minOvers: 20, id: 3 }
    ];

    if (settings !== null) {
      //Todo Retreival
    } else {
      this.setState({ settings: def }, () => {
        this.generateString();
      });
    }
  };

  onChanged = (input, index, int) => {
    const data = this.state.settings;
    let prevdata = data[index];
    if (/^\d+$/.test(input)) {
      switch (int) {
        case 0:
          prevdata = {
            Overs: parseInt(input),
            G: prevdata.G,
            minOvers: prevdata.minOvers,
            id: prevdata.id
          };
          break;
        case 1:
          prevdata = {
            Overs: prevdata.Overs,
            G: parseInt(input),
            minOvers: prevdata.minOvers,
            id: prevdata.id
          };
          break;
        case 2:
          prevdata = {
            Overs: prevdata.Overs,
            G: prevdata.G,
            minOvers: parseInt(input),
            id: prevdata.id
          };
          break;
      }
    }
    data[index] = prevdata;
    console.log("[" + index + "]", data);
    this.setState({ settings: data }, () => {
      this.generateString();
    });
  };

  addNew = () => {
    let data = this.state.settings;
    data.push({
      Overs: 0,
      G: 0,
      minOvers: 0,
      id: this.state.settings.length
    });
    this.setState({ settings: data }, () => {
      this.generateString();
    });
  };

  remove = index => {
    let data = this.state.settings;
    data.splice(index, 1);
    this.setState({ settings: data }, () => {
      this.generateString();
    });
  };

  save = () => {
    //TODO: Saveing to AsynStorage

    this.props.close();
  };

  generateString = () => {
    let dataString = this.state.settings.map((game, index) => {
      return (
        <Card key={index}>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text>Total Overs</Text>
            <TextInput
              style={{
                height: 40,
                width: 200,
                borderColor: "gray",
                textAlign: "center",
                borderWidth: 1
              }}
              onChangeText={input => this.onChanged(input, index, 0)}
              value={"" + this.state.settings[index].Overs}
              maxLength={3}
            />
            <Text>{"\n"} Min Overs</Text>
            <TextInput
              style={{
                height: 40,
                width: 200,
                borderColor: "gray",
                textAlign: "center",
                borderWidth: 1
              }}
              keyboardType="numeric"
              onChangeText={input => this.onChanged(input, index, 2)}
              value={"" + this.state.settings[index].minOvers}
              maxLength={3} //setting limit of input
            />
            <Text>{"\n"} G Value</Text>
            <TextInput
              style={{
                height: 40,
                width: 200,
                borderColor: "gray",
                textAlign: "center",
                borderWidth: 1
              }}
              label="G"
              keyboardType="numeric"
              onChangeText={input => this.onChanged(input, index, 1)}
              value={"" + this.state.settings[index].G}
              maxLength={3} //setting limit of input
            />
          </View>
          <Button
            onPress={() => {
              this.remove(index);
            }}
            title="Delete"
            color="#FF8800"
          />
        </Card>
      );
    });
    this.setState({ dataString });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open
    });
  }

  render() {
    return (
      <Dialog.Container visible={this.state.open}>
        <Dialog.Title>Match Settings</Dialog.Title>
        <ScrollView>
          {this.state.dataString}
          <Button
            onPress={() => {
              this.addNew();
            }}
            title="Add"
            color="#FF8800"
          />
        </ScrollView>
        <Dialog.Button
          label="Save"
          onPress={() => {
            this.setState({ open: false }, () => {
              this.save();
            });
          }}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            this.setState({ open: false }, this.props.close());
          }}
        />
      </Dialog.Container>
    );
  }
}

export default Settings;
