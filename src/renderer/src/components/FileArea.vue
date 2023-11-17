<template >
  <div class="p-2" style="height: 90px"
  >
    <div>
      <el-button
          v-for="(item, i) in workList"
          :key="i"
          class="app-work-button"
          :plain="true"
          @click="item.work">
        {{ item.name }}
      </el-button>


    </div>

    <div :class="['file-area', { 'show-file-drops': showFileDrop }]">
      <!-- 表格 -->
      <el-table tooltip-effect="dark" height="calc(100vh - 230px - 1rem)" style="width: 100%" :row-class-name="tableRowClassName"
                :data="fileList"
                @row-click="handleRowClick"
      >
        <template #empty>
          <p class="empty-message">请将文件拖拽到此处</p>
        </template>
        <el-table-column type="index" width="80px" label="编号" align="center"> </el-table-column>

        <el-table-column show-overflow-tooltip prop="name" label="文件名称"> </el-table-column>
        <el-table-column label="类型" width="120px" prop="filetype" align="center"> </el-table-column>

        <el-table-column label="操作" width="180px">
          <template #default="{ row, $index }">
            <el-button type="text" @click="openPath(row.path)"> ▶️ </el-button>
            <el-button type="text" @click="lookUp(row.id)"> 📄 </el-button>
            <el-button type="text" @click="download(row.id)"> ⬇️ </el-button>
            <el-popconfirm @confirm="deleteFile($index)" title="确定要删除此项吗?" icon="el-icon-question">
              <template #reference>
                <el-button type="text" class="delete-button">🗑️</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>

        <el-table-column prop="status" align="center" width="200px" label="状态">
          <template #default="{ row }">
            <el-button v-if="row.status == TaskStatus.PENDING" type="text"> <span class="pending-task">等待中</span> 🔜</el-button>
            <el-button v-if="row.status == TaskStatus.TRANSCODING" type="text"> <span class="transcoding-task">转码中</span> 🥰</el-button>
            <el-button v-if="row.status == TaskStatus.SUBMITTED" type="text"> <span class="submitted-task">已提交</span>❤️</el-button>
            <el-button v-if="row.status == TaskStatus.ACCEPTED" type="text"> <span class="uploading-task">已接受</span>🤞</el-button>
            <el-button v-if="row.status == TaskStatus.PROCESSING" type="text"> <span class="uploading-task">识别中</span>🚀</el-button>
            <el-button v-if="row.status == TaskStatus.SUCCESS" type="text"> <span class="success-task">成功</span>✌️ </el-button>
            <el-button v-if="row.status == TaskStatus.FAILED" type="text"> <span class="failed-task">失败</span> 😱</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <div style="height: 10%">
      <ParamsArea @params-change="handleParamsChange"></ParamsArea>
    </div>

  </div>
</template>

<script setup lang="ts">

import {onMounted, ref, toRefs} from "vue";
import {Brush, DocumentAdd, MagicStick} from "@element-plus/icons-vue";
import {ElNotification} from "element-plus";
import {fileTask, TaskStatus, taskStatusDto, valueOfTaskStatus} from "../../../common/task";
import {generateUUID} from "../tools/tool";
import ParamsArea from "./ParamsArea.vue";
import {TaskStatusMessage} from "../../../common/const";
import {eventBus} from "../../../common/eventBus";

const showFileDrop = ref(false);
const isServerOnline = ref(false);
const fileList = ref(Array<fileTask>());
const paramsMap = ref({
  model: 'medium',
  temperature: 0.0,
  initial_prompt: '',
});
const isLoading = ref(false);
const props = defineProps({
  cid: {
    type: String,
    default: "",
  },
})


const {cid} = toRefs(props)

const workList = [
  {
    name: "添加文件",
    work: OpenVideoDir,
    icon: DocumentAdd,
    type: "",
  },
  {
    name: "清空文件",
    work: removeAll,
    icon: Brush,
    type: "",
  },
  {
    name: "开始转换",
    work: begin,
    icon: MagicStick,
    type: "",
  },
];


function init() {
  dropFile();
  eventBus.on('REMOTE_STATUS_UPDATE', (statusMessage: TaskStatusMessage) => {
    handleRemoteStatusUpdate(statusMessage);
  })
}

function openPath(path: string) {
  window.shell.openPath(path)
}

