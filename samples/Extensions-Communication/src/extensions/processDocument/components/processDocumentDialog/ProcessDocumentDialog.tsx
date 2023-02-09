import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IProcessDocumentDialogProperties } from './IProcessDocumentDialogProperties';
import { IProcessDocumentDialogState } from './IProcessDocumentDialogState';

import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
    TextField,
    DatePicker,
    DayOfWeek,
    DefaultButton,
    PrimaryButton,
    DialogFooter,
    DialogContent
} from '@fluentui/react/lib';

import { File } from '@microsoft/mgt-react/dist/es6/spfx';
import { ViewType } from '@microsoft/mgt-react';

class ProcessDocumentDialogContent extends
    React.Component<IProcessDocumentDialogProperties, IProcessDocumentDialogState> {
    
    constructor(props: IProcessDocumentDialogProperties) {
        super(props);

        this.state = {
            description: '',
            dueDate: new Date()
        };
    }
    
    public render(): JSX.Element {
        return (<div>
            <DialogContent
                title="Process Document"
                onDismiss={this.props.onClose}>

            <div>
                <div>
                    <File siteId={`${this.props.tenantName},${this.props.siteId},${this.props.webId}`}
                        driveId={this.props.driveId} itemId={this.props.itemId}
                        view={ViewType.oneline} />
                </div>
                <div>
                    <TextField label="Process description"
                        onChange={this._onDescriptionChange}
                        value={this.state.description} />
                </div>
                <div>
                    <DatePicker label="Due date"
                        firstDayOfWeek={DayOfWeek.Monday}
                        placeholder="Select a due date..."
                        ariaLabel="Select a due date"
                        onSelectDate={this._onDueDateSelected}
                        value={this.state.dueDate} />
                </div>
            </div>

            <DialogFooter>
                <DefaultButton text="Cancel"
                        title="Cancel" onClick={this.props.onClose} />
                <PrimaryButton text="Start Process"
                        title="Start Process" onClick={async () => { await this.props.onStartProcess(this.state.description, this.state.dueDate); await this.props.onClose(); }} />
            </DialogFooter>
        </DialogContent>
    </div>);
    }

    private _onDescriptionChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        this.setState({ description: newValue });
    }

    private _onDueDateSelected = (date: Date): void => {
        this.setState({ dueDate: date });
    }
}

export default class ProcessDocumentDialog extends BaseDialog {

    /**
     * Constructor for the dialog window
     */
    constructor(public tenantName: string,
        public siteId: string, public webId: string,
        public driveId: string, public itemId: string,
        public onStartProcess: (description: string, dueDate: Date) => Promise<void>) {
        super({isBlocking: true});
    }
  
    public render(): void {
        ReactDOM.render(<ProcessDocumentDialogContent
                tenantName={this.tenantName}
                siteId={this.siteId}
                webId={this.webId}
                driveId={this.driveId}
                itemId={this.itemId}
                onStartProcess={this.onStartProcess}
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