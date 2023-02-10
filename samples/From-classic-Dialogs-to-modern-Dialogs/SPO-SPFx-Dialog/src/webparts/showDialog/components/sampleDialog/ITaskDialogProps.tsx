export interface ITaskDialogProps {
    onSave: (description: string, dueDate: Date) => Promise<void>;
    onClose: () => Promise<void>;
}