from django.contrib.auth.models import User
from django.db import models
import string
import random
from django.utils.timezone import now

class UserProfile(models.Model):
    """Model to store user profile details."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(upload_to="profile_pictures/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    favorite_exercises = models.TextField(blank=True, null=True)
    preferred_diet_plan = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Track profile creation
    updated_at = models.DateTimeField(auto_now=True)  # Track last profile update

    def __str__(self):
        return f"{self.user.username}'s Profile"

class WorkoutPost(models.Model):
    """Model to store workout posts made by users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout_posts")
    caption = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="workout_posts/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_likes(self):
        return self.likes.count()

    def total_comments(self):
        return self.comments.count()

    def total_shares(self):
        return self.shares.count()

    def __str__(self):
        return f"Workout Post by {self.user.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Like(models.Model):
    """Model to store likes for workout posts."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked post {self.post.id}"

class Comment(models.Model):
    """Model to store comments on workout posts."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} commented on post {self.post.id}"

class Share(models.Model):
    """Model to store shares of workout posts."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name="shares")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} shared post {self.post.id}"
