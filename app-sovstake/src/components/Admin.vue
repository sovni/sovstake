<template>
    <div class="p-fluid grid">
            <form @submit.prevent="addToken">
                <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText v-model="tokenName" id="tokenName" />
                    <label for="tokenName">Token Name</label>
                </span>
                </div>
                <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText v-model="tokenAddress" id="tokenAddress"/>
                    <label for="tokenAddress">Token Address</label>
                </span>
                </div>
                <div class="field col-12 md:col-4">
                <span class="p-float-label">
                    <InputText v-model="tokenAggreg" id="tokenAggreg"/>
                    <label for="tokenAggreg">Aggregator</label>
                </span>
                </div>
                <Button label="Add Stakable Token" @click="addToken()"/>
            </form>
        <div class="p-flex-column p-m-12 p-mt-2">                       
            <DataTable :value="tokens" class="p-datatable-sm" responsiveLayout="scroll" autoLayout>
                <Column field="code" header="Code"></Column>
                <Column field="address" header="Address"></Column>
                <Column field="tvl" header="Tvl"></Column>
                <Column field="enabled" header="Enabled"></Column>
            </DataTable>
        </div>
    </div>
</template>
<script>
// importing common function
import mixin from '../libs/mixinViews';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText  from 'primevue/inputtext';

export default {
  name: 'Admin',
  mixins: [mixin],
  components: {
    DataTable,
    Column,
    InputText,
    Button
  },
  data () {
    return {
      tokens: [],
      tokenName: '',
      tokenAddress: '',
      tokenAggreg: '',
      tmoConn: null // contain the intervalID given by setInterval
    }
  },

  methods: {
      addStackableToken() {
        if (this.blockchainIsConnected()) {
            window.bc.getMainAccount()
            .then(account => {
                window.bc.contract('SovStake').addStackableToken(this.tokenAddress, this.tokenName, this.tokenAggreg, { from: account }, (error, txHash) => {
                    if (error) {
                        console.error(error);
                    }
                    else
                        console.log("Token added");
                });
            })
            .catch();
            //.catch(error => reject(error));      
        }
    },
    initTokenList() {
      this.tokens=[];
      let contract = window.bc.contract('SovStake');
      contract.getTokenArray((error, tokenArray) => {
        tokenArray.forEach((item, index) => {
          contract.getTokenName(item, (err, name) => {
            contract.getTVL(item, (err, tvl) => {
              tvl = parseInt(window.bc.weiToEther(tvl));
              console.log("item " + item);
              this.tokens.push({"code":name, "address":item, "tvl":tvl, "enabled":"1"});
            });
          });
        });
      });        
    },

    waitContractInit() {
      if (this.blockchainIsConnected()) {
        clearInterval(this.tmoConn);
        this.$toast.add({severity:'success', summary: 'Wallet connected', group: "bottom-right", life: 3000});

        this.initTokenList();
      }
    }
  },
  created() {
      this.tmoConn = setInterval(() => {
        this.waitContractInit();
      }, 1000);
  },
  mounted() {
    //this.initTokenList();
  }
}
</script>    