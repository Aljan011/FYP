from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from rest_framework import generics, status, permissions
from django.db import models
from .serializers import UserProfileSerializer, DietPlanSerializer, ChatMessageSerializer, WorkoutSerializer
from .models import UserProfile, WorkoutTracking, WorkoutPost, DietPlan, ChatMessage, Exercise, Workout

from rest_framework.views import APIView
from rest_framework.response import Response

class WorkoutCreateView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        workout = Workout.objects.create(
            title=data['title'],
            description=data['description']
        )
        exercises = Exercise.objects.filter(id__in=data['exercises'])
        workout.exercises.set(exercises)
        workout.save()
        return Response({"message": "Workout created successfully!"}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Successful login
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        else:
            # Invalid credentials
            return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

# View for listing user profiles
class RoomView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

# # View for listing and creating WorkoutTracking entries
# class WorkoutTrackingListCreateView(generics.ListCreateAPIView):
#     queryset = WorkoutTracking.objects.all()
#     serializer_class = WorkoutTrackingSerializer

# class WorkoutPostListCreateView(generics.ListCreateAPIView):
#     queryset = WorkoutPost.objects.all()
#     serializer_class = WorkoutPostSerializer

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
