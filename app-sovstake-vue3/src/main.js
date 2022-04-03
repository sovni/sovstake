import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';


const app = createApp(App)

app.use(ToastService).use(router).use(PrimeVue)

app.mount('#app')
