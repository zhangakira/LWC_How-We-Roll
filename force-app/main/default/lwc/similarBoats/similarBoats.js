// imports
// import getSimilarBoats
import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

//似たボートは、クラス BoatDataService の getSimilarBoatsメソッドによって取得
//このメソッドは、似たボートを問い合わせるためのパラメータとして、ボートの Id (boatId) と String (similarBy) を受け取る。変更必要なし。
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';

const BOAT_OBJECT = 'Boat__c';

// 要件：似たボートのVisualforceページを Lightning に変換する(Lightning Web コンポーネントである similarBoats を作成)
// ボートを、Type (種別), Price (価格), Length (長さ) のプロパティに基づいて、似たボートを表示。
// メタデータを修正し、このフィルタのラベルに Enter the property you want to compare by を設定
// ロック解除済みパッケージに含まれている Boat_Record_Page という名前の Lightning ページで以下を修正：
// 現在のボートの位置を表示する Current Boat Location コンポーネントが右サイドバーに表示されるように修正
// similarBoats の各インスタンスは、Current Boat Location コンポーネントのすぐ下に配置されます。
//このコンポーネントは boatTile とその既存の動作も再利用しているので、必要なのは relatedBoats リストの各ボートに対してこのコンポーネントをインスタンス化することだけです。

export default class SimilarBoats extends NavigationMixin(LightningElement) {
  // Private
  currentBoat;
  relatedBoats;
  boatId;
  error;

  // public
  @api
  get recordId() {
    // returns the boatId
    return this.boatId;
  }
  set recordId(value) {
    // sets the boatId value
    this.setAttribute('boatId', value);
    // sets the boatId attribute
    this.boatId = value;
  }

  // public
  @api
  similarBy;

  // Wire custom Apex call, using the import named getSimilarBoats
  // Populates the relatedBoats list
  // Apex getSimilarBoatsメソッド呼び出しを wire し、その結果を relatedBoats プロパティに格納する
  @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
  similarBoats({ error, data }) {
    if (data) {
      this.relatedBoats = data;
      this.error = error;
    }
  }
  get getTitle() {
    return 'Similar boats by ' + this.similarBy;
  }
  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  // Navigate to record page
  // onboatselect イベントを処理し、似たボートの Id に基づいて標準の Lightning ナビゲーションを使用して、似たボートのレコードに遷移。
  openBoatDetailPage(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.detail.boatId,
        objectApiName: BOAT_OBJECT,
        actionName: "view"
      }
    });
  }
}