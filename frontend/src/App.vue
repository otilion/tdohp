<template>
  <br />
  <div class="uk-container uk-margin-top" uk-height-viewport="expand: true">
    <div class="uk-light">
      <h1 id="title">Temp DoH Proxy</h1>
      <div class="uk-column-1-2 uk-column-divider">
        <p>This service offers you the possibility to create temporary DNS over HTTPS proxies with overwrites rules on a per-domain basis.</p>
        <p>For now, the proxies responds only to HTTPS GET(JSON) queries and can only overwrite A and AAAA types of records.</p>
        <p class="uk-text-warning">Note that proxies expires automatically if they don't receive queries for a period of time.</p>
        <p>For debugging purposes the following web client can be used: <a href="https://dnsclient.net/#//A/HttpsJson" target="new">dnsclient.net</a></p>
      </div>
      <p class="uk-text-center">Currently using API endpoint: <Copiable :text="endpoint" /></p>
    </div>
    <div class="uk-grid uk-light" uk-grid>
      <div class="uk-width-expand@m uk-width-1-1 uk-flex uk-flex-around">
        <div>
          <h3>Create new proxy</h3>
          <div class="uk-inline">
            <span class="uk-form-icon" uk-icon="icon: link"></span>
            <input v-model="server" class="uk-input" placeholder="Server URL (optional)">
          </div>
          <button class="uk-button uk-button-default" @click="create();">Create</button>
        </div>
      </div>
      <div class="uk-visible@m">
        <hr class="uk-divider-vertical uk-height-1-1">
      </div>
      <div class="uk-width-expand@m uk-width-1-1 uk-width-expand uk-flex uk-flex-around">
        <div>
          <h3>Configure existing proxy</h3>
          <div class="uk-inline">
            <span class="uk-form-icon" uk-icon="icon: hashtag"></span>
            <input v-model.trim="proxyid" class="uk-input" placeholder="Proxy ID">
          </div>
          <button class="uk-button uk-button-default" @click="configure">Configure</button>
        </div>
      </div>
    </div>
    <Proxy
      v-for="proxy in proxies"
      :id="proxy"
      :key="proxy"
    />
    <RecordEditor ref="editor" />
    <br />
  </div>
</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
UIkit.use(Icons);

import API from './services/API.js'
import Common from './services/Common.js'
import Proxy from './components/Proxy.vue'
import RecordEditor from './components/RecordEditor.vue'
import Copiable from './components/Copiable.vue'

export default {
  name: 'App',
  components: {
    Proxy,
    RecordEditor,
    Copiable
  },
  data() {
    return {
      endpoint: API.endpoint,
      proxies: JSON.parse(localStorage.proxies || "{}"),
      server: "",
      proxyid: ""
    };
  },
  methods: {
    create() {
      API.create(this.server)
      .then(proxyid => {
        this.proxies[proxyid] = proxyid;
        Common.showNotif("Proxy created!");
      }, ()=>{});
    },
    configure() {
      this.proxies[this.proxyid] = this.proxyid;
    },
    remove(proxyid) {
      delete this.proxies[proxyid];
      Common.showNotif("Proxy removed!");
    }
  },
  watch: {
    proxies: {
      handler(val) {
        localStorage.proxies = JSON.stringify(val);
      },
      deep: true
    }
  }
}
</script>

<style lang="less">
@import "../node_modules/uikit/src/less/uikit.theme.less";
@font-face {
  font-family: title;
  src: url(assets/IrishGrover-Regular.ttf);
}
@font-face {
  font-family: title2;
  src: url(assets/BungeeShade-Regular.ttf);
}

#title {
  font-family: title2;
  font-size: 5vw;
  margin-top: 40px;
  text-align: center;
  color: black;
}
.wbn {
  border: 1px solid white;
  text-align: center;
}
#app {
  background-image: url('assets/background.jpg');
}
#app > div {
  background-color: #222222e6;
  overflow: clip;
}
</style>