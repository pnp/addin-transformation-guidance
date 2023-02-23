import * as React from 'react';
import styles from './UsePnPjsReact.module.scss';
import { IUsePnPjsReactProps } from './IUsePnPjsReactProps';
import { IUsePnPjsReactState } from './IUsePnPjsReactState';

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export default class UsePnPjsReact extends React.Component<IUsePnPjsReactProps, IUsePnPjsReactState> {

  constructor(props: IUsePnPjsReactProps) {
    super(props);
    
    this.state = {
      documents: []
    }
  }

  override async componentDidMount(): Promise<void> {

    const docs = await this.props.sp.web.lists.getByTitle("Documents").items<{Id: number; Title: string;}[]>();

    this.setState({
      documents: docs
    });
  }

  public render(): React.ReactElement<IUsePnPjsReactProps> {
    const {
      isDarkTheme,
      hasTeamsContext
    } = this.props;

    const {
      documents
    } = this.state;

    return (
      <section className={`${styles.usePnPjsReact} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
        </div>
        <div>
          <h3>Here are the documents!</h3>
          <ul className={styles.links}>
            { documents.map(d => <li key={d.Id}>{d.Title}</li>)}
          </ul>
        </div>
      </section>
    );
  }
}
