<template>
   <header>
      <Menubar :model="items" >
         <template #end>
            {{ getMainAccount() }}
         </template>
      </Menubar>
   </header>
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
                   to:'/'
               },               
               {
                   label:'Stake',
                   icon:'pi pi-fw pi-home',
                   to:'/stake'
               }, 
               {
                   label:'Admin',
                   icon:'pi pi-fw pi-home',
                   to:'/admin'
               },
            ]
        }
      },    
      components: {
         Menubar
      },
      mounted() {
      },
      methods: {
         getMainAccount(){
            return window.bc.info.mainAccount;
         }
      }
   }
</script>