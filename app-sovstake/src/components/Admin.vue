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
                <Button label="Add Stakable Token" @click="addStackableToken()"/>
            </form>
        <div class="p-flex-column p-m-12 p-mt-2">                       
            <DataTable :value="tokens" class="p-datatable-sm" responsiveLayout="scroll" autoLayout>
                <Column field="code" header="Code"></Column>
                <Column field="address" header="Address"></Column>
                <Column field="tvl" header="Tvl"></Column>
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
          contract.getTokenName(item, (err, name) => {
            contract.getTVL(item, (err, tvl) => {
              contract.getTokenStatus(item, (err, status) => {
                tvl = parseInt(window.bc.weiToEther(tvl));
                contract.getLatestPrice(item, (err, price) => {
                    console.log("price=" + price + ":" + window.bc.weiToEther(price));
                    price = window.bc.weiToEther(price);
                    console.log("item " + item);
                  this.tokens.push({"code":name, "address":item, "tvl":tvl, "price":price, "enabled":status});
                });
              });
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