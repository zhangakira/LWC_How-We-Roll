// imports
import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

export default class BoatSearch extends NavigationMixin(LightningElement) {
  @track isLoading = false;

  // Handles loading event
  handleLoading(event) {
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading(event) {
    this.isLoading = false;
  }

  // Handles search boat event
  // This custom event comes from the form
  // boatSearchResults コンポーネントの searchBoats(boatTypeId) 利用
  searchBoats(event) {
    const boatTypeId = event.detail.boatTypeId;
    this.template.querySelector("c-boat-search-results").searchBoats(boatTypeId);
    this.handleDoneLoading();
  }

  createNewBoat() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
        objectApiName: 'Boat__c',
        actionName: 'new'
      }
    });
  }
}
