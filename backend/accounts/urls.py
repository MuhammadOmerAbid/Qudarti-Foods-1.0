from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SuperuserLoginView, MeView, UserViewSet


router = DefaultRouter()
router.register('users', UserViewSet, basename='users')

urlpatterns = [
  path('auth/login/', SuperuserLoginView.as_view(), name='auth-login'),
  path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
  path('auth/me/', MeView.as_view(), name='auth-me'),
  path('', include(router.urls)),
]
