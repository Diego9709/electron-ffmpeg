
import {maxParallelUpload} from "./const";
import {TaskStatus, taskStatusDto} from "./task";
import {submitTask} from "./http";
import {win} from "../main";
import {uploadFile} from "./oss";


const taskQueue = [];
const currentParallelUpload = [0]

export function addToTaskQueue(taskDetail: any) {
    console.log("add to task queue");
    taskQueue.push(taskDetail);
    processTaskQueue().then(r => {});

}

async function processTaskQueue() {
    while (taskQueue.length > 0 && currentParallelUpload[0] < maxParallelUpload) {
        let detail = JSON.parse(taskQueue.shift());
        currentParallelUpload[0]++;
        uploadFile(detail.task.cid, detail.path).then( (res) => {
            if (res) {
                submitTask(detail.task).then(() => {
                    let updatedStatus: taskStatusDto = {
                        id: detail.task.id,
                        status: TaskStatus.SUBMITTED,
                    }

                    win.webContents.send("taskStatusUpdated", JSON.stringify(updatedStatus));
                }).catch((error) => {
                    console.log(error);
                    let updatedStatus: taskStatusDto = {
                        id: detail.task.id,
                        status: TaskStatus.FAILED,
                    }
                    win.webContents.send("taskStatusUpdated", JSON.stringify(updatedStatus));
                }).finally( () => {
                    console.log("upload finished");
                    currentParallelUpload[0]--;
                })
            }
        })
    }
}
