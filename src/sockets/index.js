import addNewContact from './contact/addNewContact';
import removeRequestContactSent from './contact/removeRequestContactSent';
import removeRequestContactReceived from './contact/removeRequyestContactReceived';

let initSockets = (io) =>{
  addNewContact(io);
  removeRequestContactSent(io);
  removeRequestContactReceived(io);
}

module.exports = initSockets;