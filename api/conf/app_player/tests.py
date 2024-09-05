from django.test import TestCase

from .models import players
from .serializers import playersSerializer

from django.urls import reverse
from rest_framework import status

class playersSerializerTests(TestCase):
    def test_valid_data(self):
        serializer = playersSerializer(data={'name': 'test'})
        self.assertTrue(serializer.is_valid(), msg = serializer.errors)
    
    def test_space_data(self):
        serializer = playersSerializer(data={'name': ' '})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_blank_data(self):
        serializer = playersSerializer(data={'name': ''})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_not_allowed_characters(self):
        serializer = playersSerializer(data={'name': '<test>'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_extra_field(self):
        serializer = playersSerializer(data={'name': 'test', 'extra_field': 'value'})
        self.assertTrue(serializer.is_valid(), msg = serializer.errors)

    def test_too_long_data(self):
        serializer = playersSerializer(data={'name': 'a'*51})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_extra_value(self):
        serializer = playersSerializer(data={'name': ['test', 'test2']})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    