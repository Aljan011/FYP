from django.contrib import admin
from .models import (
    UserProfile, Exercise, Workout, WorkoutTracking, WorkoutPost,
    Like, Comment, Share, DietPlan, ChatMessage
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'date_of_birth')
    search_fields = ('user__username', 'phone_number')


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'target', 'difficulty', 'equipment')
    search_fields = ('name', 'target')


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at')
    search_fields = ('title', 'user__username')


@admin.register(WorkoutTracking)
class WorkoutTrackingAdmin(admin.ModelAdmin):
    list_display = ('user', 'workout', 'exercise_name', 'workout_date', 'sets', 'reps')
    search_fields = ('user__username', 'exercise_name')

    # Define methods to display exercise_name and reps if they don't exist directly as fields
    def exercise_name(self, obj):
        return obj.exercise.name if obj.exercise else None
    exercise_name.short_description = 'Exercise Name'

    def reps(self, obj):
        # You can define how to display the reps, assuming it's in the sets JSON field
        return ', '.join(str(set.get('reps', 'N/A')) for set in obj.sets)
    reps.short_description = 'Reps'


@admin.register(WorkoutPost)
class WorkoutPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'workout', 'created_at')
    search_fields = ('user__username',)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'text', 'created_at')
    search_fields = ('user__username', 'text')


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'is_custom', 'created_at')
    search_fields = ('name', 'user__username')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'message', 'timestamp')
    search_fields = ('sender__username', 'receiver__username', 'message')
