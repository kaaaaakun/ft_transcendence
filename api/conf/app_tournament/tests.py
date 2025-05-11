from django.test import TestCase

from .models import Tournament, TournamentPlayer
from user.models import User
from user.tests import create_test_user_4, create_test_user_8

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

def create_test_tournament_4_players():
    users = create_test_user_4()
    tournament = create_test_tournament_4()
    return TournamentPlayer.create_tournament_players(tournament, users)

def create_test_tournament_8_players():
    users = create_test_user_8()
    tournament = create_test_tournament_8()
    return TournamentPlayer.create_tournament_players(tournament, users)

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

class TournamentPlayerTestCase(TestCase):
    def test_create_tournament_4_players(self):
        tournamentPlayers = create_test_tournament_4_players()
        self.assertEqual(len(tournamentPlayers), 4)
        for i, tournamentPlayer in enumerate(tournamentPlayers):
            self.assertEqual(tournamentPlayer.entry_number, i)
            self.assertEqual(tournamentPlayer.round, 1)
    
    def test_create_tournament_8_players(self):
        tournamentPlayers = create_test_tournament_8_players()
        self.assertEqual(len(tournamentPlayers), 8)
        for i, tournamentPlayer in enumerate(tournamentPlayers):
            self.assertEqual(tournamentPlayer.entry_number, i)
            self.assertEqual(tournamentPlayer.round, 1)
