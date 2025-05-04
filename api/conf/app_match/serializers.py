from rest_framework import serializers
from .models import Match, MatchDetail

# 対戦一覧を取得するためにシリアライザを定義することが想定されますが、共通部分の実装としてはスキップします