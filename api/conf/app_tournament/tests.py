from django.test import TestCase

from .models import Tournament, TournamentPlayer
from player.models import Player
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
class BaseTestSetup(APITestCase):
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
      serializer = TournamentSerializer(data={'num_of_player': 'string', 'status': 'start'})
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
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': 'await', 'victory_count': 'string'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)  

    def test_overlength_status(self):
        serializer = TournamentPlayerSerializer(data={'tournament_id': self.tournament1.id, 'player_id': self.players[2].id , 'status': '12345678901', 'victory_count': 0})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    
class LocalTournamentViewTest(APITestCase):
    def test_two_palyers(self):
        Tournament.objects.all().delete()
        TournamentPlayer.objects.all().delete()
        Player.objects.all().delete()
        Match.objects.all().delete()
        MatchDetail.objects.all().delete()
        url = reverse('local_tournament')
        data = {'players': ['P1', 'P2']}
        response = self.client.post(url, data, format='json')
        expected_data = {
            'participants': [
                {
                    'player': {'name': 'P1'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': True
                },
                {
                    'player': {'name': 'P2'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': True
                },
            ]
        }
        self.assertEqual(
          sorted(response.data['participants'], key=lambda x: x['player']['name']),
          sorted(expected_data['participants'], key=lambda x: x['player']['name'])
        )
        post_response_tournament_id = response.data['tournament_id']
        
        cookie = f'tournament_id={response.data["tournament_id"]}'
        response = self.client.get(url, HTTP_COOKIE=cookie)
        self.assertEqual(
          sorted(response.data['participants'], key=lambda x: x['player']['name']),
          sorted(expected_data['participants'], key=lambda x: x['player']['name'])
        )
        self.assertEqual(response.data['tournament_id'], post_response_tournament_id)
    
    def test_four_players(self):
        Tournament.objects.all().delete()
        TournamentPlayer.objects.all().delete()
        Player.objects.all().delete()
        Match.objects.all().delete()
        MatchDetail.objects.all().delete()
        player_names = ['P1', 'P2', 'P3', 'P4']
        players = register_players(validate_players(player_names))
        tournament, tournament_players = create_tournament(players)
        self.assertEqual(tournament.num_of_player, 4)
        self.assertEqual(tournament.status, 'start')
        for i in range(4):
            self.assertEqual(tournament_players[i].tournament_id.id, tournament.id)
            self.assertEqual(tournament_players[i].player_id.name, f'P{i+1}')
            self.assertEqual(tournament_players[i].status, 'await')
            self.assertEqual(tournament_players[i].victory_count, 0)
        match, matchdetail1, matchdetail2 = create_next_tournament_match(tournament.id)
        self.assertEqual(match.status, 'start')
        self.assertEqual(matchdetail1.player_id.name, 'P1')
        self.assertEqual(matchdetail2.player_id.name, 'P2')
        self.assertEqual(matchdetail1.score, 0)
        self.assertEqual(matchdetail2.score, 0)
        self.assertEqual(matchdetail1.result, 'await')
        self.assertEqual(matchdetail2.result, 'await')
        response_data = create_tournament_dataset(get_tournamentplayer_with_related_data(tournament.id))
        expected_data = {
            'participants': [
                {
                    'player': {'name': 'P1'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': True
                },
                {
                    'player': {'name': 'P2'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': True
                },
                {
                    'player': {'name': 'P3'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
                {
                    'player': {'name': 'P4'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
            ],
            'tournament_id': 1
        }
        self.assertEqual(
          sorted(response_data['participants'], key=lambda x: x['player']['name']),
          sorted(expected_data['participants'], key=lambda x: x['player']['name'])
        )

    def test_eight_players(self):
        Tournament.objects.all().delete()
        TournamentPlayer.objects.all().delete()
        Player.objects.all().delete()
        Match.objects.all().delete()
        MatchDetail.objects.all().delete()
        player_names = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']
        players = register_players(validate_players(player_names))
        tournament, tournament_players = create_tournament(players)
        self.assertEqual(tournament.num_of_player, 8)
        self.assertEqual(tournament.status, 'start')
        for i in range(8):
            self.assertEqual(tournament_players[i].tournament_id.id, tournament.id)
            self.assertEqual(tournament_players[i].player_id.name, f'P{i+1}')
            self.assertEqual(tournament_players[i].status, 'await')
            self.assertEqual(tournament_players[i].victory_count, 0)
        match, matchdetail1, matchdetail2 = create_next_tournament_match(tournament.id)
        self.assertEqual(match.status, 'start')
        self.assertEqual(matchdetail1.player_id.name, 'P1')
        self.assertEqual(matchdetail2.player_id.name, 'P2')
        self.assertEqual(matchdetail1.score, 0)
        self.assertEqual(matchdetail2.score, 0)
        self.assertEqual(matchdetail1.result, 'await')
        self.assertEqual(matchdetail2.result, 'await')
        response_data = create_tournament_dataset(get_tournamentplayer_with_related_data(tournament.id))
        expected_data = {
            'participants': [
                {
                    'player': {'name': 'P1'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': True
                },
                {
                    'player': {'name': 'P2'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': True
                },
                {
                    'player': {'name': 'P3'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
                {
                    'player': {'name': 'P4'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
                {
                    'player': {'name': 'P5'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
                {
                    'player': {'name': 'P6'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
                {
                    'player': {'name': 'P7'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
                {
                    'player': {'name': 'P8'},
                    'tournament_players': {'victory_count': 0},
                    'next_player': False
                },
            ],
            'tournament_id': 1
        }
        self.assertEqual(
            sorted(response_data['participants'], key=lambda x: x['player']['name']),
            sorted(expected_data['participants'], key=lambda x: x['player']['name'])
        )
