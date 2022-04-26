import ipc from "node-ipc";


ipc.config.id = 'mempoolWatcher';

ipc.connectTo("mempoolWatcher", () => {
    ipc.of.mempoolWatcher.on("connect", () => {
        ipc.of.mempoolWatcher.emit("message", "Hello World");
    });


    ipc.of.mempoolWatcher.on("x", (data: number) => {
        console.log("Server sent", data);
    });

    setInterval(() => {
        const r = Math.random();
        console.log(r, "sending random number");
        
        ipc.of.mempoolWatcher.emit("message",r);
    }
    , 1000);
}
);