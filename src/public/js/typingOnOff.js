function typingOn(divId) {
  let targetId = $(`#write-chat-${divId}`).data("chat");
  if ($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
    socket.emit("some-one-chat", { groupId: targetId });
  } else {
    socket.emit("some-one-chat", { contactId: targetId });
  }
}
function typingOff(divId) {
  let targetId = $(`#write-chat-${divId}`).data("chat");
  if ($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
    socket.emit("some-one-not-chat", { groupId: targetId });
  } else {
    socket.emit("some-one-not-chat", { contactId: targetId });
  }
}

$(document).ready(function () {

  socket.on("response-some-one-chat", function (response) {
    let messageTyping = `<div class="bubble you bubble-typing-gif">
      <img src="/images/chat/typing.gif"/>
    </div>`;
    if (response.currentGroupId) {
      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        let checkTyping = $(`.chat[data-chat=${response.currentGroupId}]`).find("div.bubble-typing-gif");
        if (checkTyping.length) {
          return false;
        }
        $(`.chat[data-chat=${response.currentGroupId}]`).append(messageTyping);
        nineScrollRight(response.currentGroupId);
      }
    } else {
      let checkTyping = $(`.chat[data-chat=${response.currentUserId}]`).find("div.bubble-typing-gif");
      if (checkTyping.length) {
        return false;
      }
      $(`.chat[data-chat=${response.currentUserId}]`).append(messageTyping);
      nineScrollRight(response.currentUserId);
    }
  });

  socket.on("response-some-one-not-chat", function (response) {
    if (response.currentGroupId) {
      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        $(`.chat[data-chat=${response.currentGroupId}]`).find("div.bubble-typing-gif").remove();
        nineScrollRight(response.currentGroupId)
      }
    } else {
      $(`.chat[data-chat=${response.currentUserId}]`).find("div.bubble-typing-gif").remove();
      nineScrollRight(response.currentUserId);
    }
  });
});