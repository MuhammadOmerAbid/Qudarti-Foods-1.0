from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, SuperuserTokenObtainPairSerializer
from .permissions import IsSuperuser


class SuperuserLoginView(TokenObtainPairView):
  serializer_class = SuperuserTokenObtainPairSerializer


class MeView(generics.RetrieveAPIView):
  serializer_class = UserSerializer
  permission_classes = [IsAuthenticated]

  def get_object(self):
    return self.request.user


class UserViewSet(viewsets.ModelViewSet):
  queryset = User.objects.all().order_by('id')
  permission_classes = [IsSuperuser]

  def get_serializer_class(self):
    if self.action == 'create':
      return UserCreateSerializer
    return UserSerializer
