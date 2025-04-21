from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User
import re

CHARACTERS_NOT_ALLOWED = r"[<>&'\"]"

class UserSerializer(serializers.ModelSerializer):
    # パスワードと秘密の質問を書き込み専用にする
    password = serializers.CharField(write_only=True)
    secret_answer = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['id', 'deleted_at', 'last_online_at']

    def validate(self, data):
        for key in ['login_name', 'display_name', 'password', 'secret_question', 'secret_answer']:
            if key not in data:
                raise serializers.ValidationError(f"key '{key}' is required.")
            if not data[key].strip():
                raise serializers.ValidationError(f"data '{key}' cannot be blank or only spaces.")
            if re.search(CHARACTERS_NOT_ALLOWED, data[key]):
                raise serializers.ValidationError(f"data '{key}' contains not allowed characters: {CHARACTERS_NOT_ALLOWED}")
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    login_name = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        login_name = data.get('login_name')
        password = data.get('password')

        user = User.ft_authenticate(login_name=login_name, password=password)
        if not user:
            raise serializers.ValidationError("Invalid login credentials")

        data['user'] = user
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    login_name = serializers.CharField(required=True)


class PasswordResetSerializer(serializers.Serializer):
    login_name = serializers.CharField(required=True)
    secret_answer = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        login_name = data.get('login_name')
        secret_answer = data.get('secret_answer')

        try:
            user = User.objects.get(login_name=login_name)
            if user.deleted_at is not None:
                raise serializers.ValidationError("User not found")
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if re.search(CHARACTERS_NOT_ALLOWED, data.get('new_password')):
            raise serializers.ValidationError(f"Password contains not allowed characters: {CHARACTERS_NOT_ALLOWED}")

        data['user'] = user
        return data

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['display_name', 'avatar_path']

    avatar_path = serializers.ImageField(required=False)

    def validate(self, data):
        if 'display_name' in data:
            if re.search(CHARACTERS_NOT_ALLOWED, data['display_name']):
                raise serializers.ValidationError(f"data 'display_name' contains not allowed characters: {CHARACTERS_NOT_ALLOWED}")
        return data

    def update(self, instance, validated_data):
        if 'display_name' in validated_data:
            instance.display_name = validated_data['display_name']

        if 'avatar_path' in validated_data:
            avatar = validated_data['avatar_path']
            file_name = f"{instance.login_name}.png"
            avatar_path = f"/var/www/data/avatars/{file_name}"

            with open(avatar_path, "wb") as f:
                for chunk in avatar.chunks():
                    f.write(chunk)

            instance.avatar_path = f"/avatars/{file_name}"

        instance.save()
        return instance
    
