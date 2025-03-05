from rest_framework import serializers
from .models import UserProfile
from .models import UserProfile, WorkoutPost, Like, Comment, Share

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "profile_picture",
            "bio",
            "date_of_birth",
            "phone_number",
            "address",
            "favorite_exercises",
            "preferred_diet_plan",
            "created_at",
            "updated_at",
        ]

class WorkoutPostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    total_likes = serializers.IntegerField(source="total_likes", read_only=True)
    total_comments = serializers.IntegerField(source="total_comments", read_only=True)
    total_shares = serializers.IntegerField(source="total_shares", read_only=True)

    class Meta:
        model = WorkoutPost
        fields = ["id", "user", "caption", "image", "created_at", "total_likes", "total_comments", "total_shares"]

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "post", "created_at"]

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "user", "post", "text", "created_at"]

class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = ["id", "user", "post", "created_at"]

