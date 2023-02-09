import * as React from 'react';
import { INotificationProperties } from './INotificationProperties';
import { INotificationState } from './INotificationState';

import {
    MessageBar,
    MessageBarButton,
    MessageBarType
} from '@fluentui/react/lib';

export class Notification extends
    React.Component<INotificationProperties, INotificationState> {
    
    constructor(props: INotificationProperties) {
        super(props);

        this.state = {
            showMessage: props.showMessage
        };
    }
    
    public render(): JSX.Element {

        return (<div>
            {this.state.showMessage ?
                <MessageBar
                    actions={
                        <div>
                            <MessageBarButton onClick={() => { this._showMessageBar(false); }}>Close</MessageBarButton>
                        </div>
                    }
                    messageBarType={MessageBarType.success}
                    isMultiline={false}>
                    {this.props.message}
                </MessageBar>
                : null}
        </div>);
    }

    private _showMessageBar = (show: boolean): void => {
        this.setState({ showMessage: show });
    }
}
