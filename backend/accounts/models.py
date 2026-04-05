from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
  ROLE_SUPERUSER = 'superuser'
  ROLE_USER = 'user'

  ROLE_CHOICES = (
    (ROLE_SUPERUSER, 'Superuser'),
    (ROLE_USER, 'User'),
  )

  role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)
  permissions = models.JSONField(default=list, blank=True)
  can_edit = models.BooleanField(default=False)
  can_delete = models.BooleanField(default=False)

  def save(self, *args, **kwargs):
    if self.is_superuser:
      self.role = self.ROLE_SUPERUSER
    elif not self.role:
      self.role = self.ROLE_USER
    super().save(*args, **kwargs)
