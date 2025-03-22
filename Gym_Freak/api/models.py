from django.contrib.auth.models import User
from django.db import models
import string
import random
from django.conf import settings
from django.utils.timezone import now


def generate_unique_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if not User.objects.filter(username=code).exists():
            break
    return code


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    favorite_exercises = models.TextField(blank=True, null=True)
    preferred_diet_plan = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Exercise(models.Model):
    name = models.CharField(max_length=255)
    target = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=100)
    equipment = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.URLField()

    def __str__(self):
        return self.name


class Workout(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workouts')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    exercises = models.ManyToManyField(Exercise, related_name='workouts')
    duration = models.DurationField(blank=True, null=True)
    calories_burned = models.PositiveIntegerField(blank=True, null=True)
    intensity = models.CharField(max_length=10, choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')], default='Medium')
    sets = models.JSONField(default=list)
    rest_time = models.DurationField(blank=True, null=True)
    personal_best = models.JSONField(default=dict)
    notes = models.TextField(blank=True, null=True)
    progress_pictures = models.ImageField(upload_to="progress_pics/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class WorkoutTracking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_tracking')
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='sessions')
    workout_date = models.DateField(auto_now_add=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='workout_sessions', null=True, blank=True)
    sets = models.JSONField(default=list)
    rest_time = models.DurationField(blank=True, null=True)
    calories_burned = models.PositiveIntegerField(blank=True, null=True)
    workout_notes = models.TextField(blank=True, null=True)
    workout_image = models.ImageField(blank=True, null=True, upload_to='workout_images/')

    def __str__(self):
        return f"Workout on {self.workout_date} by {self.user.username}"


class WorkoutPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout_posts")
    workout = models.ForeignKey(WorkoutTracking, on_delete=models.CASCADE, null=True, blank=True)
    caption = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.user.username} on {self.created_at.date()}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked post {self.post.id}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} commented on post {self.post.id}"


class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name="shares")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} shared post {self.post.id}"


class DietPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diet_plans", null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    meals = models.JSONField()
    is_custom = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({'Custom' if self.is_custom else 'General'})"


class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    message = models.TextField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"
