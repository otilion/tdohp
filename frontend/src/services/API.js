import Common from '../services/Common.js'

export default class API {
  static endpoint = process.env.VUE_APP_API_ENDPOINT;

  static call(command, data={}, json=false) {
    let controller = new AbortController();
    let pr = new Promise((resolve, reject) => {
      fetch(this.endpoint + command + "?" + new URLSearchParams(data), controller.signal)
      //.then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)))
      .then((x) => {
        if(!x.ok) throw x;
        return json?x.json():x.text();
      })
      .then((x) => {
        if(controller.signal.aborted) throw {status:0, statusText:"Aborted"};
        resolve(x);
      })
      .catch((x) => {
        if(x.status) Common.showNotif("HTTP "+x.status+" : "+x.statusText, "danger");
        reject(x);
      })
    });
    pr.abort = ()=>{controller.abort()};
    return pr;
  }
  static create(server) {
    return this.call("create", {server: server});
  }
  static config(proxyid) {
    return this.call("config", {proxyid: proxyid});
  }
  static put(proxyid, type, name, data) {
    return this.call("put", {proxyid: proxyid, type: type, name: name, data: data});
  }
  static get(proxyid, type, name) {
    return this.call("get", {proxyid: proxyid, type: type, name: name});
  }
  static delete(proxyid, type, name) {
    return this.call("delete", {proxyid: proxyid, type: type, name: name});
  }
  static list(proxyid, type) {
    return this.call("list", {proxyid: proxyid, type: type}, true);
  }
}