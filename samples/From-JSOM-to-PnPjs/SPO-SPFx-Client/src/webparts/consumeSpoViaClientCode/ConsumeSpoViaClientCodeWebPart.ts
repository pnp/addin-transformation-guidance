import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './ConsumeSpoViaClientCodeWebPart.module.scss';

// Import spHttpClient
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

// Define interface for each list item
export interface IListItem {
  Title?: string;
  Id: number;
}

// Define interface for list item collection
export interface ISPListItems {
  value: IListItem[];
}

export interface IConsumeSpoViaClientCodeWebPartProps {
}

export default class ConsumeSpoViaClientCodeWebPart extends BaseClientSideWebPart<IConsumeSpoViaClientCodeWebPartProps> {

  private _docs: ISPListItems;

  public render(): void {
    // For each document in the list, render a <li/> HTML element
    let docsOutput = '';
    this._docs.value.forEach(d => { docsOutput += `<li>${d.Title}</li>`; });
    this.domElement.innerHTML = `<div class="${ styles.consumeSpoViaClientCode }"><ul>${docsOutput}</ul></div>`;
  }

  protected async onInit(): Promise<void> {
    // Load all the documents onInit
    this._docs = await this._getDocuments();
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // Get list items using spHttpClient
  private _getDocuments = async (): Promise<ISPListItems> => {
    // Get the REST response of the SharePoint REST API and return as collection of items
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + 
        `/_api/web/lists/GetByTitle('Documents')/items`, 
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
    });
  }
}
