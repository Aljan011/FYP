from django.shortcuts import render
from rest_framework import generics, status
from .serializers import UserProfileSerializer, WorkoutTrackingSerializer, WorkoutPostSerializer
from .models import UserProfile, WorkoutTracking, WorkoutPost
from rest_framework.views import APIView
from rest_framework.response import Response

# View for listing user profiles
class RoomView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

# View for listing and creating WorkoutTracking entries
class WorkoutTrackingListCreateView(generics.ListCreateAPIView):
    queryset = WorkoutTracking.objects.all()
    serializer_class = WorkoutTrackingSerializer

class WorkoutPostListCreateView(generics.ListCreateAPIView):
    queryset = WorkoutPost.objects.all()
    serializer_class = WorkoutPostSerializer
