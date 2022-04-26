import { Transaction } from "web3-core"
import ipc from "node-ipc";
import WebSocket from "ws";
import { mempoolWatcher } from "./MempoolWatcher";


ipc.config.id = 'mempoolWatcher';
ipc.config.retry = 1500;
ipc.config.silent = true;

const wss = new WebSocket.Server({ port: 6900 });
// besoin d'un mdp pour qu'un client ce connecte avec le serveur
wss.on("connection", (ws: WebSocket) => {

    ws.on("message", (data: string) => {
        if (data == "glitched") {
            clients.push(ws);
        }
    });
    
    ws.on("close", () => {
        clients.splice(clients.indexOf(ws), 1);
    });
});

const clients: WebSocket[] = []

function broadcastWS(data: any){
    clients.forEach(client => {
        client.send(JSON.stringify(data));
    });
};


let newTxCallbackIPC: (tx: Transaction) => void;

const newTxCallback = (tx: Transaction) => {
    const data = {
        from: tx.from,
        to: tx.to,
        input: tx.input,
        hash: tx.hash,
        nonce: tx.nonce,
        gasPrice: tx.gasPrice,
        gas: tx.gas,
        maxFeePerGas: tx.maxFeePerGas,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        value: tx.value,
    }
    if (newTxCallbackIPC) {
        newTxCallbackIPC(tx);
    }

    broadcastWS(data)

}


const watcher = mempoolWatcher
watcher.setCallback(newTxCallback)


ipc.serve(() => {
    newTxCallbackIPC = (data: any) => {
        
        ipc.server.broadcast("x", data);
    }

    ipc.server.on('message', (data, socket) => {
        if (data == "start") {
            watcher.toggleLazyMode(false);
        }

    });
});




ipc.server.start();

console.log("mempoolWatcher started");
