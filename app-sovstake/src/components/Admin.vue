<template>
    <div class="p-grid p-m-2">
          <div class="p-col-12">
            <form @submit.prevent="addToken" style="width:100%">
                <div class="p-col-2 p-m-2">
                <span class="p-float-label">
                    <InputText v-model="tokenName" id="tokenName" />
                    <label for="tokenName">Token Name</label>
                </span>
                </div>
                <div class="p-col-2 p-m-2">
                <span class="p-float-label">
                    <InputText v-model="tokenAddress" id="tokenAddress"/>
                    <label for="tokenAddress">Token Address</label>
                </span>
                </div>
                <div class="p-col-4 p-m-2">
                <span class="p-float-label">
                    <InputText v-model="tokenAggreg" id="tokenAggreg"/>
                    <label for="tokenAggreg">Aggregator</label>
                </span>
                </div>
                <div class="p-col-2 p-m-2">
                  <Button label="Add Stakable Token" @click="addStackableToken()"/>
                </div>
            </form>
          </div>
        <div class="p-flex p-m-2 p-col-12">                       
            <DataTable :value="tokens" class="p-datatable-sm" responsiveLayout="scroll" autoLayout>
                <Column field="code" header="Token"></Column>
                <Column field="address" header="Address"></Column>
                <Column field="aggreg" header="Aggregator"></Column>
                <Column field="tvl" header="Tvl"></Column>
                <Column field="apr" header="APR"></Column>
                <Column field="price" header="Price"></Column>
                <Column field="enabled" header="Status">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.enabled == '1'" icon="pi pi-play" v-tooltip="'Disable'" class="p-button-rounded p-button-text p-button-success p-button-sm" @click="disableToken(slotProps.data.address)" />
                        <Button v-if="slotProps.data.enabled != '1'" icon="pi pi-pause" v-tooltip="'Enable'" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="enableToken(slotProps.data.address)" />
                    </template>
                </Column>
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
import Tooltip from 'primevue/tooltip';

export default {
  name: 'Admin',
  mixins: [mixin],
  components: {
    DataTable,
    Column,
    InputText,
    Button
  },
       directives: {
         'tooltip': Tooltip
      },
 data () {
    return {
      tokens: [],
      tokenName: '',
      tokenAddress: '',
      tokenAggreg: '',
      updating: false,
      tmoConn: null // contain the intervalID given by setInterval
    }
  },

  methods: {
      addStackableToken() {
        if (this.blockchainIsConnected()) {
            window.bc.getMainAccount()
            .then(account => {
                window.bc.contract('SovStake').addStakableToken(this.tokenAddress, this.tokenName, this.tokenAggreg, { from: account }, (error, txHash) => {
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
    disableToken(token) {
        if (this.blockchainIsConnected()) {
            window.bc.getMainAccount()
            .then(account => {
                window.bc.contract('SovStake').updateTokenStatus(token, false, { from: account }, (error, txHash) => {
                    if (error) {
                        console.error(error);
                    }
                    else
                        this.initTokenList();
                });
            })
            .catch();
        }
    },
    enableToken(token) {
        if (this.blockchainIsConnected()) {
            window.bc.getMainAccount()
            .then(account => {
                window.bc.contract('SovStake').updateTokenStatus(token, true, { from: account }, (error, txHash) => {
                    if (error) {
                        console.error(error);
                    }
                    else
                        this.initTokenList();
                });
            })
            .catch();
        }
    },
    initTokenList() {
      console.log("updating " + this.updating);
      if (this.updating)
        return;
      this.updating = true;
      this.tokens=[];
      let contract = window.bc.contract('SovStake');
      contract.getTokenArray((error, tokenArray) => {
        console.log("array = " + tokenArray);
        tokenArray.forEach((item, index) => {
          contract.getTokenInfo(item, (err, result) => {
            console.log("Get token status " + result);
            contract.getLatestPrice(item, (err, price) => {
              price = parseFloat(window.bc.weiToEther(price)).toFixed(7);//window.bc.weiToEther(price);
              let tvl = parseFloat(window.bc.weiToEther(result[4])).toFixed(7);//window.bc.weiToEther(price);
              this.tokens.push({"code":result[0], "address":item, "aggreg":result[1], "tvl":tvl, "apr":result[3], "price":price, "enabled":result[2]});
            });
          });
        });
      }); 
      this.updating = false; 
      console.log("updated");      
    },

    waitContractInit() {
      if (this.blockchainIsConnected()) {
        clearInterval(this.tmoConn);
        this.$toast.add({severity:'success', summary: 'Wallet connected', group: "bottom-right", life: 3000});

        this.initTokenList();

        window.bc.contract('SovStake').TokenAdded().watch((err, result) => {
            console.log("new token added : " + result.args.token);
            this.initTokenList();
        });
        window.bc.contract('SovStake').TokenStatusChanged().watch((err, result) => {
            console.log("toekn status changed " + result.args.token);
            this.initTokenList();
        });
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