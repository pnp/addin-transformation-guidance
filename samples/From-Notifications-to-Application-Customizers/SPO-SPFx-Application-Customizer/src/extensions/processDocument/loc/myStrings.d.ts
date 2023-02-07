declare interface IProcessDocumentCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ProcessDocumentCommandSetStrings' {
  const strings: IProcessDocumentCommandSetStrings;
  export = strings;
}
