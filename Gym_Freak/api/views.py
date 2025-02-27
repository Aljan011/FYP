from django.shortcuts import render
from rest_framework import generics
from .serializers import UserProfileSerializer
from .models import UserProfile

# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
