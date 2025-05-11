from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model

class ProfileView(generics.RetrieveAPIView):
    """
    获取当前登录用户的个人信息
    返回用户名和语言偏好列表
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            'languages': user.languages
        })
