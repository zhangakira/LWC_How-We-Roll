// imports
import { LightningElement, api } from 'lwc';

//
const TILE_WRAPPER_SELECTED_CLASS = "tile-wrapper selected";
const TILE_WRAPPER_UNSELECTED_CLASS = "tile-wrapper";


export default class BoatTile extends LightningElement {
  //
  @api boat;
  @api selectedBoatId;

  // Getter for dynamically setting the background image for the picture
  // 戻り値は background-image:url() 関数を含む文字列で、Boat__c オブジェクト上の項目 Picture__c からボートの画像を表示。
  get backgroundStyle() {
    return "background-image:url('" + this.boat.Picture__c + "')";
  }

  // Getter for dynamically setting the tile class based on whether the
  // current boat is selected
  // selectedBoatId の値に応じて、関数 tileClass() を用いて tile-wrapper selected と tile-wrapper の間でクラスを変更
  get tileClass() {
    return this.selectedBoatId == this.boat.Id ? TILE_WRAPPER_SELECTED_CLASS : TILE_WRAPPER_UNSELECTED_CLASS;
  }

  // Fires event with the Id of the boat that has been selected.
  // イベント、親boatSearchResultsでイベント処理する
  // コンポーネント全体で選択されたボートに依存する
  // 正しい詳細情報を送信するために必要なロジックを selectBoat() に追加し、boat.Id を boatId に代入し、それを boatselectイベントに追加して、boatSearchResults コンポーネントがメッセージサービスを使用してイベントを伝播する
  // メッセージをpublish するため、 boatSearchResults コンポーネント内で messageContext を wire する。
  selectBoat() {
    this.selectedBoatId = !this.selectedBoatId;
    const boatselect = new CustomEvent("boatselect", {
      detail: {
        boatId: this.boat.Id
      }
    });
    this.dispatchEvent(boatselect);
  }
}