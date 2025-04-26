from django.test import TestCase

from .models import Tournament, TournamentPlayer
from player.utils import validate_players, register_players
from match.models import Match, MatchDetail
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


# class BaseTestSetup(TestCase):


