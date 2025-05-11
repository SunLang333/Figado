from django.contrib import admin
from .models import Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'user', 'category', 'visibility', 'rating', 'created_at')  # 加入rating
    list_filter = ('visibility', 'category', 'language')
    search_fields = ('title', 'author', 'description', 'tags')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'author', 'language', 'category', 'tags')
        }),
        ('Details', {
            'fields': ('description', 'publisher', 'publish_date', 'isbn', 'page_count', 'rating')  # 加入rating
        }),
        ('Settings', {
            'fields': ('visibility', 'allow_comments')
        }),
        ('Files', {
            'fields': ('cover_image', 'book_file')
        }),
        ('Metadata', {
            'fields': ('user', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
