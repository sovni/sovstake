<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import mixin from './libs/mixinViews';
import Header from '@/components/Header.vue'
import Toast from 'primevue/toast';
</script>

<template>
    <div>
        <div>
        <Header style="max-width:1000px;margin: auto;"/>
        </div>
        <h2 v-show="!bcConnected && !bcConnectionError">
            Connecting...
        </h2>

        <div v-show="bcConnected && !bcConnectionError">
          <RouterView />
        </div>

        <div v-show="bcConnectionError" class="alert alert-danger">
            <h2>Error connecting to the blockchain!</h2>

            <p v-if="errorConnectionMessage">
                <b>{{ errorConnectionMessage }}</b>
            </p>

            <p v-show="bcSmartContractAddressError">
                <b>It seems like the address of the smart contract is wrong!</b>
            </p>

            <hr>

            <p>Other common causes of error:</p>
            <ul>
                <li>The blockchain is running.</li>
                <li>The port in your settings (file: <b>libs/mixinViews.js</b>) match with the blockchain configuration.</li>
                <li>The compiled smart contract <b>app-users/src/assets/Users.json</b> is equal to <b>build/Users.json</b>.</li>
            </ul>
        </div>
        <Toast group="bottom-right" position="bottom-right"  />
    </div>
</template>
<script>

export default {
    mixins: [mixin],
    name: 'App',
    components: {
        Header,
        Toast
    },
    data () {
        return {
        }
    },
  methods: {

  },
    mounted() {

    }
}
</script>
<style>
body {
  background-color : #dbdbdb;;
}
</style>
