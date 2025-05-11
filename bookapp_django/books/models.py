from django.db import models
from django.conf import settings
import os
import uuid

def book_file_path(instance, filename):
    """Generate a unique file path for the book."""
    # Get the file extension
    ext = filename.split('.')[-1]
    # Generate a unique filename with UUID
    filename = f"{uuid.uuid4()}.{ext}"
    # Return the complete path
    return os.path.join('books', filename)

def cover_image_upload_path(instance, filename):
    """Generate a unique file path for the cover image using uuid."""
    ext = filename.split('.')[-1]
    # 每本书有唯一uuid，封面放在以uuid命名的子目录下
    if not instance.uuid:
        instance.uuid = uuid.uuid4()
    filename = f"cover.{ext}"
    return os.path.join('book_covers', str(instance.uuid), filename)

class Book(models.Model):
    """Model for book data and metadata."""
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)  # 唯一ID
    
    # Book metadata
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    language = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    tags = models.CharField(max_length=255, blank=True) 
    description = models.TextField(blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    publish_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=20, blank=True)
    page_count = models.IntegerField(null=True, blank=True)
    
    # Book visibility settings
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    allow_comments = models.BooleanField(default=True)
    
    # Book files
    cover_image = models.ImageField(upload_to=cover_image_upload_path, blank=True, null=True)
    book_file = models.FileField(upload_to=book_file_path, null=True)  # For the EPUB file
    
    # Ownership and timestamps
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='books')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rating = models.FloatField(default=0)  # 新增字段，默认0分

    def __str__(self):
        return f"{self.title} by {self.author}"
    
    def delete(self, *args, **kwargs):
        # Delete the book file and cover image when deleting the book
        if self.book_file:
            if os.path.isfile(self.book_file.path):
                os.remove(self.book_file.path)
                
        if self.cover_image:
            if os.path.isfile(self.cover_image.path):
                os.remove(self.cover_image.path)
                
        super().delete(*args, **kwargs)
