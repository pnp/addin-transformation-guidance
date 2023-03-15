import { SPHttpClient } from '@microsoft/sp-http';

export interface IConsumeSpoClientSideProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  spHttpClient: SPHttpClient;
  webUrl: string;
}
