import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ConsumeMsGraphWebPartStrings';
import ConsumeMsGraph from './components/ConsumeMsGraph';
import { IConsumeMsGraphProps } from './components/IConsumeMsGraphProps';

import { MSGraphClientV3, AadTokenProvider } from '@microsoft/sp-http';

export interface IConsumeMsGraphWebPartProps {
  description: string;
}

export default class ConsumeMsGraphWebPart extends BaseClientSideWebPart<IConsumeMsGraphWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _msGraphClient: MSGraphClientV3 ;
  private _graphAccesToken: string;

  protected async onInit(): Promise<void> {

    // Get the client for Microsoft Graph
    this._msGraphClient = await this.context.msGraphClientFactory.getClient('3');

    // Get the Access Token for Microsoft Graph
    const tokenProvider: AadTokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider();
    this._graphAccesToken = await tokenProvider.getToken("https://graph.microsoft.com");
    
    return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<IConsumeMsGraphProps> = React.createElement(
      ConsumeMsGraph,
      {
        msGraphClient: this._msGraphClient,
        graphAccesToken: this._graphAccesToken,
        isDarkTheme: this._isDarkTheme,
        hasTeamsContext: !!this.context.sdks.microsoftTeams
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
