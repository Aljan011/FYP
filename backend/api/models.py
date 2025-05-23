from django.contrib.auth.models import User
from django.db import models
import string
import random
from django.conf import settings
from django.utils.timezone import now
from django.utils.text import slugify


def generate_unique_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if not User.objects.filter(username=code).exists():
            break
    return code


class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('trainer', 'Trainer'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')  # NEW FIELD
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
    name = models.CharField(max_length=255, unique=True)
    target = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=100)
    equipment = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    image_url = models.URLField(blank=True, null=True)
    recommended_sets = models.IntegerField(default=3)
    recommended_reps = models.IntegerField(default=10)
    recommended_rest_time = models.IntegerField(default=90)  # in seconds

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
    summary = models.TextField(null=True, blank=True)  # Example of a 'summary' field


    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    session = models.OneToOneField(
        'WorkoutSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workout_session'
    )
    
class WorkoutPlan(models.Model):
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_plans')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_plans')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    exercises = models.ManyToManyField('api.Exercise', related_name='workout_plans')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} for {self.user.username} by {self.trainer.username}"
    

class WorkoutSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    total_duration = models.DurationField(null=True, blank=True)
    total_exercises = models.IntegerField(default=0)
    total_sets = models.IntegerField(default=0)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Workout Session for {self.user.username} on {self.started_at.date()}"

class WorkoutExerciseSet(models.Model):
    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='exercise_sets')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    set_number = models.IntegerField()
    weight = models.FloatField(null=True, blank=True)
    reps = models.IntegerField()
    rest_time = models.IntegerField(null=True, blank=True)  # in seconds

    def __str__(self):
        return f"{self.exercise.name} - Set {self.set_number}"


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
    
class WorkoutPlanTemplate(models.Model):
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plan_templates')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    exercises = models.ManyToManyField(Exercise, related_name='template_plans')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Template: {self.name} by {self.trainer.username}"


class WorkoutPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workout = models.ForeignKey('Workout', on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)
    caption = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username}'s post on {self.posted_at}"
    
class Diet(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    protein_ratio = models.FloatField(null=True, blank=True)
    carb_ratio = models.FloatField(null=True, blank=True)
    fat_ratio = models.FloatField(null=True, blank=True)
    benefits = models.TextField(blank=True)
    image = models.ImageField(upload_to='diet_images/', blank=True, null=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Automatically generate a slug based on the name if slug is not provided
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class DietType(models.Model):
    diet = models.ForeignKey(Diet, related_name='types', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    goal = models.TextField()
    foods = models.TextField()
    avoid = models.TextField()

    def __str__(self):
        return f"{self.diet.name} - {self.name}"

class Recipe(models.Model):
    title = models.CharField(max_length=200)
    diet = models.ForeignKey(DietType, related_name='recipes', on_delete=models.CASCADE)
    description = models.TextField()
    image = models.ImageField(upload_to='recipe_images/')
    prep_time = models.IntegerField(help_text="Preparation time in minutes")
    
    # Nutritional information
    calories = models.IntegerField()
    protein = models.FloatField(help_text="Protein in grams")
    carbs = models.FloatField(help_text="Carbohydrates in grams")
    fat = models.FloatField(help_text="Fat in grams")
    
    # For searching and filtering
    tags = models.CharField(max_length=200, null=True, blank=True)
    
    def __str__(self):
        return self.title

class RecipeStep(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='steps', on_delete=models.CASCADE)
    step_number = models.IntegerField()
    description = models.TextField()
    
    class Meta:
        ordering = ['step_number']
    
    def __str__(self):
        return f"{self.recipe.title} - Step {self.step_number}"

class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='ingredients', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.quantity} {self.name}"
    
#chat models
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}: {self.content[:30]}"

