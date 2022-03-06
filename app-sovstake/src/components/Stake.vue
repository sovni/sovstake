<template>
  <div class="p-flex-column p-m-2">
    <div class="p-mt-2">
      <h1>{{ msg }}</h1>
    </div>
    <div class="p-mt-2">
     <Card>
        <template #title>
          Stake title
        </template>
        <template #content>
        </template>
      </Card>        
    </div>
  </div>
</template>
<script>
// importing common function
import mixin from '../libs/mixinViews';
//import Button from 'primevue/button';
//import InputText from 'primevue/inputtext';
//import Listbox from 'primevue/listbox';
import Card from 'primevue/card';

export default {
  name: 'StakeStatus',
  mixins: [mixin],
  components: {
      //InputText,
      //Listbox,
      Card,
      //Timeline,
      //Button
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js Vote dApp',
      tmoConn: null // contain the intervalID given by setInterval
    }
  },

  methods: {
    waitContractInit() {
      if (this.blockchainIsConnected()) {
        clearInterval(this.tmoConn);
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