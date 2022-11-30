import { LightningElement, api } from 'lwc';
//import fivestar static resource, call it fivestar
//静的リソース fivestar をインポートして fivestar という名前で使用します。
import fivestar from '@salesforce/resourceUrl/fivestar';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

// add constants here
const ERROR_TITLE = 'Error loading five-star';
const ERROR_VARIANT = 'error';
const EDITABLE_CLASS = 'c-rating';
const READ_ONLY_CLASS = 'readonly c-rating';

//要件：
//boatAddReviewForm コンポーネントの edit (編集) モードの fiveStarRating コンポーネントを示す。
//boatReviews コンポーネントの read-only (読み取り専用) モードの fiveStarRating を示す
export default class FiveStarRating extends LightningElement {
  //initialize public readOnly and value properties
  @api readOnly;
  @api value;

  editedValue;
  isRendered;

  //getter function that returns the correct class depending on if it is readonly
  //readOnly 属性の値に応じて c-rating または readonly c-rating のいずれかを返すために三項演算子を使用。
  //それぞれをEDITABLE_CLASS と READ_ONLY_CLASS という名前の定数に格納
  get starClass() {
    return this.readOnly ? READ_ONLY_CLASS : EDITABLE_CLASS;
  }

  // Render callback to load the script once the component renders.
  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.loadScript();
    this.isRendered = true;
  }

  //Method to load the 3rd party script and initialize the rating.
  //call the initializeRating function after scripts are loaded
  //display a toast with error message if there is an error loading script
  //loadScript() 関数を使って fivestar 静的リソースから rating.css と rating.js ファイルをロードする
  loadScript() {
    Promise.all([
      loadStyle(this, fivestar + '/rating.css'),
      loadScript(this, fivestar + '/rating.js')
    ]).then(() => {
      // ロードされたら、initializeRating()という名前の関数を呼び出します。
      // この処理中にエラーが発生した場合は、toastにエラーメッセージを表示します。
      this.initializeRating();
    }).catch(error => {
      const toast = new ShowToastEvent({
        //title に Error loading five-star を指定します。この文字列を ERROR_TITLE という定数に格納。
        //エラーの種類を ERROR_VARIANT という定数に格納。
        title: ERROR_TITLE,
        message: error.message,
        variant: ERROR_VARIANT,
      });
      this.dispatchEvent(toast);
    });
  }

  //編集した評価の値を保存する
  initializeRating() {
    let domEl = this.template.querySelector('ul');
    let maxRating = 5;
    let self = this;
    let callback = function (rating) {
      self.editedValue = rating;
      //ratingChanged(rating) を呼び出し、変更を他のコンポネントに通知
      self.ratingChanged(rating);
    };
    this.ratingObj = window.rating(
      domEl,
      this.value,
      maxRating,
      callback,
      this.readOnly
    );
  }

  // Method to fire event called ratingchange with the following parameter:
  // {detail: { rating: CURRENT_RATING }}); when the user selects a rating
  //関数のロジックを完成させ、ディスパッチされるカスタムイベント名に ratingchangeを使用。
  ratingChanged(rating) {
    const ratingchangeEvent = new CustomEvent('ratingchange', {
      detail: {
        rating: rating
      }
    });
    this.dispatchEvent(ratingchangeEvent);
  }
}