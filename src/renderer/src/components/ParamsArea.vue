<template>
  <div class="p-4 border border-gray-50 rounded-md shadow-md" style="align-self: auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 模型大小下拉框 -->
      <div>
        <label class="block text-sm font-medium text-gray-700">模型大小</label>
        <div class="relative">
          <select
              v-model="model"
              class="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          >
            <option disabled value="">选择模型</option>
            <option v-for="size in modelSizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>
      <!-- 温度参数输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          温度参数
        </label>
        <input
            v-model="temperature"
            type="number"
            step="0.1"
            min="0"
            max="1"
            class="block  w-full px-4 py-2 leading-tight bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="温度参数"
        >
      </div>
    </div>

    <!-- 初始化提示输入 -->
    <div class="mt-4">
      <input
          v-model="initial_prompt"
          type="text"
          class="block font-sans w-full px-4 py-2 leading-tight bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          placeholder="初始化提示输入"
      >
    </div>
  </div>
</template>

<script setup lang="ts">

const emit = defineEmits(['params-change'])

import {watch, ref} from "vue";



const modelSizes = ref(["small", "medium", "large-v1", "large-v2", "openai/whisper-large-v3"]);
const model = ref("medium");
const temperature = ref(0);
const initial_prompt = ref("");
const props = defineProps(["paramsChange"]);
// Create the params object
const params = ref({});

// emit the params object when it changes
watch([model, temperature, initial_prompt], () => {
  params.value = {
    model: model.value,
    temperature: temperature.value,
    initial_prompt: initial_prompt.value,
  };
  emit("params-change", params.value);
});
</script>
