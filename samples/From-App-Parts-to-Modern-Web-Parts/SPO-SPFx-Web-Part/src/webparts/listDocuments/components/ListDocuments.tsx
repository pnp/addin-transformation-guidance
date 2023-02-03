import * as React from 'react';
import styles from './ListDocuments.module.scss';
import { IListDocumentsProps } from './IListDocumentsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { FileList } from '@microsoft/mgt-react/dist/es6/spfx';

export default class ListDocuments extends React.Component<IListDocumentsProps, {}> {
  public render(): React.ReactElement<IListDocumentsProps> {
    const {
      searchFilter,
      tenantName,
      siteId,
      webId,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    // If we have a value for searchFilter, let's use it, otherwise get the whole list of files
    const fileListQuery: string = searchFilter ?
      `/sites/${tenantName},${siteId},${webId}/drive/root/search(q='${escape(searchFilter)}')` :
      `/sites/${tenantName},${siteId},${webId}/drive/root/children`;

    return (
      <section className={`${styles.listDocuments} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Well done, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          <div>Current search filter: <strong>{escape(searchFilter)}</strong></div>
        </div>
        <div>
          <FileList fileListQuery={fileListQuery} />
        </div>
      </section>
    );
  }
}
