from django.test import TestCase

from .models import Tournament, TournamentPlayer
from player.models import Player
from match.models import Match, MatchDetail
from .serializers import TournamentSerializer, TournamentPlayerSerializer
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from utils import create_tournament, create_next_tournament_match


# class BaseTestSetup(TestCase):
class BaseTestSetup(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create tournaments
        cls.tournament1 = Tournament.objects.create(id = 1, num_of_player = '2', status = 'start')
        cls.tournament2 = Tournament.objects.create(id = 2, num_of_player = '4', status = 'end')
        cls.tournament3 = Tournament.objects.create(id = 3, num_of_player = '8', status = 'start')
        cls.tournament4 = Tournament.objects.create(id = 4, num_of_player = '8', status = 'end')

        # Create players
        cls.players = {}
        for i in range(1, 3):
            cls.players[i] = Player.objects.create(id = i, name = f'P{i}')

class TournamentSerializerTest(BaseTestSetup):
    def test_valid_data(self):
        serializer = TournamentSerializer(data={'num_of_player': 4, 'status': 'start'})
        self.assertTrue(serializer.is_valid(), serializer.errors)
    
    def test_extra_fields(self):
        serializer = TournamentSerializer(data={'num_of_player': 4, 'status': 'start', 'extra_field': 'value'})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_extra_value(self):
      serializer = TournamentSerializer(data={'num_of_player': 4, 'status': ['start', 'end']})
      self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_missing_field(self):
      serializer = TournamentSerializer(data={'status': 'start'})
      self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_invalid_num_of_player(self):
      serializer = TournamentSerializer(data={'num_of_player': 3, 'status': 'start'})
      self.assertFalse(serializer.is_valid(), msg = serializer.errors)
    
    def test_invalid_status(self):
      serializer = TournamentSerializer(data={'num_of_player': 4, 'status': 'invalid'})
      self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_literal_num_of_player(self):
      serializer = TournamentSerializer(data={'num_of_player': '4', 'status': 'start'})
      self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_overlength_status(self):
      serializer = TournamentSerializer(data={'num_of_player': 4, 'status': '12345678901'})
      self.assertFalse(serializer.is_valid(), msg = serializer.errors)

class TournamentPlayerSerializerTest(BaseTestSetup):
    def test_valid_data(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[1].id , 'status': 'await', 'victory_count': 0})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_minus_victory_count(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': 'await', 'victory_count': -1})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_extra_fields(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': 'await', 'victory_count': 0, 'extra_field': 'value'})
        self.assertTrue(serializer.is_valid(), serializer.errors)
    
    def test_missing_field(self):
        serializer = TournamentPlayerSerializer(data={'player_id': self.players[2].id , 'status': 'await', 'victory_count': 0})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_invalid_status(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': 'invalid', 'victory_count': 0})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_invalid_victory_count(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': 'await', 'victory_count': '0'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)  

    def test_overlength_status(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': '12345678901', 'victory_count': 0})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)
    
    def test_tournament_end(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament4.id, 'player_id': self.players[2].id , 'status': 'await', 'victory_count': 0})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

class  LocalTournamentViewTest(APITestCase, BaseTestSetup):
    def test_create_tournament(self):
        players = []
        for i in range(3, 7):
          players[i] = Player.objects.create(id = i, name = f'P{i}')
        tournament, tournament_players = create_tournament(players)
        self.assertEqual(tournament.num_of_player, 4)
        self.assertEqual(tournament.status, 'start')
        self.assertEqual(len(tournament_players), 4)
        for i in range(3, 7):
          self.assertEqual(tournament_players[i].tournament_id, tournament.id)
          self.assertEqual(tournament_players[i].player_id, i)
          self.assertEqual(tournament_players[i].status, 'await')
          self.assertEqual(tournament_players[i].victory_count, 0)
        
    def test_create_tournament_not_enough_players(self):
        players = []
        for i in range(7, 9):
          players[i] = Player.objects.create(id = i, name = f'P{i}')
        with self.assertRaises(ValidationError):
          create_tournament(players)

    def test_create_next_tournament_match(self):
        tournament = Tournament.objects.create(id = 5, num_of_player = '4', status = 'start')
        players = []
        for i in range(9, 13):
          players[i] = Player.objects.create(id = i, name = f'P{i}')
        tournament, _ = create_tournament(players)
        match, matchdetail1, matchdetail2 = create_next_tournament_match(tournament.id)
        self.assertEqual(match.tournament_id, tournament.id)
        self.assertEqual(match.status, 'start')
        self.assertEqual(matchdetail1.match_id, match.id)
        self.assertEqual(matchdetail2.match_id, match.id)
        self.assertEqual(matchdetail1.score, 0)
        self.assertEqual(matchdetail2.score, 0)
        self.assertEqual(matchdetail1.result, 'await')
        self.assertEqual(matchdetail2.result, 'await')
        self.assertEqual(matchdetail1.player_id, 9)
        self.assertEqual(matchdetail2.player_id, 10)
      
    def test_post(self):
        url = reverse('local_tournament')
        data = {'players': ['P1', 'P2']}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    


