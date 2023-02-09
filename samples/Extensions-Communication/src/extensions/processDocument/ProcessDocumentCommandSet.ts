import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters,
  ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import ProcessDocumentDialog from './components/processDocumentDialog/ProcessDocumentDialog';

import { StatusBar } from '../processDocument/components/statusBar/StatusBar';
import { IStatusBarProperties } from '../processDocument/components/statusBar/IStatusBarProperties';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IProcessDocumentCommandSetProperties {
  // This is the hypothetical URL of a back-end service to invoke from the command logic 
  targetServiceUrl: string;
}

const LOG_SOURCE: string = 'ProcessDocumentCommandSet';

export default class ProcessDocumentCommandSet extends BaseListViewCommandSet<IProcessDocumentCommandSetProperties> {

  private _statusBarPlaceHolder: HTMLDivElement = null;
  
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ProcessDocumentCommandSet');

    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('PROCESS_DOCUMENT');
    compareOneCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    this._statusBarPlaceHolder = document.body.appendChild(document.createElement("div"));

    return Promise.resolve();
  }

  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    switch (event.itemId) {
      case 'PROCESS_DOCUMENT': {
        const tenantName: string = this.context.pageContext.site.absoluteUrl.substring(8,
          this.context.pageContext.site.absoluteUrl.indexOf('/', 8));
        const siteId: string = this.context.pageContext.site.id.toString();
        const webId: string = this.context.pageContext.web.id.toString();

        const spItemUrl: string = event.selectedRows[0].getValueByName(".spItemUrl");
        const driveId: string = spItemUrl.substring(spItemUrl.indexOf('drives/') + 7, spItemUrl.indexOf('items'));
        const itemId: string = spItemUrl.substring(spItemUrl.indexOf('items/') + 6, spItemUrl.indexOf('?'));

        const processDocumentDialog = new ProcessDocumentDialog(tenantName, siteId, webId, driveId, itemId, this._onStartProcess);
        await processDocumentDialog.show();

        break;
      }
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('PROCESS_DOCUMENT');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }

  private _onStartProcess = async (description: string, dueDate: Date): Promise<void> => {

    console.log('_onStartProcess');

    const element: React.ReactElement<IStatusBarProperties> = React.createElement(
      StatusBar,
      {
        title: 'Document successfully processed!',
        showMessage: true
      }
    );

    // render the UI using a React component
    ReactDom.render(element, this._statusBarPlaceHolder);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this._statusBarPlaceHolder);
  }
}
