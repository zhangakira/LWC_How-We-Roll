//
import { LightningElement, wire, api, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi'

// import BOATMC from the message channel
// BOATMC という名前で BoatMessageChannel__c 使用し,アプリケーション内の至るところからディスパッチされるイベントを使用するようにコンポーネントを更新。
// message channelインポート方法：import channelName from '@salesforce/messageChannel/namespace__channelReference';
// BOATMCは任意でOK、messageChannelは__cで末尾必須。
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
//subscribe,unsubscribe
import { subscribe, APPLICATION_SCOPE, MessageContext, unsubscribe } from 'lightning/messageService';

// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
const LONGITUDE_FIELD = "Boat__c.Geolocation__Longitude__s"
// Declare the const LATITUDE_FIELD for the boat's Latitude
const LATITUDE_FIELD = "Boat__c.Geolocation__Latitude__s"
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  boatId;

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  //public
  @track error = undefined;
  @track mapMarkers = [];

  // Initialize messageContext for Message Service
  // メッセージチャンネルを Subscribe (登録) するために messageContext を wire している。
  @wire(MessageContext)
  messageContext;

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  // recordId の値が変わるたびに uiRecordApi の getRecord メソッドを使って,Geolocation__Longitude__s と Geolocation__Latitude__s 項目から値を取得
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    // Error handling
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      console.log('*** longitude : ' + longitude);
      console.log('*** latitude : ' + latitude);
      //updateMap() を用いて mapMarkers プロパティに位置を割り当て
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
  subscribeMC() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => { this.boatId = message.recordId }, //message.filedNameで取得変数の値を取得できる
        { scope: APPLICATION_SCOPE }  //APPLICATION_SCOPEレベル、activeレベルなら要らない
      );
    }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Runs when component is connected, subscribes to BoatMC
  connectedCallback() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    // ボートのrecordId を取得できるように connectedCallback() 内でイベントを Subscribe (登録) する
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
      location: {
        Latitude: Latitude,
        Longitude: Longitude
      }
    }];
  }


  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}