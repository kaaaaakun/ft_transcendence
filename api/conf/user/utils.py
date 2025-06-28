from .models import User
from friend.models import Friend
from django.db.models import Q
from match.models import Match, MatchDetail
from rest_framework_simplejwt.tokens import AccessToken


def get_opponent_user_and_score(match_id, user_id):
  match_details = MatchDetail.objects.filter(match_id=match_id).select_related('user')
  for match_detail in match_details:
    if match_detail.user_id != user_id:
      return match_detail.user, match_detail.score
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
  match_details = MatchDetail.objects.filter(user_id=user.id).select_related('match')
  all_match_details = MatchDetail.objects.filter(
    match_id__in=[md.match_id for md in match_details]
  ).select_related('user', 'match')
  
  match_details_by_match = {}
  for md in all_match_details:
    if md.match_id not in match_details_by_match:
      match_details_by_match[md.match_id] = []
    match_details_by_match[md.match_id].append(md)
  
  game_records = []
  for match_detail in match_details:
    opponent_user = None
    opponent_score = None
    
    for md in match_details_by_match[match_detail.match_id]:
      if md.user_id != user.id:
        opponent_user = md.user
        opponent_score = md.score
        break
    
    if opponent_user:
      game_records.append({
        'result': "win" if match_detail.score == 10 else "lose",
        'opponent_name': opponent_user.display_name,
        'score': {'player': match_detail.score, 'opponent': opponent_score},
        'match_type': 'tournament' if match_detail.match.tournament_id else 'local'
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
