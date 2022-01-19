import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        // 儲存token
        Authorization: localStorage.getItem('Authorization') ? localStorage.getItem('Authorization') : ''
    },mutations: {
        // 修改token，並將token存入localStorage
        changeLogin (state,user) {
            state.Authorization = user.Authorization;
            localStorage.setItem('Authorization',user.Authorization);
        }
    }
});

export default store;