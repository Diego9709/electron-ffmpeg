export interface fileTask {
    id: string,
    cid: string,
    name: string,
    path: string,
    status: TaskStatus,
    filetype: string,
    params: any,
}

export interface taskDto {
    cid: string,
    task_id: string,
    file_name: string,
    whisper_task_params: string,
    resource_type: string,
}

export interface taskStatusDto {
    id: string,
    status: TaskStatus,
}

export enum TaskStatus {
    PENDING = "Pending",
    TRANSCODING = "Transcoding",
    SUBMITTED = "Submitted",
    ACCEPTED = "ACCEPTED",
    PROCESSING = "Processing",
    SUCCESS = "Success",
    FAILED = "Failed",

}

export function valueOfTaskStatus(status: string): TaskStatus {
    switch (status) {
        case "PENDING":
            return TaskStatus.PENDING
        case "TRANSCODING":
            return TaskStatus.TRANSCODING
        case "SUBMITTED":
            return TaskStatus.SUBMITTED
        case "ACCEPTED":
            return TaskStatus.ACCEPTED
        case "PROCESSING":
            return TaskStatus.PROCESSING
        case "SUCCESS":
            return TaskStatus.SUCCESS
        case "FAILED":
            return TaskStatus.FAILED
        default:
            return TaskStatus.PENDING
    }
}
