<script setup lang="ts">

</script>

<template>
  <v-app-bar :elevation="2">
    <div class="pad" />
    <v-avatar image="@/assets/book.svg" rounded="0" />
    <v-app-bar-title id="title" class="font-weight-bold">AcaTrans</v-app-bar-title>
    <v-spacer />
    <v-btn href="https://github.com/OnlyAR/acatrans" size="40">
      <v-icon size="40">mdi-github</v-icon>
    </v-btn>
    <div class="pad" />
  </v-app-bar>
</template>

<style scoped>
.pad {
  padding-left: 20px;
}

#title {
  font-size: 28px;
  color: #06357b;
}
</style>
