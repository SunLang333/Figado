from django.db import models
from django.contrib.auth.models import AbstractUser
 
class CustomUser(AbstractUser):
    """
    扩展用户模型，添加语言偏好字段
    languages 存储用户偏好的语言列表，例如 ["cn", "en", "fr", "es"]
    """
    languages = models.JSONField(default=list, blank=True, help_text="Preferred languages")
