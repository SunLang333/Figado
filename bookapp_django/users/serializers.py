from rest_framework import serializers
from django.contrib.auth import get_user_model

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    languages = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, default=list
    )

    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password', 'languages')

    def create(self, validated_data):
        User = get_user_model()
        languages = validated_data.pop('languages', [])
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        user.languages = languages
        user.save()
        return user
