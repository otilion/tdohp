import UIkit from 'uikit';

export default class Common {
  static showNotif(message, status="success") {
    UIkit.notification({message: message, status: status + ' uk-background-secondary wbn', pos: 'bottom-center', timeout: 4000});
  }
}