import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
// @ts-ignore
import('./assets/index.css')
import './assets/tailwind.css'
import {register} from "../../common/api";
// @ts-ignore

const app = createApp(App)
    .use(ElementPlus, {
        locale: zhCn,
    })
    .mount('#app')
    .$nextTick(window.removeLoading)



const maxUploadRetry = 3;
