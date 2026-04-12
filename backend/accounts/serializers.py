from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = [
      'id',
      'username',
      'first_name',
      'last_name',
      'email',
      'role',
      'permissions',
      'can_edit',
      'can_delete',
      'is_active',
    ]


class UserCreateSerializer(serializers.ModelSerializer):
  password = serializers.CharField(write_only=True, min_length=6)

  class Meta:
    model = User
    fields = [
      'id',
      'username',
      'password',
      'first_name',
      'last_name',
      'email',
      'role',
      'permissions',
      'can_edit',
      'can_delete',
      'is_active',
    ]

  def create(self, validated_data):
    password = validated_data.pop('password')
    role = validated_data.get('role') or User.ROLE_USER
    if role == User.ROLE_SUPERUSER:
      validated_data['is_superuser'] = True
      validated_data['is_staff'] = True
    user = User(**validated_data)
    user.set_password(password)
    user.save()
    return user


class SuperuserTokenObtainPairSerializer(TokenObtainPairSerializer):
  def validate(self, attrs):
    data = super().validate(attrs)
    if not self.user.is_active:
      raise serializers.ValidationError('Your account is inactive.')
    data['user'] = UserSerializer(self.user).data
    return data
