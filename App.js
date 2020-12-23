import React, { Component } from 'react'
import { Text, View ,StyleSheet,TouchableOpacity,Image} from 'react-native'
import BackgroundTask from 'react-native-background-task'
import OneSignal from 'react-native-onesignal';
import BackgroundTimer from 'react-native-background-timer';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-community/async-storage';
// const intervalId = BackgroundTimer.setInterval(() => {
// 	// this will be executed every 200 ms
// 	// even when app is the the background
// 	console.log('tic');
// }, 200);

function myiOSPromptCallback(permission){
  // do something with permission value

  console.log("asdasd");
  console.log(permission);
}
export default class App extends Component {


  constructor(){
    super();
      // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
    OneSignal.setLogLevel(6, 0);

    OneSignal.init("5cfd72e8-fcdf-4a01-975f-897ea339fabc", {kOSSettingsKeyAutoPrompt : false, kOSSettingsKeyInAppLaunchURL: false, kOSSettingsKeyInFocusDisplayOption:2});
    OneSignal.inFocusDisplaying(2);
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.enableVibrate(true);
    OneSignal.enableSound(true);
    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);
    this.state = {
      event: true,
    }
  }


  componentDidMount() {
    BackgroundTask.schedule({
      period: 0.1, // Aim to run every 30 mins - more conservative on battery
    })
    
    // Optional: Check if the device is blocking background tasks or not
    BackgroundTimer.stopBackgroundTimer()
    this.checkStatus()
    this.check()
  }

    onReceived(notification) {
      console.log("Notification received: ", notification);
    }
    
    onOpened(openResult) {
      console.log('Message: ', openResult.notification.payload.body);
      console.log('Data: ', openResult.notification.payload.additionalData);
      console.log('isActive: ', openResult.notification.isAppInFocus);
      console.log('openResult: ', openResult);
    }


    onIds(device) {
      console.log('Device info: ', device);
    }


    async check(){
      var remember = await AsyncStorage.getItem('Event')
      if(remember == null){
        this.setState({
          event:true
        })
        return
      }

      if(remember=="1"){
        this.setState({
          event:true
        })

      }else{
        this.setState({
          event:false
        })

      }
    }

    async Subscribe(){
      var remember = await AsyncStorage.getItem('Event')
      if(remember == null){
        OneSignal.setSubscription(false)
        await AsyncStorage.setItem(
          'Event',
          '0'
        );
        this.setState({
          event:false
        })
        return
      }

      if(remember=="1"){
        OneSignal.setSubscription(false)
        await AsyncStorage.setItem(
          'Event',
          '0'
        );
        this.setState({
          event:false
        })
      }else{
        OneSignal.setSubscription(true)
        await AsyncStorage.setItem(
          'Event',
          '1'
        );
        this.setState({
          event:true
        })
      }
    }

  async checkStatus() {
    const status = await BackgroundTask.statusAsync()
    
    if (status.available) {
      // Everything's fine
      return
    }
    
    const reason = status.unavailableReason
    if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
      Alert.alert('Denied', 'Please enable background "Background App Refresh" for this app')
    } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
      Alert.alert('Restricted', 'Background tasks are restricted on your device')
    }
  }

  render() {
    return (
     <View style={{backgroundColor:"white",alignItems:"center",justifyContent:"center",flex:1}}>
            <Image
                  
              source={{uri:"https://media.tenor.com/images/413fb64ac6e4db9d15010a77b0d5d815/tenor.png"}}
              style={{width:250,height:250,resizeMode:"contain"}}
            />
            {
              this.state.event?
                <TouchableOpacity
                      style={[styles.signIn,{backgroundColor:"red"}]}
                      onPress={()=> {this.Subscribe()}}
                  >
                        <Text style={[styles.textSign]}>Stop</Text>
                </TouchableOpacity>
              :
              <TouchableOpacity
                    style={[styles.signIn,{backgroundColor:"green"}]}
                    onPress={()=> {this.Subscribe()}}
                >
                      <Text style={[styles.textSign]}>Start</Text>
              </TouchableOpacity>
            }

      </View>
    )
  }
}


const styles = StyleSheet.create({
  signIn: {
      width: '80%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,

  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily:"Roboto",
    color:"white"
  },
});