<template>
  <div class="p-flex-column p-m-2">
    <div class="p-mt-4">
      <Card style="width:400px;height:400px;">
          <template #title>
            Token Name : {{tokenName}}
          </template>
          <template #content>
            <h3>My TVL : {{mytvl}}</h3>
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
                  <InputNumber v-model="withdraw" />
                  <Button label="Withdraw" @click="withdrawToken()"/>
                </form>
              </TabPanel>
            </TabView>
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
      deposit: 2000,
      allowance:0,
      deposit_requested: false,
      withdraw: 0,
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

        window.bc.contract('SovStake').getTokenName(this.mytoken, (err, value) => {
            this.tokenName = value;
        });


        window.bc.contract('SovStake').getTVL(this.mytoken, (err, value) => {
          this.tvl = parseInt(window.bc.weiToEther(value));
        });


        window.bc.contract('SovStake').getMyTVL(this.mytoken, { from: window.bc.info.mainAccount }, (err, value) => {
          console.log("My TVL :" + value);
          this.mytvl = parseInt(window.bc.weiToEther(value));
        });
        window.bc.contract('SovStake').TokenStaked().watch((err, result) => {
          console.log("Token staked success");
          window.bc.contract('SovStake').getMyTVL(this.mytoken, { from: window.bc.info.mainAccount }, (err, value) => {
            console.log("My TVL :" + value);
            this.mytvl = parseInt(window.bc.weiToEther(value));
          });
        });
        this.tokenContract = this.getERC20Contract();
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
            this.depositRequested = true;
            this.tokenContract.increaseAllowance(window.bc.contract('SovStake').address, parseInt(window.bc.etherToWei(this.deposit)), { from: account }, (error, txHash) => {
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
    },
    getERC20Contract() {
      /*return window.bc.web3 ? new window.bc.web3().eth.contract(ERC20, this.mytoken, {
        from: window.bc.web3().eth.defaultAccount,
      })
      :   null*/
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