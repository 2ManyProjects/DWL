import React from "react";
import {
  SafeAreaView,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Picker,
  Text,
  Button,
  TextInput,
  Switch,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { AsyncStorage } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import data from "../raw/data";
import { Card } from "react-native-elements";
import Dialog from "react-native-dialog";
import Settings from "../components/Settings";
import { Dropdown } from "react-native-material-dropdown";
import ModalDropdown from "react-native-modal-dropdown";
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
      openSettings: false,
      open: false,
      totalOvers: 50,
      startingOvers: 50,
      games: [],
      calculationData: data,
      submit: true,
      showTutorial: false,
      gameRule: [
        { Overs: 15, G: 90, minOvers: 3, id: 0 },
        { Overs: 20, G: 120, minOvers: 5, id: 1 },
        { Overs: 25, G: 150, minOvers: 7, id: 2 },
        { Overs: 50, G: 200, minOvers: 20, id: 3 }
      ],
      selectedRule: { Overs: 15, G: 90, minOvers: 3, id: 0 },
      gameRuleStr: ""
    };
    this.init();
  }
  static navigationOptions = {
    header: null
  };

  init = async () => {
    const self = this;
    try {
      let settings = await AsyncStorage.getItem("Settings");
      const def = [
        { Overs: 15, G: 90, minOvers: 3, id: 0 },
        { Overs: 20, G: 120, minOvers: 5, id: 1 },
        { Overs: 25, G: 150, minOvers: 7, id: 2 },
        { Overs: 50, G: 200, minOvers: 20, id: 3 }
      ];

      if (settings !== null) {
        this.setState(
          {
            gameRule: JSON.parse(settings),
            selectedRule: JSON.parse(settings)[0],
            totalOvers: JSON.parse(settings)[0].Overs,
            startingOvers: JSON.parse(settings)[0].Overs
          },
          () => {}
        );
      } else {
        this.setState(
          {
            gameRule: def,
            selectedRule: { Overs: 15, G: 90, minOvers: 3, id: 0 },
            totalOvers: 15,
            startingOvers: 15
          },
          () => {}
        );
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  onChanged = input => {
    if (/^\d+$/.test(input)) {
      const value = parseInt(input);
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
    } else if (input.length === 0) {
      this.setState({ startingOvers: 0 }, () => {
        this.checkInputs();
      });
    } else {
      this.setState({ startingOvers: this.state.startingOvers }, () => {
        this.checkInputs();
      });
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
        val === "tempGame" ||
        val === "Settings"
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
    if (titles.indexOf(this.state.gameID) > -1) {
      Alert.alert(
        "Setup Message",
        "This game ID is already in use, saving this match will overwrite the past file",
        [
          {
            text: "OK",
            onPress: () => {
              const data = {
                gameID: this.state.gameID,
                totalOvers: this.state.selectedRule.Overs,
                startingOvers: this.state.startingOvers,
                calculationData: this.state.calculationData,
                gameRule: this.state.selectedRule,
                showTutorial: this.state.showTutorial
              };
              this._storeData(data);
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
      // alert(
      //   "This game ID is already in use, saving this match will overwrite the past file"
      // );
    } else {
      const data = {
        gameID: this.state.gameID,
        totalOvers: this.state.selectedRule.Overs,
        startingOvers: this.state.startingOvers,
        calculationData: this.state.calculationData,
        gameRule: this.state.selectedRule
      };
      this._storeData(data);
    }
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

  getOptions = () => {
    let temp = [];
    for (const [index, value] of this.state.gameRule.entries()) {
      temp.push(
        "Overs: " + value.Overs + ", Min: " + value.minOvers + ", G: " + value.G
      );
    }
    return temp;
  };

  showTutorial = value => {
    this.setState({ showTutorial: value });
  };

  render() {
    return (
      <ScrollView //change to view and re-allign
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text>{"\n"}</Text>
        <Text>{"\n"}</Text>
        <Text>{"\n"}</Text>
        <View>
          <ModalDropdown
            options={this.getOptions()}
            defaultValue={
              "Overs: " +
              this.state.selectedRule.Overs +
              ", Min: " +
              this.state.selectedRule.minOvers +
              ", G: " +
              this.state.selectedRule.G
            }
            style={{
              width: 200,
              height: 30,
              alignSelf: "center",
              borderBottomWidth: 1,
              borderBottomColor: "gray"
            }}
            textStyle={{
              fontSize: 18,
              color: "black",
              textAlign: "center",
              textAlignVertical: "center"
            }}
            dropdownStyle={{
              width: 200,
              borderColor: "gray",
              borderWidth: 2,
              borderRadius: 3
            }}
            dropdownTextStyle={{
              fontSize: 16,
              color: "gray",
              textAlign: "center",
              textAlignVertical: "center"
            }}
            onSelect={(index, value) =>
              this.setState(
                {
                  selectedRule: this.state.gameRule[index],
                  totalOvers: this.state.gameRule[index].Overs,
                  startingOvers: this.state.gameRule[index].Overs
                },
                () => {
                  console.log("SELECTED ", this.state.selectedRule);
                }
              )
            }
          />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
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
            placeholder="Starting Overs"
            onChangeText={input => this.onChanged(input)}
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
            onPress={() => {
              this.setState({ openSettings: !this.state.openSettings });
            }}
            title="Settings"
            color="#FF8800"
          />
          <Settings
            open={this.state.openSettings}
            saved={this.init}
            close={() => {
              this.setState({ openSettings: false });
            }}
          />
        </View>
        <Text>{"\n"}</Text>
        <View
          style={{
            flex: 1,
            alignItems: "center"
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "black",
              textAlign: "center",
              textAlignVertical: "center"
            }}
          >
            Show Tutorial
          </Text>
          <Switch
            onValueChange={this.showTutorial}
            value={this.state.showTutorial}
          />
        </View>
        <Dialog.Container visible={this.state.open}>
          <Dialog.Title>Load or Delete</Dialog.Title>
          <Dialog.Description> </Dialog.Description>

          <ScrollView>
            {this.state.dataString}
            <Dialog.Button label="Cancel" onPress={this.handleCancel} />
            <View style={{ paddingBottom: 100 }} />
          </ScrollView>
        </Dialog.Container>

        {this.state.showTutorial && (
          // <View
          // style={{
          //   width: 32,
          //   hieght: 32
          // }}>
          <TouchableOpacity>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                marginBottom: 36
              }}
            >
              <Icon
                onPress={() => {
                  alert("TUTORIAL POPUP");
                }}
                style={{ backgroundColor: this._color, paddingLeft: 0 }}
                size={30}
                color="#FF8800"
                name="questioncircle"
                type="antdesign"
              />
            </View>
          </TouchableOpacity>
          /* </View> */
        )}
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
