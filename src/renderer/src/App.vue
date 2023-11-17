<template>
  <div>
    <el-container>
      <el-main width="66%">
        <file-area v-if="cid"  :cid="cid"> </file-area>
      </el-main>
      <el-aside width="33%">
        <message-area v-if="cid" :cid="cid"></message-area>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup lang="ts" >
import FileArea from "./components/FileArea.vue";
import MessageArea from "./components/MessageArea.vue";
import {onBeforeMount, ref} from "vue";
import {register} from "../../common/api";

const cid = ref("")
onBeforeMount( () => {
  register().then(r => {
    cid.value = r.data.data
    document.cookie = `cid=${r.data.data}`
  })
})
</script>

<style scoped>

</style>
