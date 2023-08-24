const path = require("path");
import { app } from "electron";

export const appPath = app.getAppPath();


export const asarPath =
    appPath.indexOf("app.asar") > -1
        ? appPath.substring(0, appPath.indexOf("app.asar"))
        : appPath;


const isDevelopment = process.env.NODE_ENV !== "production";

export const fileType = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "ape", "alac", "pcm",
    "aiff", "au", "mid", "midi", "ra", "amr", "ac3", "dts", "wv", "opus","mp3", "wav", "flac", "aac", "ogg",
    "wma", "m4a", "ape", "alac", "pcm", "aiff", "au", "mid", "midi", "ra", "amr", "ac3", "dts", "wv", "opus"]

 export enum TaskStatus {
    Pending = "Pending",
    InProgress = "InProgress",
    Completed = "Completed",
    Failed = "Failed",
}

export const wsTaskServe = "ws://backend-url"
