from django.test import TestCase

from .models import Tournament, TournamentPlayer
from match.models import Match, MatchDetail
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

#---------------
# Helper function to create Data
#---------------
def create_test_tournament_4():
    return Tournament.objects.create(type = 4)

def create_test_tournament_8():  
    return Tournament.objects.create(type = 8)


#--------------
# Test cases for Tournament model
#--------------
class TournamentTestCase(TestCase):
    def test_create_tournament_4(self):
        tournament = create_test_tournament_4()
        self.assertIsInstance(tournament, Tournament)
        self.assertEqual(tournament.type, 4)

    def test_create_tournament_8(self):
        tournament = create_test_tournament_8()
        self.assertIsInstance(tournament, Tournament)
        self.assertEqual(tournament.type, 8)

    def test_update_status(self):
        tournament = create_test_tournament_4()
        Tournament.update_status(tournament)
        self.assertTrue(tournament.is_finished)
