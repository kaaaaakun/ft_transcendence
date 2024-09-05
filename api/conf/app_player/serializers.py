from rest_framework import serializers
from .models import players
import re

CHARACTERS_NOT_ALLOWD = r"[<>&'\"]"

class playersSerializer(serializers.ModelSerializer):
	class Meta:
		model = players
		fields = '__all__'

	# 受け取ったdataが、モデルのフィールドに適合するか検証する。
	def validate(self, data):
		if 'name' not in data:
			raise serializers.ValidationError("key 'name' is required.")
		if not data['name'].strip():
			raise serializers.ValidationError("data 'Name' cannot be blank or only spaces.")
		if re.search(CHARACTERS_NOT_ALLOWD, data['name']):
			raise serializers.ValidationError(f"data 'Name' contains not allowed characters: {CHARACTERS_NOT_ALLOWD}")
		return data
	