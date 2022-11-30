// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
import { LightningElement, api, wire } from 'lwc';
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
//import注意
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { APPLICATION_SCOPE, MessageContext, subscribe } from 'lightning/messageService';
import BoatReviews from 'c/boatReviews';
import { NavigationMixin } from 'lightning/navigation';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

// 要件：
// ボートが選択されると、boatTile コンポーネントでのイベントboatselect を起動。
// イベントboatselectは、boatSearchResults コンポーネントによって処理され、現在選択されているボートの情報が更新される。


// 標準のレコードページに移動するために、正しい継承と必要なデコレータをプロパティに設定する
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  @api boatId;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  // detailsTabIconName() 関数は、wiredRecord にデータが含まれているかどうかをチェック。
  // 含まれている場合は icon として utility:anchor を返す。含まれていない場合は null。
  get detailsTabIconName() {
    return this.wiredRecord && this.wiredRecord.data ? 'utility:anchor' : null;
  }

  // Utilize getFieldValue to extract the boat name from the record wire
  // boatIdを用いて BOAT_FIELDS 内の項目から値を取得するために、uiRecordApi の getRecord メソッドを使用。
  // 取得した値を wiredRecord に代入。
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord;

  // wiredRecordからboatNameを抽出するには、関数 boatName() は標準関数 getFieldValue() を利用。
  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  // Private
  subscription = null;

  //このコンポーネントが他のコンポーネントから情報を受信できるようにするには、Boat のメッセージチャネルを使用。
  //メッセージチャネルを subscribe するために messageContext を wireする。
  @wire(MessageContext)
  messageContext;

  // Subscribe to the message channel
  subscribeMC() {
    if (this.subscription) {
      return;
    }
    //local boatId must receive the recordId from the message
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => {
        this.boatId = message.recordId;
      },
      { scope: APPLICATION_SCOPE }
    );
  }

  // Calls subscribeMC()
  // connectedCallback生命周期函数中进行订阅操作，订阅到boatId的值，从而 getRecord展示左侧galery选择的数据的详情信息
  connectedCallback() {
    this.subscribeMC();
  }

  // Navigates to record page
  //ボタンがクリックされたときに関数 navigateToRecordViewPage() を呼び出し, boatId の値に基づいてレコードに移動するようにすする。
  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.boatId,
        actionName: "view"
      }
    });
  }

  // Navigates back to the review list, and refreshes reviews component
  // 関数 handleReviewCreated() は、boatAddReviewForm コンポーネントから起動するカスタムイベント createreview を処理します。
  // querySelector() と activeTabValue を用いて <lightning-tabset> の Reviews タブをアクティブに設定し、boatReviews コンポーネントを動的にリフレッシュにする。
  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
  }
}