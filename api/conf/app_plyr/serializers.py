from rest_framework import serializers
from .models import Player

class PlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = '__all__'

	# 受け取ったdataが、モデルのフィールドに適合するか検証する。
	def validate(self, data):
		if 'name' not in data:
			raise serializers.ValidationError("key 'name' is required.")
		if not data['name'].strip():
			raise serializers.ValidationError("data 'Name' cannot be blank or only spaces.")
		return data
	