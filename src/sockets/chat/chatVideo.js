import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from './../../helpers/socketHelper'
let chatVideo = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    //thêm soket id vào array mỗi khi mở tab or reset 
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    socket.request.user.chatGroupIds.forEach(group => {
      clients = pushSocketIdToArray(clients, group._id, socket.id);
    });

    // khi tạo group chat để xử lý real-time các xử lí chat cần nhận được id group và socketid của các thành viên để xử lí
    socket.on("new-group-created", (data) => {
      clients = pushSocketIdToArray(clients, data.groupChat._id, socket.id);
    });
    socket.on("member-received-group-chat",(data) =>{
      clients = pushSocketIdToArray(clients, data.groupChatId, socket.id);
    });
    
    socket.on("caller-check-listener-online-or-not", (data) => {
      if(clients[data.listenerId]){
        // online
        let response = {
          callerId: socket.request.user._id,
          listenerId: data.listenerId,
          callerName: data.callerName
        };

        emitNotifyToArray(clients, data.listenerId, io, "server-request-peer-id-of-listener",response);
      }else{
        // offline
        socket.emit("sever-send-listener-is-offline")
      }
    });

    socket.on("listener-emit-peer-id-to-server", (data) => {
      let response = {
        callerId: data.callerId,
        listenerId: data.listenerId,
        callerName: data.callerName,
        listenerName: data.listenerName,
        listenerPeerId: data.listenerPeerId
      };
      if(clients[data.callerId]){
        emitNotifyToArray(clients, data.callerId, io, "server-send-peer-id-of-listener-to-caller",response);
      }
    });

    socket.on("caller-request-call-to-server", (data) => {
      let response = {
        callerId: data.callerId,
        listenerId: data.listenerId,
        callerName: data.callerName,
        listenerName: data.listenerName,
        listenerPeerId: data.listenerPeerId
      }
      if(clients[data.listenerId]){
        emitNotifyToArray(clients, data.listenerId, io, "server-send-request-call-listener",response);
      }
    });

    socket.on("caller-cancel-request-call-to-sever", (data) => {
      let response = {
        callerId: data.callerId,
        listenerId: data.listenerId,
        callerName: data.callerName,
        listenerName: data.listenerName,
        listenerPeerId: data.listenerPeerId
      }
      if(clients[data.listenerId]){
        emitNotifyToArray(clients, data.listenerId, io, "server-send-cancel-request-call-to-listener",response);
      }
    });

    socket.on("listener-reject-request-call-to-server", (data) => {
      let response = {
        callerId: data.callerId,
        listenerId: data.listenerId,
        callerName: data.callerName,
        listenerName: data.listenerName,
        listenerPeerId: data.listenerPeerId
      }
      if(clients[data.callerId]){
        emitNotifyToArray(clients, data.callerId, io, "server-send-reject-call-to-caller",response);
      }
    });

    socket.on("listener-accept-request-call-to-server", (data) => {
      let response = {
        callerId: data.callerId,
        listenerId: data.listenerId,
        callerName: data.callerName,
        listenerName: data.listenerName,
        listenerPeerId: data.listenerPeerId
      }
      if(clients[data.callerId]){
        emitNotifyToArray(clients, data.callerId, io, "server-send-accept-call-to-caller",response);
      }
      if(clients[data.listenerId]){
        emitNotifyToArray(clients, data.listenerId, io, "server-send-accept-call-to-listener",response);
      }
    });

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
      socket.request.user.chatGroupIds.forEach(group => {
        clients = removeSocketIdFromArray(clients, group._id, socket);
      });
    });

    // console.log(clients)
  });
};

module.exports = chatVideo;