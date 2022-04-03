import BcExplorer from './BcExplorer'
import SovStakeContract from '../../contracts/SovStake.json';
//import Dai from '../../contracts/Dai.json';

export default {
    data() {
        return {
            bcConnected: false, // true when the connection with the blockchain is established, plus the contract ABI + address is correctli initialized
            bcConnectionError: false,
            errorConnectionMessage: null,
            bcSmartContractAddressError: false
        }
    },

    created() {
        this.init();
    },

    methods: {
        /**
         * Initialize the BcExplore object (this means the connection with the
         * blockchin and initialise the contracts).
         *
         * @return {void}
         */
        init() {
            // when this file is imported to other component it checks if the BcExplorer
            // is instatiated.
            if (window.bc == undefined) {
                window.bc = new BcExplorer;

                // connecting to the blockchain and intializing the Users smart contract
                window.bc.initWithContractJson(SovStakeContract, 'http://127.0.0.1:7545', 'SovStake')
                .then((error) => {
                    // handling the connection error
                    if (error) {
                        this.bcConnected = false;

                        this.showConnectionErrorMessage(error);
                    } else {
                        this.bcConnectionError = false;
                        this.bcConnected = this.blockchainIsConnected(); 

                            /*window.bc.initWithContractJson(Dai, 'http://127.0.0.1:7545', 'Dai')
                            .then((error) => {
                                if (error)
                                    console.log("Error init Dai contract");
                                else {
                                    console.log("Dai contract initialised");
                                }
                            })*/
                    }
                })
                .catch(error => this.showConnectionErrorMessage(error));
            } // end if (window.bc == undefined)
        },

        /**
         * Check if the user is registered.
         *
         * @return {Promise}
         */
        isRegistered() {
            return new Promise((resolve, reject) => {
                window.bc.getMainAccount()
                .then(account => {
                    window.bc.contract().isRegistered({ from: account }, (error, res) => {
                        if (error) reject(error);

                        resolve(res);
                    });
                })
                .catch(error => reject(error));
            });
        },

        /**
         * Show the conntection error message on top of the main content.
         *
         * @param {object} error|null
         * @return {void}
         */
        showConnectionErrorMessage(error=null) {
            this.bcConnectionError = true;

            if (error) console.log(error);

            if (error && error.message) {
                this.errorConnectionMessage = error.message;
            }
        },

        /**
         * Check if the connection with the blockchain is established and if the smart
         * contract ABI + address are correctly initialized.
         *
         * @return {boolean}
         */
        blockchainIsConnected() {
            this.bcConnected = ((window.bc != undefined) && window.bc.isConnected());

            return this.bcConnected;
        },

        /**
         * Transform the parameter from bytes to string.
         *
         * @param {string} bytesStr
         * @return {string}
         */
        toAscii(bytesStr) {
            return window.bc.toAscii(bytesStr);
        },

        /**
         * Transform a timestamp number to date.
         *
         * @param {numeric} bytesStr
         * @return {string}
         */
        toDate(timestamp) {
            return new Date(timestamp * 1000).toISOString();
        }
    }
}
