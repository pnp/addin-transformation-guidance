import * as React from 'react';
import styles from './ConsumeMsGraph.module.scss';
import { IConsumeMsGraphProps } from './IConsumeMsGraphProps';
import { IConsumeMsGraphState } from './IConsumeMsGraphState';
import { escape } from '@microsoft/sp-lodash-subset';

import { PrimaryButton } from 'office-ui-fabric-react';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

export default class ConsumeMsGraph extends React.Component<IConsumeMsGraphProps, IConsumeMsGraphState> {

  public constructor(props: IConsumeMsGraphProps) {
    super(props);
    
    this.state = {
      userPrincipalName: null
    };
  }

  public async componentDidMount(): Promise<void> {
    await this._loadGraphData();
  }

  private _loadGraphData = async (): Promise<void> => {
    if (this.props.msGraphClient) {
      const me: MicrosoftGraph.User = await this.props.msGraphClient.api('/me').get();
      this.setState({
        userPrincipalName: me.userPrincipalName
      })
    }
  }

  public render(): React.ReactElement<IConsumeMsGraphProps> {
    const {
      userPrincipalName
    } = this.state;

    const {
      isDarkTheme,
      hasTeamsContext
    } = this.props;

    return (
      <section className={`${styles.consumeMsGraph} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Your UPN from Microsoft Graph is: {escape(userPrincipalName)}!</h2>
          <div>
            <PrimaryButton text="Look inside the Access Token for Microsoft Graph" onClick={this._inspectToken} />
          </div>
        </div>
      </section>
    );
  }

  private _inspectToken = (): void => {
    window.open(`https://jwt.ms#access_token=${this.props.graphAccesToken}`, '_blank');
  }
}
