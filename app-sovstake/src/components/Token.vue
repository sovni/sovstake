<template>
    <div class="p-m-2 p-col-3">
      <Card style="width:380px;height:480px;">
          <template #title>
            Token Name : {{tokenName}}
          </template>
          <template #content>
            <h3>Token price : {{tokenPrice}} ETH</h3>
            <h3>My TVL : {{mytvl}}</h3>
            <h3>Stake Date : {{sdate}}</h3>
            <TabView>
              <TabPanel header="Deposit">
                <h3>My Wallet : {{wallet}}</h3>
                <h3>Deposit</h3>
                <form @submit.prevent="deposit">
                  <InputNumber v-model="deposit" />
                  <Button label="Deposit" @click="allowDeposit()"/>
                </form>                      
              </TabPanel>
              <TabPanel header="Withdraw">
                <h3>Withdraw</h3>
                <form @submit.prevent="withdraw">
                  <Button label="Withdraw" @click="withdrawToken()"/>
                </form>
              </TabPanel>
            </TabView>
          </template>
      </Card>
    </div>      
</template>
<script>
// importing common function
import mixin from '../libs/mixinViews';
import Button from 'primevue/button';
import InputNumber  from 'primevue/inputnumber';
import InputText  from 'primevue/inputtext';
//import Listbox from 'primevue/listbox';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ERC20 from '../assets/abi-erc20.json';


export default {
  name: 'StakeStatus',
  mixins: [mixin],
  props: ['mytoken'],
  components: {
      InputNumber ,
      InputText,
      TabView,
      TabPanel,
      Card,
      Button
  },
  data () {
    return {
      tokenName: '',
      tvl: 0,
      mytvl: 0,
      wallet: 0,
      deposit: 0,
      allowance:0,
      sdate: '',
      deposit_requested: false,
      tokenPrice: 0,
      tokenContract: null,
      tmoConn: null // contain the intervalID given by setInterval
    }
  },

  methods: {
    waitContractInit() {
      if (this.blockchainIsConnected()) {
        clearInterval(this.tmoConn);
        console.log("Info : " + window.bc.info.balance);
        console.log("Account : " + window.bc.info.mainAccount);

        this.tokenContract = this.getERC20Contract();
        this.updateInfos();

        window.bc.contract('SovStake').TokenStaked().watch((err, result) => {
          if (result.args.staker == window.bc.info.mainAccount) {
            console.log("Token staked success");
            this.updateInfos();
          }
        });

        window.bc.contract('SovStake').TokenWithdrawn().watch((err, result) => {
          if (result.args.staker == window.bc.info.mainAccount) {
            console.log("Token staked success");
            this.updateInfos();
          }
        });

        this.tokenContract.Approval().watch((err, result) => {
          if (err) {
            console.log('Could not approve increaseAllowance');
          }
          else {
            console.log("Approval event received ");
            console.log("   value   :" + result.args.value);
            console.log("   owner   :" + result.args.owner);
            console.log("   spender :" + result.args.spender);
            console.log("   sov     :" + window.bc.contract('SovStake').address);
            if (this.depositRequested) {
              this.depositRequested = false;
              this.depositToken();
            }
          }
        });
      }
    },
    updateInfos() {

        window.bc.contract('SovStake').getTokenName(this.mytoken, (err, value) => {
            this.tokenName = value;
        });

        window.bc.contract('SovStake').getTVL(this.mytoken, (err, value) => {
          this.tvl = parseInt(window.bc.weiToEther(value));
        });

        window.bc.contract('SovStake').getMyTVL(this.mytoken, { from: window.bc.info.mainAccount }, (err, value) => {
          console.log("My TVL :" + value);
          this.mytvl = parseInt(window.bc.weiToEther(value));

          if (this.mytvl > 0) {
            window.bc.contract('SovStake').getStakeDate(this.mytoken, {from: window.bc.info.mainAccount}, (err, sdate) => {
              console.log("stake date :" + sdate);
              let date = new Date(parseInt(sdate)*1000); 
              this.sdate = date.toLocaleString();
            });
          }
        });

        window.bc.contract('SovStake').getLatestPrice(this.mytoken, { from: window.bc.info.mainAccount }, (err, value) => {
          console.log("Price :" + value);
          this.tokenPrice = parseFloat(window.bc.weiToEther(value)).toFixed(5);
        });
        console.log(this.tokenContract);
        console.log(window.bc.info.mainAccount);
        this.tokenContract.balanceOf(window.bc.info.mainAccount, (err, value) => {
          if (err)
            console.log("error : " + err);
          else {
            console.log("My Token :" + value);
            //this.wallet = window.bc.weiToEther(parseInt(value));
            this.wallet = parseInt(window.bc.weiToEther(value));
          }
        });
        this.tokenContract.allowance(window.bc.info.mainAccount,  window.bc.contract('SovStake').address, (err, value) => {
          console.log("Token :" + value);
          //this.wallet = window.bc.weiToEther(parseInt(value));
          this.allowance = parseInt(window.bc.weiToEther(value));
          console.log("Allowance :" + this.allowance);
        });
    },
    allowDeposit() {
      console.log("Allow deposit : " + this.deposit);

      if (this.blockchainIsConnected()) {
        window.bc.getMainAccount()
        .then(account => {
            this.depositRequested = true;
            this.tokenContract.approve(window.bc.contract('SovStake').address, parseInt(window.bc.etherToWei(this.deposit)), { from: account }, (error, txHash) => {
                if (error) {
                  this.msgStatus = "Error. Allowance refused";
                  console.error(error);
                }
                else
                  this.msgStatus = "increaseAllowance submitted";
            });
        })
        .catch();
        //.catch(error => reject(error));      
      }
    },
    depositToken() {
      console.log("Deposit Token : " + this.deposit);

      if (this.blockchainIsConnected()) {
        window.bc.getMainAccount()
        .then(account => {
            window.bc.contract('SovStake').stake(this.mytoken, parseInt(window.bc.etherToWei(this.deposit)), { from: account }, (error, txHash) => {
                if (error) {
                  this.msgStatus = "Error. Check console logs";
                  console.error(error);
                }
                else
                  this.msgStatus = "stake submitted";
            });
        })
        .catch();
        //.catch(error => reject(error));      
      }
    },
    withdrawToken() {
      console.log("Withdraw Token : " + this.deposit);

      if (this.blockchainIsConnected()) {
        window.bc.getMainAccount()
        .then(account => {
            window.bc.contract('SovStake').withdraw(this.mytoken, { from: account }, (error, txHash) => {
                if (error) {
                  this.msgStatus = "Error. Check console logs";
                  console.error(error);
                }
                else
                  this.msgStatus = "withdraw submitted";
            });
        })
        .catch();
        //.catch(error => reject(error));      
      }
    },
    getERC20Contract() {
      return  window.bc.web3().eth.contract(ERC20).at(this.mytoken);

    }
  },
  created() {
      // it tries to get the user list from the blockchian once
      // the connection is established
      this.tmoConn = setInterval(() => {
        this.waitContractInit();
      }, 1000);
  }
}
</script>    