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
import data from "../raw/data";
import { Card } from "react-native-elements";
import Dialog from "react-native-dialog";
//
export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    // var filtered = data.filter(function(el) {
    //   return el[0] != null;
    // });

    this.state = {
      gameID: "",
      dataString: null,
      open: false,
      totalOvers: 0,
      startingOvers: 0,
      games: [],
      calculationData: data,
      submit: false
    };
  }
  static navigationOptions = {
    header: null
  };

  onChanged = (input, overs) => {
    if (/^\d+$/.test(input)) {
      const value = parseInt(input);
      if (overs)
        this.setState({ totalOvers: value }, () => {
          this.checkInputs();
        });
      else {
        if (value <= this.state.totalOvers) {
          this.setState({ startingOvers: value }, () => {
            this.checkInputs();
          });
        } else {
          this.setState({ startingOvers: 0 }, () => {
            this.checkInputs();
          });
          alert("Starting Overs Cannot be Greater than Total Overs");
        }
      }
    } else if (input.length === 0) {
      if (overs) {
        this.setState({ totalOvers: 0 }, () => {
          this.checkInputs();
        });
      } else {
        this.setState({ startingOvers: 0 }, () => {
          this.checkInputs();
        });
      }
    } else {
      if (overs) {
        this.setState({ totalOvers: this.state.totalOvers }, () => {
          this.checkInputs();
        });
      } else {
        this.setState({ startingOvers: this.state.startingOvers }, () => {
          this.checkInputs();
        });
      }
    }
  };

  checkInputs = () => {
    this.setState({
      submit: !(
        this.state.gameID.length > 2 &&
        this.state.totalOvers > 10 &&
        this.state.startingOvers > 10
      )
    });
  };

  _storeData = async data => {
    const self = this;
    try {
      await AsyncStorage.setItem("GlobalData", JSON.stringify(data));
      await AsyncStorage.setItem("Inning2", JSON.stringify({ size: 0 }));
      await AsyncStorage.setItem(
        "tempGame",
        JSON.stringify({
          Inning1: {},
          Inning2: {}
        })
      );
      await AsyncStorage.setItem(
        "Inning1",
        JSON.stringify({
          missing: 0,
          R1: 100
        })
      );
      self.props.navigation.navigate("Main");
    } catch (error) {
      console.log(error);
      // Error saving data
    }
  };

  openDialog = async () => {
    let titles = await AsyncStorage.getAllKeys();
    titles = titles.filter(function(val) {
      return !(
        val === "GlobalData" ||
        val === "Inning2" ||
        val === "Inning1" ||
        val === "tempGame"
      );
    });
    this.setState({ games: titles, open: true }, () => {
      this.generateCards();
    });
  };

  handleCancel = () => {
    this.setState({ open: false, games: [], dataString: null });
  };

  onSubmit = async () => {
    let titles = await AsyncStorage.getAllKeys();
    if (titles.indexOf(this.state.gameID) > -1)
      alert(
        "This game ID is already in use, saving this match will overwrite the past file"
      );
    const data = {
      gameID: this.state.gameID,
      totalOvers: this.state.totalOvers,
      startingOvers: this.state.startingOvers,
      calculationData: this.state.calculationData
    };
    this._storeData(data);
  };

  getOvers = input => {
    if (this.state[input] && this.state[input] != 0)
      return this.state[input].toString();
    else return "";
  };

  load = async key => {
    const self = this;
    const data = JSON.parse(await AsyncStorage.getItem(key));
    try {
      await AsyncStorage.mergeItem("tempGame", JSON.stringify(data));
      self.setState({ open: false }, () => {
        self.props.navigation.navigate("Main");
      });
    } catch (error) {
      console.log(error);
      // Error saving data
    }
  };

  delete = async key => {
    await AsyncStorage.removeItem(key);
    let titles = this.state.games;
    titles.splice(titles.indexOf(key), 1);
    this.setState({ games: titles }, this.generateCards());
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
    data = this.state.games.map((game, index) => {
      return (
        <Card key={index}>
          <View style={style}>
            <Text style={{ flex: 1, flexDirection: "row" }}>
              Game ID: {game}
            </Text>

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
                  this.load(game);
                }}
                title="Load"
                color="#FF8800"
              />
              <Text>{"     "}</Text>
              <Button
                onPress={() => {
                  this.delete(game);
                }}
                title="Delete"
                color="#FF8800"
              />
            </View>
          </View>
        </Card>
      );
    });

    this.setState({ dataString: data });
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
            onChangeText={gameID =>
              this.setState({ gameID }, this.checkInputs())
            }
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
            value={this.getOvers("totalOvers")}
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
            value={this.getOvers("startingOvers")}
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
            disabled={this.state.submit}
            onPress={this.onSubmit}
            title="Start"
            color="#FF8800"
          />
          <Text>{"     "}</Text>
          <Button
            onPress={() => {
              this.openDialog();
            }}
            title="Load"
            color="#FF8800"
          />
        </View>

        <Dialog.Container visible={this.state.open}>
          <Dialog.Title>Load or Delete</Dialog.Title>
          <Dialog.Description> </Dialog.Description>

          <ScrollView>{this.state.dataString}</ScrollView>
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
        </Dialog.Container>
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
