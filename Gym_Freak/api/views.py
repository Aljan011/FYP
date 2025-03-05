from django.shortcuts import render
from rest_framework import generics, status
from .serializers import UserProfileSerializer
from .models import UserProfile
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
