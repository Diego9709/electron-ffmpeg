<template>
  <div class="idea-light-app">
    <el-container class="container">
      <el-header class="idea-light-header">
        <div class="idea-light-header-content">
          <div class="idea-light-work-buttons">
            <el-button
                v-for="(item, i) in workList"
                :key="i"
                class="idea-light-work-button"
                :plain="true"
                @click="item.work"
            >
              {{ item.name }}
            </el-button>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-main class="idea-light-main">
          <div class="idea-light-file-area">
            <file-area ref="fileChild"></file-area>
          </div>
          <div class="idea-light-status">
            Status
          </div>
        </el-main>
        <el-aside width="300px" class="idea-light-aside">
          Aside
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
  import footers from "./components/footer.vue";
  import fileArea from "./components/fileArea.vue";
  import { DocumentAdd, Brush, MagicStick, Message, Star, Delete } from "@element-plus/icons-vue";
  import { computed, getCurrentInstance, onMounted, ref, watchEffect } from "vue";
  import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
  import { fileListDto, openPath } from "./components/tool";
  import { type } from "process";

  // @ts-ignore
  const { proxy } = getCurrentInstance();
  const ipcRenderer = window.ipcRenderer;
  const isLoading = ref(false);
  const pageTitle = ref({
    type: "mp4",
    output: "",
  });

  function sgg() {
    fileChild.value.isDrop();
  }
  function removeAll() {
    console.log("111222");
    proxy
      .$confirm("确定要清空文件吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        fileChild.value.removeAll();
      })
      .catch(() => {});
  }
  async function beginStart() {
    let fileList: Array<fileListDto> = fileChild.value.fileList;
    isLoading.value = true;
    for (let index = 0; index < fileList.length; index++) {
      let el = fileList[index];
      let { path, name, filetype, status } = fileList[index];
      el.status = 1;
      let outPath = (pageTitle.value.output ? pageTitle.value.output : path.substring(0, path.indexOf(name))) + name + "." + pageTitle.value.type;
      console.info(outPath)
      let info = {
        input: path,
        filetype,
        type: pageTitle.value.type,
        output: outPath,
      };
      if (filetype == pageTitle.value.type) {
        el.status = 2;
        continue;
      }
      let res = await window.ipcRenderer.invoke("processAudios", info).catch((err) => {
        console.log(err);
      });
      if (res) {
        el.status = 2;
        el.outpath = outPath;
      }
      if (res.msg) {
        console.log(res.msg);
        ElNotification({
          title: res.msg,
          message: res.path || "",
          type: "error",
        });
      }

      //   setTimeout(() => {
      //     el.status = 2;
      //   }, 1000);
      console.log(info);
    }
    isLoading.value = false;
    if (pageTitle.value.output) {
      openPath(pageTitle.value.output);
    }
  }

  let fileChild = ref();

  async function OpenVideoDir() {
    let res = await window.ipcRenderer.invoke("selectVideoFiles");
    let fileList: Array<fileListDto>;
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

    fileList = res.map((e: string, key: any) => {
      return {
        ...getPath(e),
        path: e,
        id: key,
        status: 0,
      };
    });
    //
    // 父调用字方法
    fileChild.value.changeFile(fileList);
    //  = fileChild.value.fileList
    console.log(fileList);
  }

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
      work: beginStart,
      icon: MagicStick,
      type: "",
    },
  ];

  onMounted(() => {
    console.log(fileChild.value, "页面启动了");
    ipcRenderer.send("init");

    ipcRenderer.on("merge-merge-result", (event, arg) => {
      console.log(arg);
      if (arg.type == "err") {
        console.log("转换失败");
      }
    });
  });
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
</script>

<style scoped>
.idea-light-app {
  background-color: #fafafa;
  font-family: 'JetBrains Mono', monospace;
  color: #333;
}

.container {
  height: 100vh;
  padding: 0;
  margin: 0;
}

.idea-light-header {
  background-color: #f0f0f0;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
}

.idea-light-header-content {
  display: flex;
  justify-content: space-between;
}

.idea-light-work-buttons {
  display: flex;
  align-items: center;
}

.idea-light-work-button {
  background-color: #f5f5f5;
  color: #333;
  font-size: 13px;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.idea-light-work-button:hover {
  background-color: #e5e5e5;
}

.idea-light-main {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.idea-light-content {
  display: flex;
}

.idea-light-file-area {
  flex: 1;
  margin-right: 10px;
}

.idea-light-status {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height : 120px;
}

.idea-light-aside {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
