<template>
  <div>
    <table class="uk-table uk-table-hover uk-table-middle uk-table-divider">
      <thead>
        <tr>
          <th class="uk-table-shrinks"></th>
          <th class="uk-table-expand">{{ type==1 ? "A" : "AAAA" }} records</th>
          <th class="uk-table-shrinks"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="name in nameList" :key=name>
          <td><input class="uk-checkbox" type="checkbox" :value="name" v-model="checkList"></td>
          <td class="uk-text-truncate">{{ name }}</td>
          <td>
            <a class="uk-link-reset" @click="edit(name)"><span uk-icon="icon: pencil"></span></a>
          </td>
        </tr>
      </tbody>
    </table>
    <button class="uk-button uk-button-default" @click="del()">Delete selected</button>
    <button class="uk-button uk-button-default" @click="add()">Add</button>
  </div>
</template>

<script>
import API from '../services/API.js'
import Common from '../services/Common.js'

export default {
  name: 'Records',
  props: ['type'],
  data() {
    return {
      checkList: [],
      nameList: {}
   }
  },
  created() {
    this.fetch();
  },
  methods: {
    fetch() {
      API.list(this.$parent.id, this.type).then(list => {
        list.forEach(record => {
          let name = record.name.split(",")[3];
          this.nameList[name]=name;
        });
      }, () => {});
    },
    add() {
      this.$root.$refs.editor
      .show({proxyid: this.$parent.id, type: this.type, edit: false})
      .then(name => this.nameList[name]=name, () => {});
    },
    edit(name) {
      this.$root.$refs.editor
      .show({proxyid: this.$parent.id, type: this.type, name: name, edit: true})
      .then(() => Common.showNotif("Edited"), () => {});
    },
    del() {
      this.checkList.forEach((name) => {
        API.delete(this.$parent.id, this.type, name).then(() => {
          delete this.nameList[name];
          delete this.checkList[name];
          Common.showNotif("Deleted");
        }, ()=>{});
      });
    }
  }
}
</script>