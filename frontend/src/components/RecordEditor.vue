<template>
  <div class="uk-flex-top" uk-modal>
    <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-background-secondary uk-light">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-body">
        <form>
          <fieldset class="uk-fieldset">
            <legend class="uk-legend">{{ edit?"Edit":"Add" }} {{ type==1?"A":"AAAA" }} record</legend>
            <div class="uk-margin">
              <input v-bind:disabled="edit" class="uk-input" type="text" v-model="name" placeholder="Domain name">
            </div>
            <div class="uk-margin">
              <input class="uk-input" type="text" v-model="data" placeholder="IP">
            </div>
          </fieldset>
        </form>
      </div>
      <div class="uk-modal-footer uk-text-right uk-background-secondary">
        <button class="uk-button uk-button-default uk-modal-close" type="button" @click="cancel()">Cancel</button>
        <button class="uk-button uk-button-primary uk-modal-close" type="button" @click="put()">{{ edit?"Edit":"Add" }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import UIkit from 'uikit';
import Common from '../services/Common.js'
import API from '../services/API.js'

export default {
  name: "RecordEditor",
  data() {
    return {
      proxyid: "",
      type: 0,
      edit: false,
      name: "",
      data: "",
      resolve: ()=>{},
      reject: ()=>{},
      abort: ()=>{}
    };
  },
  methods: {
    async show(recordInfo) {
      this.abort();
      this.proxyid = recordInfo.proxyid;
      this.type = recordInfo.type;
      this.edit = recordInfo.edit;
      if(this.edit) {
        this.name = recordInfo.name;
        let getData = API.get(this.proxyid, this.type, this.name);
        this.abort = getData.abort;
        this.data = await getData;
      }else{
        this.name = this.data = "";
      }
      UIkit.modal(this.$el).show();
      return new Promise((resolve, reject) => {this.resolve = resolve; this.reject = reject;});
    },
    put: function() {
      API.put(this.proxyid, this.type, this.name, this.data)
      .then(name => {
        Common.showNotif("Added!");
        this.resolve(name);
      }, ()=>{});
    },
    cancel() {
      this.reject();
    }
  }
}
</script>