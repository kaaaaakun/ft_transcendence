from django.test import TestCase
from django.core.exceptions import ValidationError

from user.models import User
from .models import Match, MatchDetail
from tournament.tests import create_test_tournament_4, create_test_tournament_8

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

#---------------
# Helper function to create Data
#---------------
def create_test_match_tournament_4():
    tournament = create_test_tournament_4()
    return Match.create_for_tournament(tournament)

def create_test_match_tournament_8():
    tournament = create_test_tournament_8()
    return Match.create_for_tournament(tournament)

def create_test_match_simple():
    return Match.objects.create()

#--------------
# Test cases for Match model
#--------------
class MatchTestCase(TestCase):
    def test_create_simple_match(self):
        match = create_test_match_simple()
        self.assertIsInstance(match, Match)
        self.assertIsNone(match.tournament)

    def test_create_tournament4_match(self):
        match = create_test_match_tournament_4()
        self.assertIsInstance(match, Match)

    def test_create_tournament8_match(self):
        match = create_test_match_tournament_8()
        self.assertIsInstance(match, Match)

    def test_is_finished(self):
        match = create_test_match_tournament_4()
        match = Match.update_is_finished(match)
        self.assertTrue(match.is_finished)

    def test_tx_status_unexpected(self):
        match = create_test_match_tournament_4()
        with self.assertRaises(ValidationError):
            Match.update_tx_status(match, 'unexpected_status')

    def test_tx_status_success(self):
        match = create_test_match_tournament_4()
        match = Match.update_tx_status(match, 'success')
        self.assertEqual(match.tx_status, 'success')
