<template>
  <div class="grid m-2">
    <div class="m-2 col-12">
      <h1>{{ msg }}</h1>
    </div>
      <Token v-for="(mytoken, index) in tokenArray" v-bind:key="mytoken" v-bind:mytoken="mytoken"/> 
  </div>
</template>
<script>
// importing common function
import mixin from '../libs/mixinViews';
import Token from './Token.vue';
import Card from 'primevue/card';


export default {
  name: 'StakeStatus',
  mixins: [mixin],
  components: {
      Card,
      Token
  },
  data () {
    return {
      msg: 'Sov stake',
      tokenArray: [],
      tmoConn: null // contain the intervalID given by setInterval
    }
  },

  methods: {
    waitContractInit() {
      if (this.blockchainIsConnected()) {
        clearInterval(this.tmoConn);
        this.$toast.add({severity:'success', summary: 'Wallet connected', group: "bottom-right", life: 3000});

        console.log("Info : " + window.bc.info.balance);
        console.log("Account : " + window.bc.info.mainAccount);
        //console.log("Owner : "+ window.bc.contract('SovStake').owner());

        console.log(window.bc.contract('SovStake'));

        window.bc.contract('SovStake').methods.getTokenArray().call((error, tokenArray) => {
          this.tokenArray = tokenArray;
          console.log("Res : " + this.tokenArray);
        });
        console.log("Info : " + window.bc.info.balance);
        console.log("Account : " + window.bc.info.mainAccount);
        //console.log("Owner : "+ window.bc.contract('SovStake').owner());
      }
    }
  },

  mounted() {
      // it tries to get the user list from the blockchian once
      // the connection is established
      this.tmoConn = setInterval(() => {
        this.waitContractInit();
      }, 1000);
  }
}
</script>    