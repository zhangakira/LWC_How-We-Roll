// imports
import { LightningElement, api } from 'lwc';
// BoatDataService Apex クラスは、getAllReviews()のメソッドでId 型の引数 boatId を受け取り、BoatReview__c のリストを返す。
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

// 要件：
// それぞれのボートには複数のレビューを登録することができます。

export default class BoatReviews extends NavigationMixin(LightningElement) {
  // Private
  boatId;
  error;
  boatReviews = [];
  isLoading = false;

  // Getter and Setter to allow for logic to run on recordId change
  // boatDetailTabs コンポーネントの Reviews タブは新しいコンポーネント boatReviews をインスタンス化し、
  // 選択したボートの Id を recordId という名前の public な setter に渡します。この setter は recordId の値を boatId に格納し、 
  // getReviews() を呼び出してレビューレコードを取得する。
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    //sets boatId attribute
    this.setAttribute('boatId', value);
    //sets boatId assignment
    this.boatId = value;
    //get reviews associated with boatId
    this.getReviews();
  }

  // Getter to determine if there are reviews to display
  // reviewsToShow() という getter を作成。
  // この getter は、boatReviews が null ではなく、undefined でもなく、少なくとも 1 つのレコードを持つ場合に true を返す。それ以外の場合は false を返す。
  get reviewsToShow() {
    return this.boatReviews && this.boatReviews.length > 0 ? true : false;
  }

  // Public method to force a refresh of the reviews invoking getReviews
  // refresh()という public な関数で getReviews() を呼び出し、レビューの一覧を更新。
  @api
  refresh() {
    refreshApex(this.getReviews());
  }

  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  // getReviews() 関数から getAllReviews()をimperative (命令的) に呼び出し、戻り値を private なプロパティ boatReviews に格納。
  getReviews() {
    if (this.boatId == null || this.boatId == '') {
      return;
    }
    this.isLoading = true;
    this.error = undefined;
    getAllReviews({ boatId: this.recordId })
      .then(result => {
        this.boatReviews = result;
        this.isLoading = false;
      })
      .catch(error => {
        this.error = error.body.message;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  // Helper method to use NavigationMixin to navigate to a given record on click
  // Lightning ナビゲーションサービスを利用してレコードに移動し、標準のユーザレコードページに遷移。
  navigateToRecord(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.target.dataset.recordId,
        actionName: "view"
      }
    });
  }
}