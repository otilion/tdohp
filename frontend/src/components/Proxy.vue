<template>
  <div class="uk-margin-medium-bottom uk-margin-medium-top uk-light">
    <hr>
    <a class="uk-align-right" uk-icon="icon: close" @click="remove"></a>
    <h4 v-if="!server">Loading Proxy with ID <copiable :text="id" /> ...</h4>
    <h4 v-if="server=='failed'">Failed to load Proxy with ID <copiable :text="id" />. Most probably it expired.</h4>
    <h4 v-if="server && server!='failed'">Proxy ID <copiable :text="id" /> is available at <copiable :text="access" /> and proxies server <copiable :text="server" /> with the following overwrites:</h4>
  </div>
  <div v-if="server && server!='failed'" class="uk-grid uk-light" uk-grid>
    <div class="uk-width-expand@m uk-width-1-1 uk-flex uk-flex-around">
      <Records type="1" />
    </div>
    <div class="uk-visible@m">
      <hr class="uk-divider-vertical uk-height-1-1">
    </div>
    <div class="uk-width-expand@m uk-width-1-1 uk-flex uk-flex-around">
      <Records type="28" />
    </div>
  </div>
</template>

<script>
import API from '../services/API.js'
import Copiable from '../components/Copiable.vue'
import Records from '../components/Records.vue'

export default {
  name: 'Proxy',
  components: {
    Copiable,
    Records
  },
  props: ['id'],
  data() {
    return {
      server: ""
    }
  },
  methods: {
    remove() {
      if(confirm("Remove proxy with ID " + this.id + "?\nYou will be able to add it back later.")) {
        this.$parent.remove(this.id);
      }
    }
  },
  computed: {
    access: function () {
      return API.endpoint + this.id;
    }
  },
  created() {
      API.config(this.id).then(server => this.server = server, () => this.server = "failed");
  },
}
</script>
