export interface fileTaskDto {
    id: string,
    name: string,
    path: string,
    status: TaskStatus,
    filetype: string,
    params: string,
}

export enum TaskStatus {
    Pending = "Pending",
    Transcoding = "Transcoding",
    Submitting = "Submitting",
    InProgress = "InProgress",
    Completed = "Completed",
    Failed = "Failed",
}
