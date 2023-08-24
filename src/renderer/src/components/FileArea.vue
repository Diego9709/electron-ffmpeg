<template>
  <div class="p-2">
    <div class="app-work-buttons">
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
      <el-table tooltip-effect="dark" height="calc(100vh - 230px - 1rem)" style="width: 100%" :row-class-name="tableRowClassName" :data="fileList">
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
            <el-button v-if="row.status == 2" type="text" @click="openPath(row.outpath)"> <span class="submitted-task">任务已提交</span> ✅</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>Status</div>


  </div>
</template>

<script lang="ts" setup>

import { onMounted, ref } from "vue";
import {Brush, DocumentAdd, MagicStick} from "@element-plus/icons-vue";
import {ElNotification} from "element-plus";
import {fileTaskDto, TaskStatus} from "../tools/task";
import {generateUUID} from "../tools/tool";

const showFileDrop = ref(false);
const fileList = ref(Array<fileTaskDto>());
const isLoading = ref(false);
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
  console.log("页面启动");
  dropFile();
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
    console.log(e.dataTransfer.items);
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      let item = e.dataTransfer.items[i];
      if (item.kind === "file") {
        let filename = item.getAsFile().name;
        let ext = filename.at(filename.lastIndexOf(".") + 1);
        console.log(ext);
        dropFiles.push(item.getAsFile());
      }
    }
    let map = dropFiles.map((item, key) => ({
      id: generateUUID(),
      name: item.name.split(".")[0],
      path: item.path,
      status: TaskStatus.Pending,
      filetype: item.name.split(".")[1],
      params: null
    }));
    fileList.value.concat(map)

    console.log(fileList.value);

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
    let id = f.id;
    let name = f.name;
    let fileLoc = f.path;
    let res = await window.ipcRenderer.invoke("processAudios", fileLoc).catch((err) => {
      console.log(err);
    });

    if (res.msg) {
      console.log(res.msg);
      ElNotification({
        title: res.msg,
        message: res.path || "",
        type: "error",
      });
    }

  }
  isLoading.value = false;
}
async function OpenVideoDir() {
  let res = await window.ipcRenderer.invoke("selectVideoFiles");
  console.log(res, fileList);
  if (res.length == 0) {
    return;
  }
  function getPath(path: string) {
    let length = path.lastIndexOf("\\") + 1;

    let tem = path.substring(length, path.length);
    let fileName = tem.split(".");
    return { name: fileName[0], filetype: fileName[1] };
  }

  fileList.value = res.map((item: string, key: any) => ({
    id: generateUUID(),
    path: item,
    status: TaskStatus.Pending,
    ...getPath(item),
  }));

  console.log(fileList);
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
function changeFile(fileLIst: Array<fileTaskDto>) {
  fileList.value = fileLIst;
}

defineExpose({
  isDrop,
  init,
  removeAll,
  fileList,
  changeFile,
});
onMounted(init);
</script>

<style scoped>

.fileArea {
  background: #f5f5f5;
  border-radius: 30px !important;
}

.showFileDrops {
  background-color: cornsilk;
  box-shadow: 10px 10px 19px 10px #d0d0d0, -10px -10px 19px #fff;
}
.el-table .working-row {
  /* --el-table-tr-bg-color: #41a6ee5b; */
  background-size: 25px 25px;
  /* color: white; */
  background-image: linear-gradient(135deg, #30b1fc3a 0%, #30b1fc3a 25%, white 25%, white 50%, #30b1fc3a 50%, #30b1fc3a 75%, white 75%, white 100%);

  animation: move 0.3s linear infinite;
}
.el-table .success-row {
  --el-table-tr-bg-color: #12d06863;
}
@keyframes move {
  0% {
  }
  100% {
    background-position: 60px 0;
  }
}
</style>
