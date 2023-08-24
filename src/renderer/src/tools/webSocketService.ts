import * as SocketIOClient from 'socket.io-client';

import {wsTaskServe} from '../../../main/const'
import {fileTaskDto} from "@/tools/task";

export class WebSocketService {
    private socket: SocketIOClient.Socket;

    constructor() {
        this.socket = SocketIOClient.io(wsTaskServe);
    }

    connect() {
        this.socket.connect();
    }

    onTaskUpdate(callback: (task: fileTaskDto) => void) {
        this.socket.on("task_update", (updatedTask: fileTaskDto) => callback(updatedTask));
    }

    async queryTaskStatus(taskId: string): Promise<fileTaskDto> {
        return new Promise<fileTaskDto>((resolve, reject) => {
            this.socket.emit("query_task_status", taskId, (task: fileTaskDto) => {
                resolve(task);
            });
        })
    }

}
