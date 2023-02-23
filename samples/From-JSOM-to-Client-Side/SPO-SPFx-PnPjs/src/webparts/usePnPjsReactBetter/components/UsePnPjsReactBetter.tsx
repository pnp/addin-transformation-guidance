import * as React from 'react';
import styles from './UsePnPjsReactBetter.module.scss';
import { IUsePnPjsReactBetterProps } from './IUsePnPjsReactBetterProps';
import { IUsePnPjsReactBetterState } from './IUsePnPjsReactBetterState';

import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { getSP } from '../../../pnpjsConfig';

export default class UsePnPjsReactBetter extends React.Component<IUsePnPjsReactBetterProps, IUsePnPjsReactBetterState> {

  private _sp: SPFI;

  constructor(props: IUsePnPjsReactBetterProps) {
    super(props);

    this.state = {
      documents: []
    }
    
    this._sp = getSP();
  }

  override async componentDidMount(): Promise<void> {

    const docs = await this._sp.web.lists.getByTitle("Documents").items<{Id: number; Title: string;}[]>();

    this.setState({
      documents: docs
    });
  }

  public render(): React.ReactElement<IUsePnPjsReactBetterProps> {
    const {
      isDarkTheme,
      hasTeamsContext
    } = this.props;

    const {
      documents
    } = this.state;

    return (
      <section className={`${styles.usePnPjsReactBetter} ${hasTeamsContext ? styles.teams : ''}`}>
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
