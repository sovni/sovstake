<template>
  <div class="p-flex-column p-m-2">
    <div class="p-mt-2">
      <h1>{{ msg }}</h1>
    </div>
    <div class="p-mt-2">
     <Card>
        <template #title>
          DAI
        </template>
        <template #content>
          <div class="p-mt-4">
            <Card>
                <template #title>
                  Stats
                </template>
                <template #content>
                  <h3>TVL</h3>
                  <InputNumber v-model="tvl" />
                </template>
            </Card>    
          </div>
          <div class="p-mt-4">
            <Card>
                <template #title>
                  My Account
                </template>
                <template #content>
                  <h3>My TVL</h3>
                  <InputNumber v-model="mytvl" />
                  <TabView>
                    <TabPanel header="Deposit">
                      <h3>My Wallet</h3>
                      <InputNumber v-model="wallet" />
                      <h3>Deposit</h3>
                      <form @submit.prevent="deposit">
                        <InputNumber v-model="deposit" />
                        <Button label="Deposit" @click="depositToken()"/>
                        <Button label="Allow" @click="allowDeposit()"/>
                      </form>                      
                      <InputNumber v-model="allowance" />
                    </TabPanel>
                    <TabPanel header="Withdraw">
                      <h3>Withdraw</h3>
                      <form @submit.prevent="withdraw">
                        <InputNumber v-model="withdraw" />
                        <Button label="Withdraw" @click="withdrawToken()"/>
                      </form>
                    </TabPanel>
                  </TabView>
                </template>
            </Card>
          </div>
        </template>
      </Card>        
    </div>
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

export default {
  name: 'StakeStatus',
  mixins: [mixin],
  components: {
      InputNumber ,
      InputText,
      TabView,
      TabPanel,
      Card,
      //Timeline,
      Button
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js Vote dApp',
      tvl: 0,
      mytvl: 0,
      wallet: 0,
      deposit: 0,
      allowance:0,
      withdraw: 0,
      tmoConn: null // contain the intervalID given by setInterval
    }
  },

  methods: {
    waitContractInit() {
      if (this.blockchainIsConnected()) {
        clearInterval(this.tmoConn);
        console.log("Info : " + window.bc.info.balance);
        console.log("Account : " + window.bc.info.mainAccount);

        window.bc.contract('SovStake').getTVL((err, value) => {
          this.tvl = parseInt(window.bc.weiToEther(value));
        });

        window.bc.contract('SovStake').getMyTVL({ from: window.bc.info.mainAccount }, (err, value) => {
          console.log("My TVL :" + value);
          this.mytvl = parseInt(window.bc.weiToEther(value));
        });
        window.bc.contract('SovStake').TokenStaked().watch((err, result) => {
          console.log("Token staked success");
        });
        window.bc.contract('Dai').balanceOf(window.bc.info.mainAccount, (err, value) => {
          console.log("Dai Token :" + value);
          //this.wallet = window.bc.weiToEther(parseInt(value));
          this.wallet = parseInt(window.bc.weiToEther(value));
        });
        console.log(window.bc.contract('Dai'));
        window.bc.contract('Dai').allowance(window.bc.info.mainAccount,  window.bc.contract('SovToken').address, (err, value) => {
          console.log("Dai Token :" + value);
          //this.wallet = window.bc.weiToEther(parseInt(value));
          this.allowance = parseInt(window.bc.weiToEther(value));
        });
          /*window.bc.contract().getVotingStatus((err, status) => {
          this.updateVotingStatus(status);
          this.statusList[status].icon = 'pi pi-circle-on';
          if (this.votingStatus == 0) {
            this.updateNumberVoters();
          }
          else if (this.votingStatus == 1) {
            this.initProposalList();
          }
          else if (this.votingStatus == 5) {
            this.updateWinningVote();
          }
        });*/

        /*let VoterRegistered = window.bc.contract().VoterRegistered();
        VoterRegistered.watch((err, result) => {
          if (err) {
            console.log('could not get event VoterRegistered()')
          } else {
            console.log("voterRegistered event received");
            console.log(result.args);
            this.updateNumberVoters();
          }
        });
        window.bc.contract().WorkflowStatusChange().watch((err, result) => {
          if (err) {
            console.log('could not get event WorkflowStatusChange()')
          } else {
            console.log("WorkflowStatusChange event received");
            console.log(result.args);
            this.updateVotingStatus(result.args.newStatus);
            this.statusList[result.args.newStatus].icon = 'pi pi-circle-on';
            this.statusList[result.args.previousStatus].icon = 'pi pi-circle-off';
            if (this.votingStatus == 5)
              this.updateWinningVote();
          }
        });
        window.bc.contract().ProposalRegistered().watch((err, result) => {
          if (err) {
            console.log('could not get event ProposalRegistered()')
          } else {
            console.log("ProposalRegistered event received");
            console.log(result.args);
            this.addProposal(result.args.proposalId);
          }
        });*/
      }
    },
    allowDeposit() {
      console.log("Allow deposit : " + this.deposit);

      if (this.blockchainIsConnected()) {
        window.bc.getMainAccount()
        .then(account => {
            window.bc.contract('Dai').increaseAllowance(window.bc.contract('SovStake').address, parseInt(window.bc.etherToWei(this.deposit)), { from: account }, (error, txHash) => {
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
            window.bc.contract('SovStake').stake(parseInt(window.bc.etherToWei(this.deposit)), { from: account }, (error, txHash) => {
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
            //window.bc.contract('SovStake').withdraw(parseInt(window.bc.etherToWei(this.withdraw)), { from: account }, (error, txHash) => {
            window.bc.contract('SovStake').withdraw({ from: account }, (error, txHash) => {
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