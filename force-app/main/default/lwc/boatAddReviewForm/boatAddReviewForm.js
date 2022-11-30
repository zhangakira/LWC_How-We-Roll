// imports
import { LightningElement, api, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Name_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';
import RATING_FIELD from '@salesforce/schema/BoatReview__c.Rating__c';
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import BOAT_FIELD from '@salesforce/schema/BoatReview__c.Boat__c';

const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';


//要件：
//Submit ボタンをクリックすると、次のアクションが実行される：										
//BoatReview__c に新しいレコードを作成。(Lightning データサービスを使用)										
//送信が成功したことを示すトーストメッセージを表示。										
//タブを Reviews に切り替え、選択したボートのレビューのリストを表示 (boatReviews コンポーネント) 。										

export default class BoatAddReviewForm extends LightningElement {
  @api boat;
  // Private
  boatId;
  //デフォルト0
  rating = 0;
  nameField = Name_FIELD;
  commnetField = COMMENT_FIELD;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  review = '';
  title = '';
  comment = '';

  // Public Getter and Setter to allow for logic to run on recordId change
  // boatDetailTabs コンポーネントの Add Review タブは、新しいコンポーネント boatAddReviewForm をインスタンス化する、
  // 選択したボートの Id を recordId という名前の public な setter に渡す。
  // この setter は recordId の値を boatId に格納。
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    //sets boatId attribute
    //sets boatId assignment
    this.boatId = value;
  }

  // Gets user rating input from stars component
  // handleRatingChanged() 関数で　評価が更新されるたびに private なプロパティ rating を更新。
  handleRatingChanged(event) {
    this.rating = event.detail.rating;
  }

  // Custom submission handler to properly set Rating
  // This function must prevent the anchor element from navigating to a URL.
  // form to be submitted: lightning-record-edit-form
  // Lightning データサービスを利用して BoatReview__c レコードを作成
  //レコードが挿入のために送信されると、関数 handleSubmit() はデータベースにレコードを挿入する前に Boat__c と Rating__c 項目の値を埋めます。
  handleSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }

  // Shows a toast message once form is submitted successfully
  // Dispatches event when a review is created
  // レビューが正常に保存されると、イベント createreview が boatDetailTabs の親コンポーネントに送信。
  // 親コンポーネントはイベントをリスンして handleReviewCreated() という関数を呼び出し、Reviews タブを現在選択されているタブに設定します。(タブのフォーカスを Reviews タブに変更する)
  // フォームがレコードの挿入に成功した後、関数 handleSuccess() を呼び出し、成功のトーストメッセージを表示して createreview イベントを起動します。
  // handleSuccess() を使って、 title に Review Created! を用いた成功のトーストメッセージを表示。
  // タイトル文字列を TOAST_TITLE という定数に格納し、variant 文字列を TOAST_SUCCESS_VARIANT という定数に格納
  handleSuccess() {
    // TODO: dispatch the custom event and show the success message
    const evt = new ShowToastEvent({
      title: SUCCESS_TITLE,
      variant: SUCCESS_VARIANT
    });
    this.dispatchEvent(evt);
    this.dispatchEvent(new CustomEvent('createreview'));
    //handleReset() 関数を呼び出し、フォームのデータをクリア。
    this.handleReset();
  }

  // Clears form data upon submission
  // TODO: it must reset each lightning-input-field
  handleReset() {
    const inputFields = this.template.querySelectorAll(
      'lightning-input-field'
    );
    if (inputFields) {
      inputFields.forEach(field => {
        field.reset();
      });
    }
  }
}