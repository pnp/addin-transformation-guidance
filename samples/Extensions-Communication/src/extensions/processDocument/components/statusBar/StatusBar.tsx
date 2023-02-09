import * as React from 'react';
import { IStatusBarProperties } from './IStatusBarProperties';
import { IStatusBarState } from './IStatusBarState';

import {
    MessageBar,
    MessageBarButton,
    MessageBarType
} from '@fluentui/react/lib';

export class StatusBar extends
    React.Component<IStatusBarProperties, IStatusBarState> {
    
    constructor(props: IStatusBarProperties) {
        super(props);

        this.state = {
            showMessage: props.showMessage
        };
    }
    
    public render(): JSX.Element {

        console.log('StatusBar.render');

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
                    {this.props.title}
                </MessageBar>
                : null}
        </div>);
    }

    private _showMessageBar = (show: boolean): void => {
        this.setState({ showMessage: show });
    }
}
