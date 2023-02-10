import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ITaskDialogProps } from './ITaskDialogProps';
import { ITaskDialogState } from './ITaskDialogState';

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

class TaskDialogContent extends
    React.Component<ITaskDialogProps, ITaskDialogState> {
    
    constructor(props: ITaskDialogProps) {
        super(props);

        this.state = {
            description: '',
            dueDate: new Date()
        };
    }
    
    public render(): JSX.Element {
        return (<div>
            <DialogContent
                title="Create Task"
                onDismiss={this.props.onClose}>

            <div>
                <div>
                    <TextField label="Task description"
                        onChange={this._onDescriptionChange}
                        value={this.state.description} />
                </div>
                <div>
                    <DatePicker label="Task due date"
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
                <PrimaryButton text="Create Task"
                        title="Create Task" onClick={async () => { await this.props.onSave(this.state.description, this.state.dueDate); }} />
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

export default class TaskDialog extends BaseDialog {

    /**
     * Constructor for the dialog window
     */
    constructor(
        public onSave: (description: string, dueDate: Date) => Promise<void>,
        public onClose: () => Promise<void>) {
        super({isBlocking: true});
    }
  
    public render(): void {
        ReactDOM.render(<TaskDialogContent
                onSave={this._save}
                onClose={this._close}
            />,
            this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: true
      };
    }

    protected onAfterClose(): void {
        ReactDOM.unmountComponentAtNode(this.domElement);
    }

    private _save = async (description: string, dueDate: Date): Promise<void> => {
        await this.close();
        await this.onSave(description, dueDate);
    }
  
    private _close = async (): Promise<void> => {
        await this.close();
        await this.onClose();
    }
}