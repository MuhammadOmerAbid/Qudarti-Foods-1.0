from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_view(_request):
  return JsonResponse({'status': 'ok'})


urlpatterns = [
  path('admin/', admin.site.urls),
  path('api/health/', health_view),
  path('api/', include('accounts.urls')),
  path('api/', include('operations.urls')),
]
