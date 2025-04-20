from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Exercise, WorkoutSession, WorkoutExerciseSet, UserProfile,
    Diet, Recipe, RecipeStep, Ingredient, Workout,
    WorkoutTracking, WorkoutPost, DietType
)

# Basic User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_active"]
        read_only_fields = ["is_active"]

# Registration serializer with profile fields
class RegistrationSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    favorite_exercises = serializers.CharField(required=False, allow_blank=True)
    preferred_diet_plan = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password",
            "bio", "date_of_birth", "phone_number",
            "address", "favorite_exercises", "preferred_diet_plan"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        profile_data = {
            'bio': validated_data.pop('bio', ''),
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'phone_number': validated_data.pop('phone_number', ''),
            'address': validated_data.pop('address', ''),
            'favorite_exercises': validated_data.pop('favorite_exercises', ''),
            'preferred_diet_plan': validated_data.pop('preferred_diet_plan', ''),
        }

        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Admin approval required
        user.save()

        UserProfile.objects.create(user=user, **profile_data)
        return user

# Exercise
class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'target', 'difficulty',
            'equipment', 'description', 'image_url',
            'recommended_sets', 'recommended_reps',
            'recommended_rest_time'
        ]
        read_only_fields = ['id']

# Workout Exercise Set
class WorkoutExerciseSetSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(),
        source='exercise',
        write_only=True
    )

    class Meta:
        model = WorkoutExerciseSet
        fields = [
            'id', 'exercise', 'exercise_id',
            'set_number', 'weight', 'reps', 'rest_time', 'workout_session'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        return WorkoutExerciseSet.objects.create(**validated_data)

# Workout
class WorkoutSerializer(serializers.ModelSerializer):
    workout_session = serializers.SerializerMethodField()
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Workout
        fields = ['id', 'user', 'created_at', 'summary', 'workout_session']

    def get_workout_session(self, obj):
        if obj.session:
            return WorkoutSessionSerializer(obj.session, context=self.context).data
        return None

# Workout Session
class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercise_sets = WorkoutExerciseSetSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    workout_id = serializers.PrimaryKeyRelatedField(
        queryset=Workout.objects.all(),
        source='workout',
        write_only=True,
        required=False
    )

    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'user', 'workout_id', 'started_at', 'ended_at',
            'total_duration', 'total_exercises', 'total_sets', 'notes', 'exercise_sets'
        ]
        read_only_fields = ['user', 'started_at', 'exercise_sets']

# Workout Post
class WorkoutPostSerializer(serializers.ModelSerializer):
    workout_details = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPost
        fields = ['id', 'user', 'workout', 'caption', 'posted_at', 'workout_details']

    def get_workout_details(self, obj):
        return {
            "notes": obj.workout.notes,
            "duration": obj.workout.session.total_duration if hasattr(obj.workout, 'session') else None,
            "total_sets": obj.workout.session.total_sets if hasattr(obj.workout, 'session') else None,
            "total_exercises": obj.workout.session.total_exercises if hasattr(obj.workout, 'session') else None,
        }

# Diet Type
class DietTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietType
        fields = ['id', 'name', 'goal', 'foods', 'avoid']

# Recipe
class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time',
                  'calories', 'protein', 'carbs', 'fat']
        read_only_fields = ['id']

# Diet
class DietSerializer(serializers.ModelSerializer):
    types = DietTypeSerializer(many=True, read_only=True)
    recipes = RecipeSerializer(many=True, read_only=True)

    class Meta:
        model = Diet
        fields = '__all__'
        read_only_fields = ['id', 'user']

# Recipe Step
class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['step_number', 'description']
        read_only_fields = ['id']

# Ingredient
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['name', 'quantity']
        read_only_fields = ['id']

# Recipe Detail
class RecipeDetailSerializer(serializers.ModelSerializer):
    steps = RecipeStepSerializer(many=True, read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time',
                  'calories', 'protein', 'carbs', 'fat', 'steps', 'ingredients']
        read_only_fields = ['id']
