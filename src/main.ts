/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import PrimeVue from 'primevue/config';

import { createApp } from 'vue';
import App from './App.vue';

import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css';

import '../node_modules/primeflex/primeflex.css';

const app = createApp(App);

app.use(PrimeVue);

app.mount('#app');
