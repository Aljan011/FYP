from django.shortcuts import render
from rest_framework import generics, status, permissions
from django.db import models
from .serializers import UserProfileSerializer, WorkoutTrackingSerializer, WorkoutPostSerializer, DietPlanSerializer, ChatMessageSerializer
from .models import UserProfile, WorkoutTracking, WorkoutPost, DietPlan, ChatMessage

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

# Retrieve all diet plans (general and user-specific)
class DietPlanListCreateView(generics.ListCreateAPIView):
    queryset = DietPlan.objects.all()
    serializer_class = DietPlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_custom=True)

# Retrieve, update, or delete a specific diet plan
class DietPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DietPlan.objects.all()
    serializer_class = DietPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

# ✅ Get All Messages Between Two Users
class ChatMessageListView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['user_id']  # Get ID from URL
        return ChatMessage.objects.filter(
            (models.Q(sender=user, receiver_id=other_user_id) |
             models.Q(sender_id=other_user_id, receiver=user))
        ).order_by('timestamp')

# ✅ Send a Message
class SendMessageView(generics.CreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
