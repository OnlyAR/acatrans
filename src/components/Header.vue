<script setup lang="ts">

</script>

<template>
  <v-app-bar :elevation="2">
    <div id="left-pad" />
    <v-avatar image="@/assets/book.svg" rounded="0" />
    <v-app-bar-title id="title" class="font-weight-bold">AcaTrans</v-app-bar-title>
  </v-app-bar>
</template>

<style scoped>
#left-pad {
  padding-left: 20px;
}

#title {
  font-size: 28px;
  color: #06357b;
}
</style>
