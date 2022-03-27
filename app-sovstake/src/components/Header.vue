<template>
    <div>
      <Menubar :model="items" >
         <template #end>
            {{ getMainAccount() }}
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