from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    UserProfile, Exercise, Workout, WorkoutTracking, WorkoutPost,
    Diet, DietType, Recipe, RecipeStep, Ingredient, WorkoutExerciseSet
)

# ➕ Inline for UserProfile with role display
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

# ➕ Custom UserAdmin that includes UserProfile's role
class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'get_role')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    def get_role(self, obj):
        return obj.profile.role if hasattr(obj, 'profile') else '-'
    get_role.short_description = 'Role'

# ✅ Unregister default and register our custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ✅ Your existing model admins
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

    def exercise_name(self, obj):
        return obj.exercise.name if obj.exercise else None
    exercise_name.short_description = 'Exercise Name'

    def reps(self, obj):
        return ', '.join(str(set.get('reps', 'N/A')) for set in obj.sets)
    reps.short_description = 'Reps'

@admin.register(WorkoutPost)
class WorkoutPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'workout', 'posted_at')
    search_fields = ('user__username',)

class DietTypeInline(admin.TabularInline):
    model = DietType
    extra = 1

class DietAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ["name", "slug"]
    inlines = [DietTypeInline]

admin.site.register(Diet, DietAdmin)
admin.site.register(Recipe)
admin.site.register(RecipeStep)
admin.site.register(Ingredient)
admin.site.register(WorkoutExerciseSet)
