from django.test import TestCase

from tournament.models import Tournament, TournamentPlayer
from player.models import Player
from .models import Match, MatchDetail
from .serializers import MatchSerializer, MatchDetailSerializer
from django.contrib.auth.models import User

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


# class BaseTestSetup(TestCase):
