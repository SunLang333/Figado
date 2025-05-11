<template>
  <v-container class="my-8">
    <v-row>
      <v-col class="text-center mb-6" cols="12">
        <h1 class="text-h3 font-weight-bold">BookApp</h1>
        <p class="text-subtitle-1">Discover and manage your book collection</p>
      </v-col>

      <v-col cols="12" lg="4" md="6">
        <v-text-field
          v-model="search"
          clearable
          dense
          label="Search Books"
          outlined
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="book in filteredBooks"
        :key="book.id"
        cols="12"
        md="4"
        sm="6"
      >
        <v-card class="mx-auto" max-width="344">
          <v-img height="200px" :src="book.cover" />
          <v-card-title>{{ book.title }}</v-card-title>
          <v-card-subtitle>{{ book.author }}</v-card-subtitle>
          <v-card-text>{{ book.description }}</v-card-text>
          <v-card-actions>
            <v-btn color="primary" text>View</v-btn>
            <v-spacer />
            <v-btn icon>
              <v-icon>mdi-bookmark-outline</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  cover: string;
}

const search = ref("");
const books = ref<Book[]>([
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A classic novel set in the Jazz Age on Long Island.",
    cover: "https://picsum.photos/seed/book1/300/200",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    description: "Dystopian novel about a totalitarian future.",
    cover: "https://picsum.photos/seed/book2/300/200",
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A novel of warmth and humor despite serious themes.",
    cover: "https://picsum.photos/seed/book3/300/200",
  },
  // add more books here...
]);

const filteredBooks = computed(() => {
  if (!search.value) return books.value;
  const term = search.value.toLowerCase();
  return books.value.filter(
    (b) =>
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term),
  );
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
}
</style>
