import { app } from "electron";

export const appPath = app.getAppPath();


export const asarPath =
    appPath.indexOf("app.asar") > -1
        ? appPath.substring(0, appPath.indexOf("app.asar"))
        : appPath;


const isDevelopment = process.env.NODE_ENV !== "production";

export const fileType = ["mp3","mp4", "wav", "flac", "aac", "ogg", "wma", "m4a", "ape", "alac", "pcm",
    "aiff", "au", "mid", "midi", "ra", "amr", "ac3", "dts", "wv", "opus","mp3", "wav", "flac", "aac", "ogg",
    "wma", "m4a", "ape", "alac", "pcm", "aiff", "au", "mid", "midi", "ra", "amr", "ac3", "dts", "wv", "opus", "mkv"]

 export enum TaskStatus {
    Pending = "Pending",
    InProgress = "InProgress",
    Completed = "Completed",
    Failed = "Failed",
}

export const wsTaskServe = "ws://trans.diego.run/api"

// export const restServer = "https://trans.diego.run/api/"
export const restServer = "https://trans.diego.run/whisper"


export let maxParallelUpload = 3;


export interface ChatMessage {

    role?: 'user' | 'system'
    text?: string

}

export interface SocketMessage {
    actionType: string
    payLoad: string
    timestamp: number
}

export interface TaskStatusMessage {
    taskId: string,
    status: TaskStatus,
    message?: string
}
