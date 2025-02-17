from django.shortcuts import render
from rest_framework import generics
from .serializer import RoomSerializer
from .models import UserProfile

# Create your views here.
class RoomView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = RoomSerializer
