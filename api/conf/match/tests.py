from django.test import TestCase
from django.core.exceptions import ValidationError

from .models import Match, MatchDetail
from utils.redis_client import get_redis
from room.tests import create_room_simple, create_test_room_members_simple
from user.tests import create_test_user, create_test_user_4, create_test_user_8
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

def create_test_match_detail_simple():
    match = create_test_match_simple()
    users = create_test_user_4()
    match_details = []
    match_details.append(MatchDetail.create(match, users[0]))
    match_details.append(MatchDetail.create(match, users[1]))
    return match_details

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

class MatchDetailTestCase(TestCase):
    def test_create_match_detail(self):
        matchDetails = create_test_match_detail_simple()
        self.assertEqual(len(matchDetails), 2)
        self.assertIsInstance(matchDetails[0], MatchDetail)
        self.assertEqual(matchDetails[0].match.id, matchDetails[1].match.id)
        self.assertNotEqual(matchDetails[0].user, matchDetails[1].user)
        self.assertEqual(matchDetails[0].score, 0)

#--------------
# Test cases for Match API
#--------------
class MatchAPITestCase(APITestCase):
    def test_get_simple_match(self):
        create_test_user('a', 'a', 'a', 'a', 'a')
        access_response = self.client.post(
            reverse('login'),
            {'login_name': 'a', 'password': 'a'},
            format='json'
        )
        token = access_response.json()['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('simple-match')
        # 参加待ちのシンプル対戦ルームがない時
        response = self.client.get(url, {'type': 'remote'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
        # 参加待ちのシンプル対戦ルームが1つの時
        create_test_room_members_simple(1)
        response = self.client.get(url, {'type': 'remote'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)
        for item in response.data:
            self.assertIsInstance(item['match_id'], int)
            self.assertIsInstance(item['display_name'], str)
            # print(item) # for debugging purposes

    def test_post_simple_match_create(self):
        # Redisの初期化
        get_redis().flushdb()

        create_test_user('a', 'a', 'a', 'a', 'a')
        access_response = self.client.post(
            reverse('login'),
            {'login_name': 'a', 'password': 'a'},
            format='json'
        )
        token = access_response.json()['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('simple-match-create')
        # 参加待ちのシンプル対戦ルームが5つ未満の時
        create_room_simple(2)
        response = self.client.post(url, {'type': 'remote'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsInstance(response.data, dict)
        self.assertIn('match_id', response.data)
        # print(response.data) # for debugging purposes
        # 参加待ちのシンプル対戦ルームが5つ以上の時
        for i in range(5):
            create_room_simple(i + 3)
        response = self.client.post(url, {'type': 'remote'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_simple_match_join(self):
        # Redisの初期化
        get_redis().flushdb()

        create_test_user('a', 'a', 'a', 'a', 'a')
        access_response = self.client.post(
            reverse('login'),
            {'login_name': 'a', 'password': 'a'},
            format='json'
        )
        token = access_response.json()['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('simple-match-join')

        # 参加待ちのシンプル対戦ルームがない時
        response = self.client.post(url, {'match_id': 1})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 参加待ちのシンプル対戦ルームがある時
        match = create_test_match_simple()
        create_test_room_members_simple(match.id)
        response = self.client.post(url, {'match_id': match.id})
        # print(response.data) # for debugging purposes
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('match_id', response.data)

    def test_get_match_id(self):
        # Redisの初期化
        get_redis().flushdb()

        match = create_test_match_detail_simple()[0].match
        url = reverse('match-id', kwargs={'match_id': match.id})
        # matchのデータからユーザー情報を取得して、ログイン情報を取得する
        user = match.matchdetail_set.first().user
        access_response = self.client.post(
            reverse('login'),
            {'login_name': user.login_name, 'password': 'a'},
            format='json'
        )
        token = access_response.json()['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        # match_idが存在する時
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('room_id', response.data)
        # match_idが存在しない時
        url = reverse('match-id', kwargs={'match_id': 9999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
