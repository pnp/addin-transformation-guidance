export interface IDocumentDetailsDialogProps {
    tenantName: string;
    siteId: string;
    webId: string;
    driveId: string;
    itemId: string;
    onClose: () => Promise<void>;
}