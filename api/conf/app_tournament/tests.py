from django.test import TestCase

from .models import Tournament, TournamentPlayer
from player.utils import validate_players, register_players
from match.models import Match, MatchDetail
from .serializers import TournamentSerializer, TournamentPlayerSerializer
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .utils import create_tournament, create_next_tournament_match, create_tournament_dataset, get_tournamentplayer_with_related_data


# class BaseTestSetup(TestCase):


