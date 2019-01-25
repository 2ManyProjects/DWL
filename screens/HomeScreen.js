import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  TextInput,
  View
} from "react-native";
import { WebBrowser } from "expo";

import { MonoText } from "../components/StyledText";
import data from "../raw/data";

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    var filtered = data.filter(function(el) {
      return el[0] != null;
    });

    this.state = {
      gameID: "",
      totalOvers: 0,
      startingOvers: 0,
      calculationData: filtered,
      gameData: {}
    };
  }
  static navigationOptions = {
    header: null
  };

  onChanged = (input, overs) => {
    let newText = "";
    let numbers = "0123456789";
    for (var i = 0; i < input.length; i++) {
      if (numbers.indexOf(input[i]) > -1) {
        newText = newText + input[i];
      } else {
        // your call back function
        alert("please enter numbers only");
      }
    }
    let data = parseInt(newText, 10);
    console.log("KEYPRESS:", data, data !== "NaN");
    if (data) {
      if (overs) this.setState({ totalOvers: data });
      else this.setState({ startingOvers: data });
    } else {
      if (overs) this.setState({ totalOvers: 0 });
      else this.setState({ startingOvers: 0 });
    }
  };

  checkInputs = () => {
    return !(
      this.state.gameID.length > 2 &&
      this.state.totalOvers > 10 &&
      this.state.startingOvers > 10
    );
  };

  onLoad = () => {};

  onSubmit = () => {
    this.props.navigation.navigate("Main");
  };

  getTotalOvers = () => {
    if (this.state.totalOvers != 0) return this.state.totalOvers.toString();
    else return null;
  };

  getStartOvers = () => {
    if (this.state.startingOvers != 0)
      return this.state.startingOvers.toString();
    else return null;
  };

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text>{"\n"}</Text>
          <Text>{"\n"}</Text>
          <Text>{"\n"}</Text>
          <TextInput
            placeholder="Enter Game ID"
            style={{
              height: 40,
              width: 200,
              borderColor: "gray",
              textAlign: "center",
              borderWidth: 1
            }}
            onChangeText={gameID => this.setState({ gameID })}
            value={this.state.gameID}
            maxLength={10}
          />
          <Text>{"\n"}</Text>
          <TextInput
            style={{
              height: 40,
              width: 200,
              borderColor: "gray",
              textAlign: "center",
              borderWidth: 1
            }}
            keyboardType="numeric"
            placeholder="Total Overs"
            onChangeText={input => this.onChanged(input, true)}
            value={this.getTotalOvers()}
            maxLength={2} //setting limit of input
          />
          <Text>{"\n"}</Text>
          <TextInput
            style={{
              height: 40,
              width: 200,
              borderColor: "gray",
              textAlign: "center",
              borderWidth: 1
            }}
            keyboardType="numeric"
            placeholder="Starting Overs"
            onChangeText={input => this.onChanged(input, false)}
            value={this.getStartOvers()}
            maxLength={2} //setting limit of input
          />
        </View>
        <Text>{"\n"}</Text>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Button
            disabled={this.checkInputs()}
            onPress={this.onSubmit}
            title="Start"
            color="#FF8800"
          />
          <Text>{"     "}</Text>
          <Button onPress={this.onLoad} title="Load" color="#FF8800" />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
