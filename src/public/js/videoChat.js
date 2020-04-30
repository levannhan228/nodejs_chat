function videoChat(divId) {
  $(`#video-chat-${divId}`).unbind("click").on("click", function () {
    let targetId = $(this).data("chat");
    let callerName = $("#navbar-username").text();

    let dataToEmit = {
      listenerId: targetId,
      callerName: callerName
    };
    // req 1:  kiểm tra xem người cần gọi có online
    socket.emit("caller-check-listener-online-or-not", dataToEmit)
  });
}

$(document).ready(function () {
  // req 2: nếu user2 không online sever bắn thông báo về cho user1
  socket.on("sever-send-listener-is-offline", function () {
    alertify.notify("Không thực hiện được cuộc gọi, người dừng không trực tuyến", "error", 5)
  });

  let getPeerId = "";
  const peer = new Peer();
  // console.log(peer)
  peer.on("open", function (peerId) {
    getPeerId = peerId;
  })
  // req 3: server đòi peerid và một số data của user2
  socket.on("server-request-peer-id-of-listener", function (response) {
    let listenerName = $("#navbar-username").text();
    let dataToEmit = {
      callerId: response.callerId,
      listenerId: response.listenerId,
      callerName: response.callerName,
      listenerName: listenerName,
      listenerPeerId: getPeerId
    };
    // req 4: user2 gửi data và peerid về sever 
    socket.emit("listener-emit-peer-id-to-server", dataToEmit);
  });
  // req 5: sever gửi peerid của user2 cho user1
  socket.on("server-send-peer-id-of-listener-to-caller", function (response) {
    let dataToEmit = {
      callerId: response.callerId,
      listenerId: response.listenerId,
      callerName: response.callerName,
      listenerName: response.listenerName,
      listenerPeerId: response.listenerPeerId
    };
    // req 6: user1 gọi đến server
    socket.emit("caller-request-call-to-server", dataToEmit);

    let timeInterval;
    Swal.fire({
      title: `Đang gọi cho &nbsp; <span style="color: #3498DB">${response.listenerName}</span> &nbsp; <i class="fa fa-volume-control-phone"></i>`,
      html: `Thời gian: <strong  style="color: #3498DB"></strong> giây <br/> <br/>
              <button id="btn-cancel-call" class="btn btn-danger">
              Kết thúc cuộc gọi
              </button>`,
      backdrop: "rgba(85,85,85,0.4)",
      width: "52rem",
      allowOutsideClick: false,
      timer: 30000,
      onBeforeOpen: () => {
        $("#btn-cancel-call").unbind("click").on("click", function () {
          Swal.close();
          clearInterval(timeInterval);
          // req 7 : có thể hủy nếu yêu cầu gọi nếu user2 chưa chấp nhận cuộc gọi
          socket.emit("caller-cancel-request-call-to-sever", dataToEmit);
        });
        Swal.showLoading();
        timeInterval = setInterval(() => {
          Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
        }, 1000)
      },
      onOpen: () => {
        //req 12: sever bắn req về user 1 rằng user2 từ chối chat video
        socket.on("server-send-reject-call-to-caller", function (response) {
          Swal.close();
          clearInterval(timeInterval);
          Swal.fire({
            type: "info",
            title: `<span style="color: #3498DB">${response.listenerName}</span> &nbsp; đã từ chối cuộc gọi`,
            backdrop: "rgba(85,85,85,0.4)",
            width: "52rem",
            allowOutsideClick: false,
            confirmButtonColor: "#2ECC71",
            confirmButtonText: "Xác nhận",
          });
        });
        // req 13: sever gửi req về cả hai phía user1 và user2 (đây là bắn từ sever về user1)
        socket.on("server-send-accept-call-to-caller", function (response) {
          Swal.close();
          clearInterval(timeInterval);
          console.log("goi thanh cong");
        });
      },
      onClose: () => {
        clearInterval(timeInterval);
      }
    }).then((result) => {
      return false
    });
  });
  // req 8: sever gọi cho user2 sau khi txử lý thành công req 6 
  socket.on("server-send-request-call-listener", function (response) {
    let dataToEmit = {
      callerId: response.callerId,
      listenerId: response.listenerId,
      callerName: response.callerName,
      listenerName: response.listenerName,
      listenerPeerId: response.listenerPeerId
    };
    let timeInterval;
    Swal.fire({
      title: `Cuộc gọi đến từ &nbsp <span style="color: #3498DB">${response.callerName}</span> &nbsp; <i class="fa fa-volume-control-phone"></i>`,
      html: `Thời gian: <strong  style="color: #3498DB"></strong> giây <br/> <br/>
              <button id="btn-reject-call" class="btn btn-danger">
                Từ chối
              </button>
              <button id="btn-accept-call" class="btn btn-success">
                Đồng ý
              </button>
              `,

      backdrop: "rgba(85,85,85,0.4)",
      width: "52rem",
      allowOutsideClick: false,
      timer: 30000,
      onBeforeOpen: () => {
        // trường hợp từ chối cuộc gọi đến
        $("#btn-reject-call").unbind("click").on("click", function () {
          Swal.close();
          clearInterval(timeInterval);
          //req 10: user2 từ chối cuộc gọi bắn req về sever
          socket.emit("listener-reject-request-call-to-server", dataToEmit)
        });
        // trường hợp chấp nhận cuộc gọi đến
        $("#btn-accept-call").unbind("click").on("click", function () {
          Swal.close();
          clearInterval(timeInterval);
          //req 11: user2 chấp nhận cuộc gọi bắn req về sever
          socket.emit("listener-accept-request-call-to-server", dataToEmit)
        });
        Swal.showLoading();
        timeInterval = setInterval(() => {
          Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
        }, 1000)
      },
      onOpen: () => {
        //req 9: sau khi thực hiện req7 (hủy cuộ gọi từ user1) sever thực hiện hủy cuộc gọi đến user2
        socket.on("server-send-cancel-request-call-to-listener", function (response) {
          Swal.close();
          clearInterval(timeInterval);
        });
        // req 14: sever gửi req về cả hai phía user1 và user2 (đây là bắn từ sever về user2)
        socket.on("server-send-accept-call-to-listener", function (response) {
          Swal.close();
          clearInterval(timeInterval);
          console.log("nghe thanh cong");
        });
      },
      onClose: () => {
        clearInterval(timeInterval);
      }
    }).then((result) => {
      return false
    });
  });

});