from .models import User
from django.db.models import Q
from match.models import Match, MatchDetail
from rest_framework_simplejwt.tokens import AccessToken


def get_opponent_user_and_score(match_id, user_id):
  match = Match.objects.get(id=match_id)
  match_details = MatchDetail.objects.filter(match_id=match_id)
  for match_detail in match_details:
    if match_detail.player_id.id != user_id:
      return User.objects.get(id=match_detail.player_id.id), match_detail.score
  return None

def create_response(user, access_id):
  match_details = MatchDetail.objects.filter(player_id_id=user.id)
  game_records = []
  for match_detail in match_details:
    opponent_user, opponent_score = get_opponent_user_and_score(match_detail.match_id.id, user.id)
    game_records.append({
      # 'date': match_detail.match_id.created_at,
      'result': match_detail.result,
      'opponent_name': opponent_user.display_name,
      'score': {'player': match_detail.score, 'opponent': opponent_score},
      'match_type': 'tournament' if match_detail.match_id.tournament_id else 'local'
    })
  win_count = len([game_record for game_record in game_records if game_record['result'] == 'win'])
  lose_count = len([game_record for game_record in game_records if game_record['result'] == 'lose'])
  response = {
      'display_name': user.display_name,
      'avatar_path': user.avatar_path,
      'num_of_friends': '3',
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

def get_user_by_auth(auth):
  try:
      if auth:
          access_token = auth.split(' ')[1] if len(auth.split(' ')) > 1 else None
          if access_token:
              return AccessToken(access_token).get('user_id')
  except IndexError:
      # トークンが不正な形式の場合
      return None
  except Exception as e:
      # その他の予期しないエラーの場合
      return None
  return None
