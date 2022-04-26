import ipc from "node-ipc";

ipc.config.id = 'mempoolWatcher';
ipc.config.retry = 1500;


ipc.serve(() => {
  ipc.server.on('message', (data, socket) => {
    console.log('Asking', data);
    ipc.server.broadcast("x", data);
  });
});

ipc.server.start();