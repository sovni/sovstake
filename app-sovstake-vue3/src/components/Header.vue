<template>
    <div>
      <Menubar :model="items" >
         <template #end>
            Kovan Wallet: {{ account }}
         </template>
      </Menubar>
    </div>
</template>

<script>
    import Menubar from 'primevue/menubar';
    import mixin from '../libs/mixinViews';

    export default {
      name: "Header-component",
      mixins: [mixin],
      data() {
        return {
            items: [
               {
                   label:'Home',
                   icon:'pi pi-fw pi-home',
                   to:'/',
               },               
               {
                   label:'Stake',
                   icon:'pi pi-fw pi-lock',
                   to:'/stake'
               }, 
               {
                   label:'Admin',
                   icon:'pi pi-fw pi-cog',
                   to:'/admin'
               }
            ],
            account: '',
            tmoConn: null // contain the intervalID given by setInterval
        }
      },    
      components: {
         Menubar
      },
      mounted() {
      },
      methods: {
         waitContractInit() {
            if (this.blockchainIsConnected()) {
               clearInterval(this.tmoConn);
               this.account = window.bc.info.mainAccount.substring(0, 8) + "...";
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