import Web3 from "web3";
import { Transaction } from "web3-core"

import fs from "fs"
import { ShortLiveArray } from "./ShortLiveArray";

const mainRpc = "ws://51.89.195.65:6967"

const providersUrls = [
  mainRpc,
  "wss://eth-mainnet.alchemyapi.io/v2/_1q7IL5FRQGVbIvtEedD_5BChnFrgd53",
  "wss://mainnet.infura.io/ws/v3/3d690a2741d44fcaa13ed569d2985a38"
];

class MempoolWatcher {
  providers: any;
  transactionKnown: ShortLiveArray<string>;
  dinosaureTX: any;
  alreadyCheckTx: ShortLiveArray<string>;
  newTxCallback: ((tx: Transaction) => void) | undefined;
  lazyMode: boolean;

  constructor() {

    this.providers = [];
    this.transactionKnown = new ShortLiveArray(60);
    this.alreadyCheckTx = new ShortLiveArray(60);
    this.lazyMode = true;
    

    this.dinosaureTX = JSON.parse(fs.readFileSync("./data/dinos.json", "utf8"));
    setInterval(() => {
      fs.writeFileSync("./data/dinos.json", JSON.stringify(this.dinosaureTX));
    }, 10000);


    


    for (const providerUrl of providersUrls) {
      const provider = new Web3(providerUrl);
      this.providers.push(provider);
      provider.eth.subscribe("pendingTransactions").on("data", (tx: string) => {
        this.handle_new_tx(tx);
      });
      provider.eth.subscribe("syncing").on("data", (log) => {
        console.log(log);
      });
    }

    
    this.handle_new_tx = this.handle_new_tx.bind(this);
    this.handle_tx_data = this.handle_tx_data.bind(this);

  }

  handle_new_tx(tx: string) {
    if (this.transactionKnown.push(tx)) {
      if (this.dinosaureTX.includes(tx)) {
        return;
      }
      const datacallback = (err: any, txData: null | Transaction) => {
        if (!err) {
          if (txData) {
            this.handle_tx_data(txData, 0)
          }
          else {
            this.dinosaureTX.push(tx);
          }
        }
      }
      if (this.lazyMode) {
        this.providers[0].eth.getTransaction(tx, datacallback);
      }
      else {
        for (let i = 0; i < this.providers.length; i++) {
          const provider = this.providers[i];
          provider.eth.getTransaction(tx, datacallback)
        }
      }
    }
  }

  handle_tx_data(txData: Transaction, provider: number) {
    const sender = txData.from;
    const to = txData.to;
    const data = txData.input;
    if (sender && to && data) {
      if (this.alreadyCheckTx.push(txData.hash)) {
        if (this.newTxCallback) {
          this.newTxCallback(txData);
        }
      }
    }
  }

  

  setCallback(callback: (tx: Transaction) => void) {
    this.newTxCallback = callback;
  }

  toggleLazyMode(lazyMode: boolean) {
    this.lazyMode = lazyMode;


  }
}

  export const mempoolWatcher = new MempoolWatcher();


