import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './styles.css'

createApp(App)
  .use(createPinia()) // 先装 Pinia：路由守卫里要用 store
  .use(router)
  .mount('#app')
