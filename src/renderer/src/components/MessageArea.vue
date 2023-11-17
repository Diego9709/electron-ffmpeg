<script setup lang='ts'>
import {onMounted, ref, toRefs, watch} from 'vue'
import {md} from "../../../common/markdown";
import {ChatMessage, TaskStatusMessage} from "../../../common/const";
import {eventBus} from "../../../common/eventBus";
import {useScroll} from "../tools/useScroll";
import {register} from "../../../common/api";



const props = defineProps({
  cid: {
    type: String,
    default: "",
  },
})
let heartbeat = false;

const wsOnline = ref<boolean>(false)

const { scrollRef, scrollToBottom, scrollToTop, scrollToBottomIfAtBottom } = useScroll();

const cid = toRefs(props).cid

const taskId = ref<string>("")

const roleAlias = { user: "ME", system: "System" };

const messageListMap = ref<Map<string, ChatMessage[]>>(new Map())
const defaultMessage = ref<ChatMessage[]>([
  {
    text: '你好，我是Whisper, 是基于大规模多语言数据训练的自动语音识别系统，采用端到端Transformer架构，能够识别口音、背景噪音，实现多语言转录和英语翻译。',
    role: 'system',
  },
])

let ws = null

function useSocket() {
  ws = new WebSocket('wss://trans.diego.run/whisper/ws/client?'+ document.cookie.split('=')[1]);
  console.log("cid", document.cookie.split('=')[1])
  // 发送心跳消息给服务器，保持连接活跃

  ws.onmessage = async function (e) {
    let data = e.data
    data = JSON.parse(data)
    if (data.actionType === 'TASK_STATUS_UPDATE') {
      let payload = data.payload
      payload = JSON.parse(payload)
      let message = payload.message
      let status = payload.status
      let id = payload.task_id
      await appendLastMessageContent(id, message)
      emitTaskStatusUpdate({ taskId: id , status: status, message: message })
    }
  };

  ws.onclose = async function (e) {
    wsOnline.value = false
    console.log('连接关闭', e);
  };

  ws.onerror = async (e) => {
    console.log('连接出错', e);
  };

  ws.onopen = async function () {
    wsOnline.value = true
    console.log('连接成功');
  };
}
function emitTaskStatusUpdate(statusMessage: TaskStatusMessage) {
  eventBus.emit('REMOTE_STATUS_UPDATE', statusMessage)
}

function emitWsOnline() {
  eventBus.emit('WS_ONLINE', wsOnline.value)
}

function sendHeartbeat() {
  if (ws.readyState === WebSocket.OPEN) {
    const heartbeatMessage = { actionType: 'HEARTBEAT' }; // 可以根据需要定义心跳消息内容
    ws.send(JSON.stringify(heartbeatMessage));
  }
}

function restart() {
  if (ws) {
    ws.close()
  }
  wsOnline.value = false
  useSocket()
}

watch(wsOnline, () => {
  emitWsOnline()
})



const appendLastMessageContent = async (id: string, content: string) => {
  const taskMessage = messageListMap.value.get(id)
  const systemMessage: ChatMessage = {role: 'system', text: content} // 创建系统消息对象
  if (taskMessage) {
    taskMessage[taskMessage.length] = systemMessage
  } else {
    messageListMap.value.set(id, [systemMessage])
  }
  await scrollToBottomIfAtBottom()
}

onMounted(
    () => {
      useSocket()
      messageListMap.value.set('system', defaultMessage.value)
      eventBus.on('TASK_MESSAGE_SHOW', (tid: string) => {
        console.log("messageListMap", messageListMap.value)
        taskId.value = tid
        if (!messageListMap.value.has(tid)) {
          messageListMap.value.set(tid, [])
        }
      })
      if (!heartbeat) {
        heartbeat = true;
        setInterval(sendHeartbeat, 30000); // 每30秒发送一次心跳消息
      }
    }
)

</script>

<template>
  <div class="flex flex-col h-screen">
    <div ref="scrollRef" id="scrollRef" class="h-full overflow-hidden overflow-y-auto">
      <div
          class="flex flex-nowrap fixed w-full items-baseline top-0 px-6 py-4 opaque-title"
      >
        <div class="text-2xl font-bold" >Whisper-X</div>
        <div class="ml-4 text-sm text-gray-500 font-sans">
          Automatic Speech Recognition
        </div>

        <div class="ml-4 text-sm text-gray-500 font-sans space-x-2" >
          <div :class="{ 'bg-green-500': wsOnline, 'bg-red-500': !wsOnline }" class="w-3 h-3 rounded-full"></div>
        </div>
        <div class="m-2">
          <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded"
              @click="restart"
          >
            重连
          </button>

        </div>
        </div>

      <div class="flex-1 mx-2 mt-20 mb-2">

        <div
            class="group flex flex-col px-4 py-3 hover:bg-slate-100 rounded-lg"
            v-for="item of messageListMap.get('system')"
        >
          <div class="flex justify-between items-center mb-2">
            <div class="font-bold">{{ roleAlias[item.role] }}：</div>
          </div>
          <div>
            <div
                class="prose text-sm text-slate-600 leading-relaxed"
                v-if="item.text"
                v-html="md.render(item.text)"
            ></div>
          </div>
        </div>

        <div
            class="group flex flex-col px-4 py-3 hover:bg-slate-100 rounded-lg"
            v-if="messageListMap.get(taskId)"
            v-for="item of messageListMap.get(taskId)"
        >
          <div class="flex justify-between items-center mb-2">
            <div class="font-bold">{{ roleAlias[item.role] }}：</div>
          </div>
          <div>
            <div
                class="prose text-sm text-slate-600 leading-relaxed"
                v-if="item.text"
                v-html="md.render(item.text)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .opaque-title {
    opacity: 1;
    background: white;
  }
</style>
