function increaseMassageInGroup(divId){
  // + conver thành số 
  let currentValue = +$(`.right[data-chat=${divId}]`).find("span.show-number-messages").text();
  currentValue += 1;

  $(`.right[data-chat=${divId}]`).find("span.show-number-messages").html(currentValue)
}