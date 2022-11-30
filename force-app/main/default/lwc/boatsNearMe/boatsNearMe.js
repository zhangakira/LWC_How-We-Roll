// imports										
import { LightningElement, api, wire, track } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

//ブラウザの位置情報とボート種別を使ってユーザの近くにあるボートを表示し、最大 10 艇を地図上に表示する。
export default class BoatsNearMe extends LightningElement {
    @api
    boatTypeId;
    @track
    mapMarkers = [];
    isLoading = true;
    isRendered;
    latitude;
    longitude;

    // Add the wired method from the Apex Class										
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId										
    // Handle the result and calls createMapMarkers	
    // ②ブラウザの位置情報(Longitude と Latitude)と現在選択されているボート種別を使って、BoatDataService クラスのメソッドgetBoatsByLocation()を使ってボートをロード。									
    // ユーザの位置情報がプロパティに格納されたので、BoatDataService.getBoatsByLocation() メソッドを呼び出し、座標と、ボート種別の Id を渡し。
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    // wire された getBoatsByLocation() の結果を扱うには、wiredBoatsJSON({error, data}) 関数を使用
    wiredBoatsJSON({ error, data }) {
        // 結果にデータ (data) が含まれている場合は、パラメータとして data を渡して関数 createMapMarkers() を呼び出し。
        if (data) {
            this.createMapMarkers(data);
            //エラーが発生した場合は、エラーメッセージをトーストに表示します。エラーイベントに定数ERROR_VARIANT、タイトルに定数ERROR_TITLEを使用。
        } else if (error) {
            const toast = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: ERROR_VARIANT,
            });
            this.dispatchEvent(toast);
        }
        this.isLoading = false;
    }

    // Controls the isRendered property										
    // Calls getLocationFromBrowser()	
    // マップがまだレンダリングされていない場合にのみブラウザから位置を取得するロジックを renderedCallback() に追加	
    // プロパティ isRendered を使用							
    renderedCallback() {
        if (!this.isRendered) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }

    // Gets the location from the Browser										
    // position => {latitude and longitude}		
    // ①ユーザが同意した場合、ブラウザからユーザの位置情報を取得する。	
    // ブラウザの API を利用し、getCurrentPosition() を使用して現在位置を取得し、
    // 座標をlatitudeとlongitude というプロパティにアロー表記 position => {} で保存します。							
    getLocationFromBrowser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            });
        }
    }

    // Creates the map markers	
    // ③Apexクラスの戻り値を用いて <lightning-map> のマップマーカーのリストを作成し、地図にボートを表示。
    // createMapMarkers(boatData) という名前の関数によって地図を表示する用mapMarkersプロパティ生成																				
    createMapMarkers(boatData) {
        // boatのロケーションがうまく取得できない。
        // このリストの他のマーカーは、boatData パラメータから生成する。
        // 各マーカーの title にはボート名を、マーカーにはボートの緯度と経度を指定する。
        // const newMarkers = boatData.map(boat => {...});										
        // newMarkers.unshift({...});										
        //     const newMarkers = JSON.parse(boatData).map(boat => {
        //         return {
        //             title: boat.Name,
        //             location: {
        //                 latitude: boat.Geolocation__Latitude__s,
        //                 longitude: boat.Geolocation__Longitude__s
        //             }
        //         };
        //     });
        // 地図マーカーの最初のマーカーには、現在のユーザの緯度と経度を指定。
        // title には定数 LABEL_YOU_ARE_HERE、アイコンには定数 ICON_STANDARD_USER を使用
        //     newMarkers.unshift({
        //         title: LABEL_YOU_ARE_HERE,
        //         icon: ICON_STANDARD_USER,
        //         location: {
        //             Latitude: this.latitude,
        //             Longitude: this.longitude
        //         }
        //     });
        //     this.mapMarkers = newMarkers;
        // }
        const boats = JSON.parse(boatData);

        this.mapMarkers = boats.map(boat => {
            const Latitude = boat.Geolocation__Latitude__s;
            const Longitude = boat.Geolocation__Longitude__s;
            return {
                location: { Latitude, Longitude },
                title: boat.Name,
                description: `Coords: ${Latitude}, ${Longitude}`,
                icon: 'utility:anchor'
            };
        });
        this.mapMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: 'You are here!',
            icon: 'utility:resource_territory'
        });
        this.isLoading = false;
    }
}										
