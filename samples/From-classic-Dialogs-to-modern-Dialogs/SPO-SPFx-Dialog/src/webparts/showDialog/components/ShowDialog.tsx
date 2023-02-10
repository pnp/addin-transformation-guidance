import * as React from 'react';
import styles from './ShowDialog.module.scss';
import { IShowDialogProps } from './IShowDialogProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { PrimaryButton } from '@fluentui/react/lib';

import TaskDialog from './sampleDialog/TaskDialog';

export default class ShowDialog extends React.Component<IShowDialogProps, {}> {
  public render(): React.ReactElement<IShowDialogProps> {
    const {
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.showDialog} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Well done, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
        </div>
        <div style={{textAlign: 'center', marginTop: '10px'}}>
          <PrimaryButton text='Create Task' onClick={this._createTask} />
        </div>
      </section>
    );
  }

  private _createTask = async (): Promise<void> => {
    const taskDialog = new TaskDialog(
      async (description, dueDate) => {
        alert(`You asked to create the task '${description}' with due date on: ${dueDate}`); },
      async () => alert('You closed the dialog!')
    );
    
    await taskDialog.show();
  }
}
