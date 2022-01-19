<template>
  <v-app>
    <v-app-bar app color="secondary" dark>
      <div class="d-flex align-center">
        <a href="/">
          <v-img
            alt="Vuetify Logo"
            class="shrink mr-2"
            contain
            src="https://i.imgur.com/RZlMpOs.png"
            transition="scale-transition"
            width="40"
          />
        </a>
        <a href="/" style="text-decoration:none; color:#e8e8e8;">Happy Miner</a>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        target="_blank"
        text
        @click="logout"
      >
        <span id='loginState' class="mr-2">Logout</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <template>
        <div id="app">
          <nav>
            <router-link to="/">首頁 Home</router-link>｜
            <router-link to="/hashrate">即時算力 Real-time Hashrate</router-link>｜
            <router-link to="/reward">即時收益 Real-time Reward</router-link>｜
            <router-link to="/payout">申請出金 Payout</router-link>
          </nav>
          <transition name="fadein">
            <router-view/>
          </transition>
        </div>
      </template>
      <Footer/>
    </v-main>
  </v-app>
</template>
<script>
import axios from 'axios'
import Footer from './components/Footer';

export default {
  name: 'App',
  components: {
    Footer
  },
  data: () => ({
    model: null,
    classes: [
      []
    ],
  }),
  async mounted(){
    let rewardData  = await axios.get(
      'http://140.119.164.151:3000/api/reward'
    )
    let {data} = await axios.get(
      'http://140.119.164.151:3000/api/hashrate'
    )
    this.classes = [['h2', `${rewardData.data.totalPaid+rewardData.data.totalUnpaid} ETH`, `${data.items[0].hashrate/1000000} MH/s`, '5', `${rewardData.data.totalUnpaid} ETH`, `${rewardData.data.totalPaid} ETH`, -1]];
  },
  methods: {
    logout () {
      localStorage.removeItem('Authorization');
      this.$router.push('/login');
    }
  }
};

</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.slide-fade-enter-active {
  transition: all .3s linear;
  -webkit-transition: all .3s linear;
  -moz-transition: all .3s linear;
  -ms-transition: all .3s linear;
  -o-transition: all .3s linear;
}
.slide-fade-leave-active {
  transition: all .5s linear;
  -webkit-transition: all .5s linear;
  -moz-transition: all .5s linear;
  -ms-transition: all .5s linear;
  -o-transition: all .5s linear;
}
.slide-fade-enter{
  transform: translateX(20px);
  -webkit-transform: translateX(20px);
  -moz-transform: translateX(20px);
  -ms-transform: translateX(20px);
  -o-transform: translateX(20px);
  opacity: 0;
}
.slide-fade-leave-active {
  opacity: 0;
}
</style>

