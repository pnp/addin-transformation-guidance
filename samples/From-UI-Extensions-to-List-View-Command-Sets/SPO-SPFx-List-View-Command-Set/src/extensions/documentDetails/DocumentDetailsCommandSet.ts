import { Providers, SharePointProvider } from '@microsoft/mgt-spfx';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters,
  ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import DocumentDetailsDialog from './components/documentDetailsDialog/DocumentDetailsDialog';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDocumentDetailsCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'DocumentDetailsCommandSet';

export default class DocumentDetailsCommandSet extends BaseListViewCommandSet<IDocumentDetailsCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized DocumentDetailsCommandSet');

    // Initialize MGT
    if (!Providers.globalProvider) {
      Providers.globalProvider = new SharePointProvider(this.context);
    }

    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('DOC_DETAILS');
    compareOneCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'DOC_DETAILS': {
        const tenantName: string = this.context.pageContext.site.absoluteUrl.substring(8,
          this.context.pageContext.site.absoluteUrl.indexOf('/', 8));
        const siteId: string = this.context.pageContext.site.id.toString();
        const webId: string = this.context.pageContext.web.id.toString();

        const spItemUrl: string = event.selectedRows[0].getValueByName(".spItemUrl");
        const driveId: string = spItemUrl.substring(spItemUrl.indexOf('drives/') + 7, spItemUrl.indexOf('items'));
        const itemId: string = spItemUrl.substring(spItemUrl.indexOf('items/') + 6, spItemUrl.indexOf('?'));

        this._showDocumentDetailsDialog(
          tenantName, siteId, webId,
          driveId, itemId).then((result) => { return; }).catch((e) => { return; });
        break;
      }
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('DOC_DETAILS');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // TODO: Add your logic here

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }

  private _showDocumentDetailsDialog = async (tenantName: string,
      siteId: string, webId: string,
      driveId: string, itemId: string): Promise<void> => {
    const documentsDetailsDialog = new DocumentDetailsDialog(tenantName, siteId, webId, driveId, itemId);
    await documentsDetailsDialog.show();
  }
}
