from rest_framework import serializers
from .models import UserProfile, WorkoutTracking, WorkoutPost, Like, Comment, Share, DietPlan, ChatMessage

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class WorkoutTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutTracking
        fields = '__all__'

class WorkoutPostSerializer(serializers.ModelSerializer):
    workout = WorkoutTrackingSerializer(read_only=True)  # Nested serializer to show workout details

    class Meta:
        model = WorkoutPost
        fields = ['id', 'user', 'workout', 'caption', 'created_at']
        read_only_fields = ['created_at']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['created_at']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'created_at']
        read_only_fields = ['created_at']

class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['created_at']

class DietPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_username', 'receiver', 'receiver_username', 'message', 'timestamp']