<template>
  <code><a class="uk-icon-link" uk-icon="icon: copy" @click="copy"></a> {{ text }}</code>
</template>

<script>
import Common from '../services/Common.js'

export default {
  name: 'Copiable',
  props: ['text'],
  methods: {
    copy() {
      navigator.clipboard.writeText(this.text).then(() => {
        Common.showNotif("Copied to clipboard!");
      }, () => {
        Common.showNotif("Failed to copy to clipboard!", "warning");
      });
    }
  }
}
</script>