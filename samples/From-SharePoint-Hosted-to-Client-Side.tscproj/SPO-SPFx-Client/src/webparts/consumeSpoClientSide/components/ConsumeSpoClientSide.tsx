import * as React from 'react';
import styles from './ConsumeSpoClientSide.module.scss';
import { IConsumeSpoClientSideProps } from './IConsumeSpoClientSideProps';
import { IConsumeSpoClientSideState, IDocument } from './IConsumeSpoClientSideState';
import { escape } from '@microsoft/sp-lodash-subset';

import { SPHttpClient } from '@microsoft/sp-http';

export default class ConsumeSpoClientSide extends React.Component<IConsumeSpoClientSideProps, IConsumeSpoClientSideState> {

  constructor(props: IConsumeSpoClientSideProps) {
    super(props);
    
    this.state = {
      documents: []
    };
  }

  override async componentDidMount(): Promise<void> {
    await this._loadDocuments();
  }

  public render(): React.ReactElement<IConsumeSpoClientSideProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    const {
      documents
    } = this.state;

    return (
      <section className={`${styles.consumeSpoClientSide} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Well done, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          <div>Web part property value: <strong>{escape(description)}</strong></div>
        </div>
        <div>
          <h3>Here is the list of documents:</h3>
          <ul>
            { documents.map(d => d.Title ? <li key={d.Id}>{d.Title}</li> : null) }
          </ul>
        </div>
      </section>
    );
  }

  private _loadDocuments = async () => {
    const apiResult: { value: IDocument[] } = await this.props.spHttpClient
      .get(
        `${this.props.webUrl}/_api/web/lists/getbytitle('Documents')/items')`,
        SPHttpClient.configurations.v1
      )
      .then((response: any) => {
        return response.json();
      });

      console.log(apiResult.value);

      this.setState({
        documents: apiResult.value
      })
    }
}
