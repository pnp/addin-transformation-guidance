declare interface IListDocumentsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  SearchFilterFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
}

declare module 'ListDocumentsWebPartStrings' {
  const strings: IListDocumentsWebPartStrings;
  export = strings;
}
