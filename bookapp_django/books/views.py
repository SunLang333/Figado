from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import Book
from .serializers import BookSerializer, BookListSerializer
import os

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            # Check if the book is public or private
            if obj.visibility == 'public':
                return True
            # Allow access if the user is the owner
            return obj.user == request.user
        
        # Write permissions are only allowed to the owner of the book.
        return obj.user == request.user

class BookViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions for books.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'description', 'tags', 'category']
    ordering_fields = ['title', 'author', 'created_at', 'updated_at']
    
    def get_serializer_class(self):
        """
        Use a different serializer for list actions.
        """
        if self.action == 'list':
            return BookListSerializer
        return BookSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all books for current user
        and public books from other users.
        """
        user = self.request.user
        # For public books, include user's own books regardless of visibility
        return Book.objects.filter(user=user) | Book.objects.filter(visibility='public')
    
    def perform_create(self, serializer):
        """
        Set the user automatically when creating a book.
        """
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Custom action to download the book file.
        """
        book = self.get_object()  # This will check permissions
        
        if not book.book_file:
            return Response(
                {"error": "No book file available"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_path = book.book_file.path
        
        if os.path.exists(file_path):
            response = FileResponse(
                open(file_path, 'rb'),
                content_type='application/epub+zip'
            )
            response['Content-Disposition'] = f'attachment; filename="{book.title}.epub"'
            return response
        
        return Response(
            {"error": "File not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
