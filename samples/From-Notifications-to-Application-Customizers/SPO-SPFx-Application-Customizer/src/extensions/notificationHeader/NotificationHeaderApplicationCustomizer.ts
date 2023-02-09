import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'NotificationHeaderApplicationCustomizerStrings';

import { Notification } from './components/notification/Notification';
import { INotificationProperties } from './components/notification/INotificationProperties';

const LOG_SOURCE: string = 'NotificationHeaderApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface INotificationHeaderApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class NotificationHeaderApplicationCustomizer
  extends BaseApplicationCustomizer<INotificationHeaderApplicationCustomizerProperties> {
  
  private _topPlaceholder?: PlaceholderContent;
  
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // call render method for generating the needed html elements
    return (await this._renderPlaceHolders());
  }

  private async _renderPlaceHolders(): Promise<void> {

    // check if the application customizer has already been rendered
    if (!this._topPlaceholder) {
      // create a DOM element in the bottom placeholder for the application customizer to render
      this._topPlaceholder = this.context.placeholderProvider
        .tryCreateContent(PlaceholderName.Top, { onDispose: this._handleDispose });
    }

    // if the top placeholder is not available, there is no place in the UI
    // for the app customizer to render, so quit.
    if (!this._topPlaceholder) {
      return;
    }

    const element: React.ReactElement<INotificationProperties> = React.createElement(
      Notification,
      {
        message: 'Successfully processed your request!',
        showMessage: true
      }
    );

    // render the UI using a React component
    ReactDom.render(element, this._topPlaceholder.domElement);
  }

  private _handleDispose(): void {
    ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    console.log('[NotificationHeaderApplicationCustomizer._onDispose] Disposed custom bottom placeholder.');
  }
}
