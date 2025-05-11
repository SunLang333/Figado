<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click.stop="$emit('toggle-drawer')" />
    <v-toolbar-title>BookApp</v-toolbar-title>
    <v-spacer />
    <v-btn text to="/">Home</v-btn>
    <!-- Add more navigation links here if needed -->
  </v-app-bar>
</template>

<script setup lang="ts">
// No script needed for this simple NavBar,
// but defineEmits is good practice if the parent component needs to react to events.
defineEmits(['toggle-drawer'])
</script>

<style scoped>
.v-toolbar-title {
  cursor: pointer;
}
</style>
