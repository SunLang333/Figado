from rest_framework import serializers
from .models import Book
import os
import magic

class BookSerializer(serializers.ModelSerializer):
    """Serializer for the Book model."""
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'language', 'category', 'tags',
            'description', 'publisher', 'publish_date', 'isbn', 
            'page_count', 'visibility', 'allow_comments', 'cover_image',
            'book_file', 'user', 'created_at', 'updated_at', 'rating'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_book_file(self, value):
        """
        Validate that the uploaded file is an EPUB file.
        """
        if not value:
            return value
            
        # Check file extension
        ext = os.path.splitext(value.name)[1].lower()
        if ext != '.epub':
            raise serializers.ValidationError("Only EPUB files are allowed.")
        
        # Check file mimetype (requires python-magic)
        try:
            file_mime = magic.from_buffer(value.read(1024), mime=True)
            # Reset file pointer after reading
            value.seek(0)
            
            # Valid EPUB mime types
            valid_mimes = ['application/epub+zip', 'application/octet-stream']
            if file_mime not in valid_mimes:
                raise serializers.ValidationError(f"Invalid file type. Expected EPUB, got {file_mime}")
                
        except ImportError:
            # If python-magic is not installed, fallback to extension check only
            pass
            
        return value

class BookListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing books."""
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'category', 'cover_image',
            'visibility', 'user', 'created_at', 'updated_at', 'rating'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
