from .models import User
from friend.models import Friend
from django.db.models import Q
from match.models import Match, MatchDetail
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings
from django.utils.timezone import localtime

from utils.blockchain_controller import BlockchainController
import logging
logger = logging.getLogger('django')

END_GAME_SCORE = settings.END_GAME_SCORE

def get_opponent_user_and_score(match_id, user_id):
  match = Match.objects.get(id=match_id)
  match_details = MatchDetail.objects.filter(match_id=match_id)
  for match_detail in match_details:
    if match_detail.user_id != user_id:
      return User.objects.get(id=match_detail.user_id), match_detail.score
  return None

def get_relation_to_current_user(user_id, access_id):
  if user_id == access_id:
    return 'self'
  if Friend.objects.filter(user_id=user_id, friend_id=access_id, status='accepted').exists():
    return 'friend'
  if Friend.objects.filter(user_id=access_id, friend_id=user_id, status='pending').exists():
    return 'requesting'
  if Friend.objects.filter(user_id=user_id, friend_id=access_id, status='pending').exists():
    return 'request_received'
  return 'stranger'

def create_response(user, access_id):
  match_details = MatchDetail.objects.filter(user_id=user.id)
  game_records = []
  for match_detail in match_details:
    opponent_user, opponent_score = get_opponent_user_and_score(match_detail.match_id, user.id)
    match = Match.objects.get(id=match_detail.match_id)
    tx_address, tx_status = fetch_tx_info(match)
    created_at = localtime(Match.objects.get(id = match_detail.match_id).created_at).strftime('%Y-%m-%d %H:%M:%S')

    game_records.append({
      'date': created_at,
      'result': "win" if match_detail.score == END_GAME_SCORE else "lose",
      'opponent_name': opponent_user.display_name,
      'score': {'player': match_detail.score, 'opponent': opponent_score},
      'match_type': 'tournament' if match.tournament_id else 'simple',
      'tx_address': tx_address,
      'tx_status': tx_status,
    })
  win_count = len([game_record for game_record in game_records if game_record['result'] == 'win'])
  lose_count = len([game_record for game_record in game_records if game_record['result'] == 'lose'])
  response = {
      'display_name': user.display_name,
      'avatar_path': user.avatar_path,
      'num_of_friends': Friend.objects.filter(user_id=user.id, status='accepted').count(),
      'relation_to_current_user': get_relation_to_current_user(user.id, access_id),
      'performance': {
          'game_records': game_records,
          'statistics': {
              'total_games': len(game_records),
              'wins': win_count,
              'losses': lose_count,
              'win_rate': win_count / (win_count + lose_count) if len(game_records) > 0 else 0
          }
      }
  }

  if user.id == access_id:
      response['login_name'] = user.login_name

  return response

def fetch_tx_info(match):
  try:
      tx_address = match.tx_address if match.tx_address else '-'
      tx_status = match.tx_status if match.tx_status else '-'
      return tx_address, tx_status
  except Exception as e:
      logger.error(f"Error fetching transaction info: {e}")
      return 'error', 'error'

def get_user_by_auth(auth):
  try:
      if auth:
          access_token = auth.split(' ')[1] if len(auth.split(' ')) > 1 else None
          if access_token:
              user = User.objects.filter(id=AccessToken(access_token).get('user_id')).first()
              if not user:
                  return None
              return user
  except IndexError:
      # トークンが不正な形式の場合
      return None
  except Exception as e:
      # その他の予期しないエラーの場合
      return None
  return None
