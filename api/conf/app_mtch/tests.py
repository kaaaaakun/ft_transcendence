from django.test import TestCase

from tmt.models import Tournament, TournamentPlayer
from plyr.models import Player
from .models import Match, MatchDetail
from .serializers import MatchSerializer, MatchDetailSerializer

class BaseTestSetup(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create tournaments
        cls.tournament1 = Tournament.objects.create(id = 1, num_of_player = '2', status = 'start')
        cls.tournament2 = Tournament.objects.create(id = 2, num_of_player = '4', status = 'end')
        cls.tournament3 = Tournament.objects.create(id = 3, num_of_player = '8', status = 'start')

        # Create players
        cls.players = {}
        for i in range(1, 9):
            cls.players[i] = Player.objects.create(id = i, name = f'P{i}')
        
        # Create tournamentplayers
        cls.tournamentplayers = {}
        for i in range(1, 3):
            cls.tournamentplayers[i] = TournamentPlayer.objects.create(player_id = cls.players[i], tournament_id = cls.tournament1, victory_count = 0, status = 'await')
        for i in range(3, 7):
            cls.tournamentplayers[i] = TournamentPlayer.objects.create(player_id = cls.players[i], tournament_id = cls.tournament2, victory_count = 0, status = 'await')
        for i in range(1, 9):
            cls.tournamentplayers[i] = TournamentPlayer.objects.create(player_id = cls.players[i], tournament_id = cls.tournament3, victory_count = 0, status = 'await')

        # Create matches
        cls.matches = {}
        cls.matches[1] = Match.objects.create(tournament_id = cls.tournament1, status = 'start')
        cls.matches[2] = Match.objects.create(tournament_id = cls.tournament3, status = 'start')
        cls.matches[3] = Match.objects.create(tournament_id = cls.tournament1, status = 'end')

        # Create matchdetails
        cls.matchdetails = {}
        cls.matchdetails[1] = MatchDetail.objects.create(match_id = cls.matches[1], player_id = cls.players[1], score = 0, result = 'await')
        cls.matchdetails[2] = MatchDetail.objects.create(match_id = cls.matches[1], player_id = cls.players[2], score = 0, result = 'await')

class MatchSerializerTests(BaseTestSetup):
    def test_valid_data(self):
        serializer = MatchSerializer(data={'tournament_id': self.tournament1.id, 'status': 'start'})
        self.assertTrue(serializer.is_valid(), msg = serializer.errors)

    def test_extra_field(self):
        serializer = MatchSerializer(data={'tournament_id': self.tournament1.id, 'status': 'start', 'extra_field': 'value'})
        self.assertTrue(serializer.is_valid(), msg = serializer.errors)
    
    def test_extra_value(self):
        serializer = MatchSerializer(data={'tournament_id': self.tournament1.id, 'status': ['start', 'end']})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_missing_field(self):
        serializer = MatchSerializer(data={'status': 'start'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_nonexistent_tournament(self):
        serializer = MatchSerializer(data={'tournament_id': 9999, 'status': 'start'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    def test_literal_tournament(self):
        serializer = MatchSerializer(data={'tournament': 'invalid', 'status': 'start'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)
    
    # def test_ended_tournament(self):
    #     serializer = MatchSerializer(data={'tournament_id': self.tournament2.id, 'status': 'start'})
    #     self.assertFalse(serializer.is_valid(), msg = serializer.errors)

    # def test_invalid_status(self):
    #     serializer = MatchSerializer(data={'tournament': self.tournament1.id, 'status': 'invalid'})
    #     self.assertFalse(serializer.is_valid())

    def test_overlength_status(self):
        serializer = MatchSerializer(data={'tournament_id': self.tournament1.id, 'status': '12345678901'})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)
    
    def test_empty_status(self):
        serializer = MatchSerializer(data={'tournament_id': self.tournament1.id, 'status': ''})
        self.assertFalse(serializer.is_valid(), msg = serializer.errors)

class MatchDetailSerializerTests(BaseTestSetup):
    def test_valid_data(self):
        serializer = MatchDetailSerializer(data={'match_id': self.matches[1].id, 'player_id': self.players[1].id, 'score': 0, 'result': 'await'})
        self.assertTrue(serializer.is_valid(), msg = serializer.errors)

