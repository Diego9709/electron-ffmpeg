import { ref, onMounted } from 'vue';
import {TaskStatus} from "../../../main/const";
import {WebSocketService} from "./webSocketService";
import {fileTaskDto} from "./task";

export class TaskQueue {
    private tasks = ref<fileTaskDto[]>([]);
    private webSocketService = new WebSocketService();

    constructor() {
        onMounted(() => {
            try {
                this.webSocketService.connect();
            } catch (e) {
                console.error(e);
            }
        });
    }

    public submitTask(task: fileTaskDto) {
        this.tasks.value.push(task);

    }

    async queryTaskStatus(taskId: string){
        try {
            const response = await this.webSocketService.queryTaskStatus(taskId);
        } catch (error) {
            console.error("error fetching task status", error)
        }
    }

    async processTasks() {

    }
}
