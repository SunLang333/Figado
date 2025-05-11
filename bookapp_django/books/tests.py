from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Book
import tempfile
from PIL import Image
import os

User = get_user_model()

class BookAPITests(TestCase):
    def setUp(self):
        """Set up test data and client."""
        self.client = APIClient()

        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Create a test book
        self.book = Book.objects.create(
            title='Test Book',
            author='Test Author',
            language='English',
            category='Fiction',
            tags='test,api',
            description='A test book for API testing',
            visibility='public',
            user=self.user
        )

        # URLs
        self.list_url = reverse('book-list')
        self.detail_url = reverse('book-detail', args=[self.book.id])

    def test_list_books(self):
        """Test retrieving a list of books."""
        # Authenticate
        self.client.force_authenticate(user=self.user)

        # Get response
        response = self.client.get(self.list_url)

        # Check status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Book')

    def test_retrieve_book(self):
        """Test retrieving a single book."""
        # Authenticate
        self.client.force_authenticate(user=self.user)

        # Get response
        response = self.client.get(self.detail_url)

        # Check status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Book')
        self.assertEqual(response.data['author'], 'Test Author')

    def test_create_book_minimal(self):
        """Test creating a book with minimal required fields."""
        # Authenticate
        self.client.force_authenticate(user=self.user)

        # Data for new book
        data = {
            'title': 'New Test Book',
            'author': 'New Author',
            'language': 'Spanish',
            'category': 'Non-fiction',
        }

        # Create book
        response = self.client.post(self.list_url, data)

        # Check status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.count(), 2)
        self.assertEqual(Book.objects.get(id=response.data['id']).title, 'New Test Book')
