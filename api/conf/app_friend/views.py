from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from user.models import User
from django.db.models import Q
from .models import Friend
from .serializers import FriendCreateSerializer, FriendListSerializer, FriendRequestSerializer
from django.utils import timezone
from datetime import timedelta

# TODO 認証情報いったんだるいから外しているのであとで直す

class FriendListByNameView(APIView):

    def get(self, request, display_name):
        user = User.objects.filter(display_name=display_name).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        friends = Friend.objects.filter(user=user, status='accepted')
        serializer = FriendListSerializer(friends, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FriendRequestByNameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, display_name, friend_name):
        # if request.user.display_name != display_name:
        #     return Response({'error': 'You are not authorized to access this resource.'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(display_name=display_name).first()
        friend = User.objects.filter(display_name=friend_name).first()
        if not user or not friend:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if user == friend:
            return Response({'error': 'You cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
        # 申請 or 承認（既に逆方向がpendingなら承認）
        existing = Friend.objects.filter(user=friend, friend=user, status='pending').first()
        if existing:
            # 承認
            existing.status = 'accepted'
            existing.save()
            Friend.objects.create(user=user, friend=friend, status='accepted')
            return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)
        # 新規申請
        serializer = FriendCreateSerializer(data={'user': user.id, 'friend': friend.id, 'status': 'pending'})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, display_name, friend_name):
        # if request.user.display_name != display_name:
        #     return Response({'error': 'You are not authorized to access this resource.'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(display_name=display_name).first()
        friend = User.objects.filter(display_name=friend_name).first()
        if not user or not friend:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if user == friend:
            return Response({'error': 'You cannot remove yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
        # 申請拒否 or フレンド削除
        deleted, _ = Friend.objects.filter(user=user, friend=friend).delete()
        Friend.objects.filter(user=friend, friend=user).delete()
        return Response({'message': 'Friend deleted'}, status=status.HTTP_200_OK)


class FriendRequestsListByNameView(APIView):

    def get(self, request, display_name):
        if request.user.display_name != display_name:
            return Response({'error': 'You are not authorized to access this resource.'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(display_name=display_name).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        requests = Friend.objects.filter(Q(friend=user) | Q(user=user), status='pending')
        serializer = FriendRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
