<template>
    <div>
        <h2 v-show="!bcConnected && !bcConnectionError">
            Connecting...
        </h2>

        <div v-show="bcConnected && !bcConnectionError">
            <router-view></router-view>
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
    </div>
</template>

<script>
// importing common function
import mixin from './libs/mixinViews';

export default {
    mixins: [mixin],
    name: 'App'
};

</script>

<style>
body {
  background-color : #dbdbdb;;
}
</style>
