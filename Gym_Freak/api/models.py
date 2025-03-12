from django.contrib.auth.models import User
from django.db import models
import string
import random
from django.utils.timezone import now


def generate_unique_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if User.objects.filter(username=code).count() == 0:
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

class WorkoutTracking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout_tracking")
    workout_date = models.DateField(auto_now_add=True)
    exercise_name = models.CharField(max_length=255)
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    duration = models.DurationField(blank=True, null=True)  # Optional for time-based workouts
    calories_burned = models.PositiveIntegerField(blank=True, null=True)
    workout_notes = models.TextField(blank=True, null=True)
    workout_image = models.ImageField(upload_to='workout_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.exercise_name} on {self.workout_date}"

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