function tableRowClassName({ row }) {
  if (row.status === 1) {
    return "working-row";
  } else if (row.status === 2) {
    return "success-row";
  }
  return "";
}

window.ipcRenderer.on('taskStatusUpdated', (event, updatedTask:string) => {
  let task: taskStatusDto = JSON.parse(updatedTask)
  const index = fileList.value.findIndex(t => t.id === task.id);
  if (index !== -1) {
    fileList.value[index].status = task.status;
  }
});


  //   拖动文件
function dropFile() {
  window.addEventListener(
      "dragenter",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        showFileDrop.value = true;
      },
      false
  );
  window.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showFileDrop.value = false;
    if (!e.dataTransfer) {
      return;
    }
    const dropFiles = [];

    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      let item = e.dataTransfer.items[i];
      if (item.kind === "file") {
        let filename = item.getAsFile().name;
        let ext = filename.at(filename.lastIndexOf(".") + 1);
        dropFiles.push(item.getAsFile());
      }
    }

    let mapList = dropFiles.map((item, key) => ({
      id: generateUUID().replace(/-/g, ""),
      cid: cid.value,
      name: item.name.split(".")[0],
      path: item.path,
      status: TaskStatus.PENDING,
      filetype: item.name.split(".")[1],
      params: JSON.stringify(paramsMap.value),
    }));
    fileList.value.concat(mapList)



    // 设置编码格式
  });
    window.addEventListener(
      "dragover",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false
    );
  }

async function begin() {

  isLoading.value = true;
  for (let index = 0; index < fileList.value.length; index++) {
    let f = fileList.value[index];
    let encodeParams = {
      id: f.id,
      path: f.path,
      name: f.name
    }
    let result: string
    fileList.value[index].status = TaskStatus.TRANSCODING;
    fileList.value[index].params = JSON.stringify(paramsMap.value);
    await window.ipcRenderer.invoke("processAudios",encodeParams)
        .then(
            // change status
            (res) => {
              result = res
            }
        ).catch((err) => {
          fileList.value[index].status = TaskStatus.FAILED
          ElNotification({
          title: "FFMPEG转码失败: " + f.path || "",
          message: err.message,
          type: "error",
      });
    });
  isLoading.value = false;
  let taskDetails = {
    path: result,
    task: f
  }
  window.ipcRenderer.invoke("uploadAudio", JSON.stringify(taskDetails)).then(
      (res) => {

      }
  ).catch((err) => {
    ElNotification({
      title: "上传文件失败: " + f.path || "",
      message: err.message,
      type: "error",
    });
  });
  }
}
async function OpenVideoDir() {
  let res = await window.ipcRenderer.invoke("selectVideoFiles");
  if (res.length == 0) {
    return;
  }
  function getPath(path: string) {
    let length = path.lastIndexOf("\\") + 1;

    let tem = path.substring(length, path.length);
    let fileName = tem.split(".");
    let file = fileName.slice(0, -1).join(".")
    return { name: file, filetype: fileName[-1] };
  }

  fileList.value = res.map((item: string, key: any) => ({
    id: generateUUID().replace(/-/g, ""),
    cid: cid.value,
    path: item,
    status: TaskStatus.PENDING,
    params: JSON.stringify(paramsMap.value),
    ...getPath(item),
  }));

  emitTaskId(fileList.value[0].id)

}
function isDrop() {
  showFileDrop.value = !showFileDrop.value;
}
function deleteFile(index: number) {
  fileList.value.splice(index, 1);
}

function lookUp(index: number) {

}

function download(index: number) {

}
function removeAll() {
  fileList.value = [];
}
function changeFile(fileLIst: Array<fileTask>) {
  fileList.value = fileLIst;
}

function handleParamsChange(params: any) {
  paramsMap.value = params;
  console.log("params", params);
}

function handleRowClick(row: any) {
  emitTaskId(row.id)
}

function emitTaskId(tid: string) {
  eventBus.emit('TASK_MESSAGE_SHOW', tid)
}

function handleRemoteStatusUpdate(statusMessage: TaskStatusMessage) {
  const index = fileList.value.findIndex(t => t.id === statusMessage.taskId);
  if (index !== -1) {
    fileList.value[index].status = valueOfTaskStatus(statusMessage.status);
  }
}

onMounted(init);

</script>

<style scoped>


</style>
