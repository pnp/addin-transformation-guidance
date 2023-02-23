import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import styles from './UsePnPjsMinimalWebPart.module.scss';

// Define interface for each list item
export interface IListItem {
  Title?: string;
  Id: number;
}

export interface IUsePnPjsMinimalWebPartProps {
}

export default class UsePnPjsMinimalWebPart extends BaseClientSideWebPart<IUsePnPjsMinimalWebPartProps> {

  private _docs: IListItem[];

  public render(): void {
    // For each document in the list, render a <li/> HTML element
    let docsOutput = '';
    this._docs.forEach(d => { docsOutput += `<li>${d.Title}</li>`; });
    this.domElement.innerHTML = `<div class="${ styles.usePnPjsMinimal }"><ul>${docsOutput}</ul></div>`;
  }

  protected async onInit(): Promise<void> {
    // Load all the documents onInit
    this._docs = await this._getDocuments();
    return await super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // Get list items using PnPjs
  private _getDocuments = async (): Promise<IListItem[]> => {

    // Initialized PnPjs
    const sp = spfi().using(SPFx(this.context));
    const items: IListItem[] = await sp.web.lists.getByTitle('Documents').items();
    
    return items;
  }
}
