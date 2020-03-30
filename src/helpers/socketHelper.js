export let pushSocketIdToArray = (clients, userId, socketId) => {
  if (clients[userId]) {
    clients[userId].push(socketId);
  } else {
    //chạy đầu tiên khi run server
    clients[userId] = [socketId];
  }
  return clients;
};

export let emitNotifyToArray = (clients, userId, io, enventName, data) => {
  clients[userId].forEach(socketId => {
    return io.sockets.connected[socketId].emit(enventName, data);
  })
};

export let removeSocketIdFromArray = (clients, userId, socket) => {
  clients[userId] = clients[userId].filter((socketId) => {
    return socketId !== socket.id
  });

  if (!clients[userId].length) {
    delete clients[userId];
  }
  return clients;
};