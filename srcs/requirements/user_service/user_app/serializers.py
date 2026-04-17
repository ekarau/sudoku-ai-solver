from rest_framework import serializers
from .models import CustomUser, Relationship
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions

class CustomUserSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField() 

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'display_name', 'email', 'avatar', 'status', 'is_online', 'is_superuser']


# CHECK THIS SECTION CAREFULLY - It must be named exactly RegisterSerializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'avatar', 'password')

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_avatar(self, value):
        if value:
            # Check file size (10MB limit)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Avatar file size must be less than 10MB.")
            
            # Check extension
            ext = value.name.split('.')[-1].lower()
            if ext not in ['jpg', 'jpeg', 'png', 'gif']:
                raise serializers.ValidationError("Unsupported file extension. Use jpg, jpeg, png, or gif.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            avatar=validated_data.get('avatar', None),
            password=validated_data['password']
        )
        user.display_name = user.username
        user.save()
        return user