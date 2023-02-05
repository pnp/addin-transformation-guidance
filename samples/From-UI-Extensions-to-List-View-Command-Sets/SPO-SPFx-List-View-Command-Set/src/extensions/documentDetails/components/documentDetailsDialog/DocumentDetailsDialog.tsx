import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IDocumentDetailsDialogProps } from './IDocumentDetailsDialogProps';

import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
    DefaultButton,
    DialogFooter,
    DialogContent
} from 'office-ui-fabric-react';

import { File } from '@microsoft/mgt-react/dist/es6/spfx';

class DocumentDetailsDialogContent extends
    React.Component<IDocumentDetailsDialogProps, {}> {

    public render(): JSX.Element {
        return (<div>
            <DialogContent
                title="Document Details"
                onDismiss={this.props.onClose}>

            <div>
                    <File siteId={`${this.props.tenantName},${this.props.siteId},${this.props.webId}`}
                        driveId={this.props.driveId} itemId={this.props.itemId} />
            </div>
            <DialogFooter>
                <DefaultButton text="Close"
                    title="Close" onClick={this.props.onClose} />
            </DialogFooter>
        </DialogContent>
    </div>);
    }
}

export default class DocumentDetailsDialog extends BaseDialog {

    /**
     * Constructor for the dialog window
     */
    constructor(public tenantName: string,
        public siteId: string, public webId: string,
        public driveId: string, public itemId: string) {
        super({isBlocking: true});
    }
  
    public render(): void {
        ReactDOM.render(<DocumentDetailsDialogContent
                tenantName={this.tenantName}
                siteId={this.siteId}
                webId={this.webId}
                driveId={this.driveId}
                itemId={this.itemId}
                onClose={this._close}
            />,
            this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: true
      };
    }
  
    private _close = async (): Promise<void> => {
        ReactDOM.unmountComponentAtNode(this.domElement);
        await this.close();
    }
}