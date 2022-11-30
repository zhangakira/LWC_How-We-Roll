import { LightningElement, wire, api, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
// レコードを取得・更新できるように uiRecordApi を使用
import { updateRecord } from 'lightning/uiRecordApi';
// トースト通知で重要なメッセージを表示。
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// レコード操作が発生した後、そのコンポーネントや他のコンポーネントをリフレッシュ。
import { refreshApex } from '@salesforce/apex';

import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
// 書き方注意、MessageContextを使うことでscopeを有効になる。
import { publish, MessageContext } from 'lightning/messageService';

import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId = '';
  columns = [
    { label: 'Name', fieldName: 'Name', type: 'text', editable: 'true' },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: 'true' },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: 'true' },
    { label: 'Description', fieldName: 'Description__c', type: 'text', editable: 'true' }
  ];
  boatTypeId = '';
  @track
  draftValues = [];
  @track
  boats;
  isLoading = false;
  error = undefined;
  wiredBoatsResult;

  // wired message context
  // messageContext　大文字、小文字要注意
  @wire(MessageContext)
  messageContext;

  // wired getBoats method
  // getBoats() で返されたデータを取得し、検索結果を wiredBoats() を通じて boats に格納。
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    this.boats = result;
    if (result.error) {
      this.error = result.error;
      this.boats = undefined;
    }
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  // boatSearch コンポーネント内の searchBoats(event)を利用して検索する
  // searchBoats(boatTypeId) に boatTypeId の値を渡し、getBoats() で利用できるようにする。
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // this function must update selectedBoatId and call sendMessageService
  // updateSelectedTile() を用いて、現在選択されているボートの Id に関する情報をイベントに基づいて更新。
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  // publishする
  sendMessageService(boatId) {
    // explicitly pass boatId to the parameter recordId
    publish(this.messageContext, BoatMC, { recordId: boatId });
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  // handleSave() を使用して、uiRecordApi から updateRecord を使用してすべてのレコードを保存します。
  // 変更が正しく保存されると、データテーブルが非同期でリフレッシュされ、成功のトースト通知が表示する。(title/message)
  // エラーが発生した場合には、エラーをキャッチして、イベントタイトルとして Error を使用して、エラーメッセージをトースト通知で表示
  // うまくできず問題ありそうです????
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({ data: updatedFields })
      //   .then(() => { })
      //   .catch(error => { })
      //   .finally(() => { });


      // const recordInputs = event.detail.draftValues.slice().map(draft => {
      //   const fields = Object.assign({}, draft);
      //   return { fields };
      // });
      // console.log(recordInputs);
      // const promises = recordInputs.map(recordInput => updateRecord(recordInput));
      // Promise.all(promises)
      .then(res => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
          })
        );
        this.draftValues = [];
        // 正しく保存されたら、関数 refresh() を呼び出し
        return this.refresh();
      }).catch(error => {
        this.error = error;
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: CONST_ERROR,
            variant: ERROR_VARIANT
          })
        );
        this.notifyLoading(false);
      }).finally(() => {
        this.draftValues = [];
      });
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
    } else {
      this.dispatchEvent(CustomEvent('doneloading'));
    }
  }
}
