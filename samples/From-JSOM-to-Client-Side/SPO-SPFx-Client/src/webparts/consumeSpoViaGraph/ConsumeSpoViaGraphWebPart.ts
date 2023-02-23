import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './ConsumeSpoViaGraphWebPart.module.scss';

import { MSGraphClientV3 } from '@microsoft/sp-http';

// Define interface for each list item
export interface IListItem {
  name?: string;
  id: number;
}

// Define interface for list item collection
export interface ISPListItems {
  value: IListItem[];
}

export interface IConsumeSpoViaGraphWebPartProps {
}

export default class ConsumeSpoViaGraphWebPart extends BaseClientSideWebPart<IConsumeSpoViaGraphWebPartProps> {

  private _docs: ISPListItems;

  public render(): void {
    // For each document in the list, render a <li/> HTML element
    let docsOutput = '';
    this._docs.value.forEach(d => { docsOutput += `<li>${d.name}</li>`; });
    this.domElement.innerHTML = `<div class="${ styles.consumeSpoViaGraph }"><ul>${docsOutput}</ul></div>`;
  }

  protected async onInit(): Promise<void> {
    // Load all the documents onInit
    this._docs = await this._getDocuments();
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // Get list items using MSGraphClientV3
  private _getDocuments = async (): Promise<ISPListItems> => {
    // Get the REST response of the SharePoint REST API and return as collection of items
    const graphClient: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient("3");
    return graphClient.api(`/sites/${this.context.pageContext.site.id}/drive/root/children`)
      .version('v1.0')
      .get();
  }
}
