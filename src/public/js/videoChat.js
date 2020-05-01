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

function playVideoStream(videoTagId, stream) {
  let video = document.getElementById(videoTagId);
  video.srcObject = stream;
  video.onloadeddata = function () {
    video.play();
  };
}

function closeVideoSrtream(stream) {
  // getTracks() phương pháp của MediaStreamgiao diện trả về một chuỗi đại diện
  return stream.getTracks().forEach(track => track.stop());
}

$(document).ready(function () {
  // req 2: nếu user2 không online sever bắn thông báo về cho user1
  socket.on("sever-send-listener-is-offline", function () {
    alertify.notify("Không thực hiện được cuộc gọi, người dừng không trực tuyến", "error", 5)
  });

  let getPeerId = "";
  const peer = new Peer({
    key: "peerjs",
    host: "peerjs-server-trungquandev.herokuapp.com",
    secure: true,
    port: 443,
    // debug: 3
  });

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

  let timeInterval;
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
        if (Swal.getContent().querySelector !== null) {
          Swal.showLoading();
          timeInterval = setInterval(() => {
            Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000)
        }
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
        if (Swal.getContent().querySelector !== null) {
          Swal.showLoading();
          timeInterval = setInterval(() => {
            Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000)
        }
      },
      onOpen: () => {
        //req 9: sau khi thực hiện req7 (hủy cuộ gọi từ user1) sever thực hiện hủy cuộc gọi đến user2
        socket.on("server-send-cancel-request-call-to-listener", function (response) {
          Swal.close();
          clearInterval(timeInterval);
        });
      },
      onClose: () => {
        clearInterval(timeInterval);
      }
    }).then((result) => {
      return false
    });
  });

  // req 13: sever gửi req về cả hai phía user1 và user2 (đây là bắn từ sever về user1)
  socket.on("server-send-accept-call-to-caller", function (response) {
    Swal.close();
    clearInterval(timeInterval);
    // lấy từ trang chủ peerjs
    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
    getUserMedia({ video: true, audio: true }, function (stream) {
      // bật modal callvideo
      $("#streamModal").modal("show");
      // hiển thi stream user1 (màn hình nhỏ)
      playVideoStream("local-stream", stream);
      // gọi đến user2
      let call = peer.call(response.listenerPeerId, stream);
      // chờ user2 chấp nhận cuộc gọi
      call.on("stream", function (remoteStream) {
        // hiển thi stream user2 (màn hình lớn)
        playVideoStream("remote-stream", remoteStream);
      });
      // Đóng modal và luồng stream
      $("#streamModal").on("hidden.bs.modal", function () {
        closeVideoSrtream(stream);
        Swal.fire({
          type: "info",
          title: `Đã kết thúc cuộc trò chuyện với &nbsp; <span style="color: #3498DB">${response.listenerName}</span>`,
          backdrop: "rgba(85,85,85,0.4)",
          width: "52rem",
          allowOutsideClick: false,
          confirmButtonColor: "#2ECC71",
          confirmButtonText: "Xác nhận",
        });
      });
    }, function (err) {
      if(err.toString()==="NotAllowedError: Permission denied"){
        alertify.notify("Bạn cần cấp quyền truy cập thiết bị nghe gọi trên trình duyệt của bạn","error",7)
      }
      if(err.toString()==="NotFoundError: Requested device noy found"){
        alertify.notify("Không tìm thấy thiết bị nghe gọi trên trình duyệt của bạn","error",7)
      }
    });
  });

  // req 14: sever gửi req về cả hai phía user1 và user2 (đây là bắn từ sever về user2)
  socket.on("server-send-accept-call-to-listener", function (response) {
    Swal.close();
    clearInterval(timeInterval);
    // lấy từ trang chủ peerjs
    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

    peer.on("call", function (call) {
      getUserMedia({ video: true, audio: true }, function (stream) {
        // bật modal callvideo
        $("#streamModal").modal("show");
        // hiển thi stream user2 (màn hình nhỏ)
        playVideoStream("local-stream", stream);

        call.answer(stream); // Answer the call with an A/V stream.

        call.on("stream", function (remoteStream) {
          // hiển thi stream user1 (màn hình lớn)
          playVideoStream("remote-stream", remoteStream);
        });

        // Đóng modal và luồng stream
        $("#streamModal").on("hidden.bs.modal", function () {
          closeVideoSrtream(stream);
          Swal.fire({
            type: "info",
            title: `Đã kết thúc cuộc trò chuyện với &nbsp; <span style="color: #3498DB">${response.callerName}</span>`,
            backdrop: "rgba(85,85,85,0.4)",
            width: "52rem",
            allowOutsideClick: false,
            confirmButtonColor: "#2ECC71",
            confirmButtonText: "Xác nhận",
          });
        });
      }, function (err) {
        if(err.toString()==="NotAllowedError: Permission denied"){
          alertify.notify("Bạn cần cấp quyền truy cập thiết bị nghe gọi trên trình duyệt của bạn","error",7)
        }
        if(err.toString()==="NotFoundError: Requested device noy found"){
          alertify.notify("Không tìm thấy thiết bị nghe gọi trên trình duyệt của bạn","error",7)
        }
      });
    });
  });
});