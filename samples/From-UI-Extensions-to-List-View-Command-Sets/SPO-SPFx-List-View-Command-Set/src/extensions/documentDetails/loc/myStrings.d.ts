declare interface IDocumentDetailsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'DocumentDetailsCommandSetStrings' {
  const strings: IDocumentDetailsCommandSetStrings;
  export = strings;
}
