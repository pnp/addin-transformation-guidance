export interface IProcessDocumentDialogProperties {
    tenantName: string;
    siteId: string;
    webId: string;
    driveId: string;
    itemId: string;
    onStartProcess: (description: string, dueDate: Date) => Promise<void>;
    onClose: () => Promise<void>;
}
