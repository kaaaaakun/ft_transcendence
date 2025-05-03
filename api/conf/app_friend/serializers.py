from rest_framework import serializers
from .models import Friend

# 出力用（友達リスト用）
class FriendListSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    friend_name = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = ['id', 'friend_name', 'is_online']

    def get_id(self, obj):
        return obj.friend.id

    def get_friend_name(self, obj):
        return obj.friend.display_name

    def get_is_online(self, obj):
        return obj.friend.last_online_at

# 入力用（友達申請・作成用）
class FriendCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ['user', 'friend', 'status']

# 申請リスト用
class FriendRequestSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    requester_name = serializers.SerializerMethodField()
    requestee_name = serializers.SerializerMethodField()
    requested_at = serializers.DateTimeField(source='created_at')

    class Meta:
        model = Friend
        fields = ['id', 'requester_name', 'requestee_name', 'requested_at']

    def get_id(self, obj):
        return obj.user.id

    def get_requester_name(self, obj):
        return obj.user.display_name

    def get_requestee_name(self, obj):
        return obj.friend.display_name
