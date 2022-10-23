import { MSGraphClientV3 } from '@microsoft/sp-http';

export interface IConsumeMsGraphProps {
  msGraphClient: MSGraphClientV3;
  graphAccesToken: string;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
}
