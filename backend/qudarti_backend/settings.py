from pathlib import Path
import os
from datetime import timedelta


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dev-secret-key')
DEBUG = os.getenv('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = [h for h in os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',') if h]

INSTALLED_APPS = [
  'django.contrib.admin',
  'django.contrib.auth',
  'django.contrib.contenttypes',
  'django.contrib.sessions',
  'django.contrib.messages',
  'django.contrib.staticfiles',
  'corsheaders',
  'rest_framework',
  'rest_framework_simplejwt',
  'accounts',
]

MIDDLEWARE = [
  'corsheaders.middleware.CorsMiddleware',
  'django.middleware.security.SecurityMiddleware',
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.csrf.CsrfViewMiddleware',
  'django.contrib.auth.middleware.AuthenticationMiddleware',
  'django.contrib.messages.middleware.MessageMiddleware',
  'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'qudarti_backend.urls'

TEMPLATES = [
  {
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
      'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
      ],
    },
  },
]

WSGI_APPLICATION = 'qudarti_backend.wsgi.application'
ASGI_APPLICATION = 'qudarti_backend.asgi.application'

DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': BASE_DIR / 'db.sqlite3',
  }
}

AUTH_USER_MODEL = 'accounts.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = os.getenv('DJANGO_TIME_ZONE', 'Asia/Karachi')
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
  'DEFAULT_AUTHENTICATION_CLASSES': (
    'rest_framework_simplejwt.authentication.JWTAuthentication',
  ),
  'DEFAULT_PERMISSION_CLASSES': (
    'rest_framework.permissions.IsAuthenticated',
  ),
}

SIMPLE_JWT = {
  'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
  'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
  'ROTATE_REFRESH_TOKENS': True,
  'BLACKLIST_AFTER_ROTATION': False,
}

CORS_ALLOWED_ORIGINS = [
  o for o in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
  if o
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
  o for o in os.getenv('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')
  if o
]
