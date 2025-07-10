from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Exercise, WorkoutSession, WorkoutExerciseSet, WorkoutPlan, Workout, WorkoutTracking, WorkoutPost, WorkoutPlanTemplate, WorkoutPostComment,
    WorkoutPostLike, WorkoutPostReaction, WorkoutPostReaction,
    UserProfile, TrainerReview,
    Diet, Recipe, RecipeStep, Ingredient, DietType, SavedDietType, AssignedDiet,
    Achievement, UserAchievement
)

# Basic User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_active", "role"]
        read_only_fields = ["is_active"]

# Registration serializer with profile fields
class RegistrationSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    favorite_exercises = serializers.CharField(required=False, allow_blank=True)
    preferred_diet_plan = serializers.CharField(required=False, allow_blank=True)
    
    # 🔥 Add new fields
    certifications = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False)
    specialties = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password",
            "bio", "date_of_birth", "phone_number",
            "address", "favorite_exercises", "preferred_diet_plan",
            "certifications", "experience_years", "specialties"
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
            'certifications': validated_data.pop('certifications', ''),
            'experience_years': validated_data.pop('experience_years', None),
            'specialties': validated_data.pop('specialties', ''),
        }

        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Admin approval required
        user.save()

        UserProfile.objects.create(user=user, **profile_data)
        return user
    
# Trainer Review Serializer    

class TrainerReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.ReadOnlyField(source='reviewer.username')
    trainer = serializers.ReadOnlyField(source='trainer.id')

    class Meta:
        model = TrainerReview
        fields = ['id', 'trainer', 'reviewer', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'trainer', 'created_at']
    
    
class TrainerProfilePublicSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'profile_picture', 'bio',
            'certifications', 'experience_years', 'specialties'
        ]


# Exercise


class ExerciseSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'target', 'difficulty', 'equipment']

class WorkoutPlanSerializer(serializers.ModelSerializer):
    trainer = serializers.StringRelatedField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(profile__role='user')
    )
    exercises = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Exercise.objects.all()
    )

    class Meta:
        model = WorkoutPlan
        fields = ['id', 'trainer', 'user', 'name', 'description', 'exercises', 'created_at']
        read_only_fields = ['trainer', 'created_at']

    def create(self, validated_data):
        # Extract the trainer if it was passed in (by perform_create)
        trainer = validated_data.pop('trainer', None) or self.context['request'].user

        # Pop out exercises list
        exercises = validated_data.pop('exercises', [])

        # Create plan with a single trainer kwarg
        plan = WorkoutPlan.objects.create(trainer=trainer, **validated_data)

        # Assign exercises
        plan.exercises.set(exercises)
        return plan

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
    user = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPost
        fields = [
            'id', 'user', 'workout', 'caption', 'posted_at',
            'workout_details', 'likes_count', 'is_liked', 'comments_count', 'reactions'
        ]
        read_only_fields = ['user', 'posted_at', 'workout_details']

    def get_user(self, obj):
        return obj.user.username

    def get_workout_details(self, obj):
        session = getattr(obj.workout, 'session', None)
        exercises = obj.workout.exercises.all()
        exercise_data = []

        for exercise in exercises:
            exercise_sets = [
                s for s in obj.workout.sets
                if s.get('exercise') == exercise.name
            ]
            exercise_data.append({
                'name': exercise.name,
                'sets': exercise_sets
            })

        return {
            "notes": obj.workout.notes,
            "duration": session.total_duration if session else None,
            "total_sets": session.total_sets if session else None,
            "total_exercises": session.total_exercises if session else None,
            "exercises": exercise_data
        }

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        user = self.context.get("request").user
        return obj.likes.filter(user=user).exists()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_reactions(self, obj):
        return [
            {"emoji": r.emoji, "user": r.user.username}
            for r in obj.reactions.all()
        ]

        
class WorkoutPostCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPostComment
        fields = ['id', 'user', 'post', 'parent', 'text', 'created_at', 'replies']
        extra_kwargs = {
            'post': {'required': False},  
            'parent': {'required': False, 'allow_null': True}
        }

    def get_replies(self, obj):
        return WorkoutPostCommentSerializer(obj.replies.all(), many=True).data

class WorkoutPostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPostLike
        fields = ['id', 'user', 'post', 'created_at']

class WorkoutPostReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPostReaction
        fields = ['id', 'user', 'post', 'emoji', 'created_at']

        
class WorkoutPlanTemplateSerializer(serializers.ModelSerializer):
    trainer = serializers.StringRelatedField(read_only=True)
    exercises = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Exercise.objects.all()
    )

    class Meta:
        model = WorkoutPlanTemplate
        fields = ['id', 'trainer', 'name', 'description', 'exercises', 'created_at']
        read_only_fields = ['trainer', 'created_at']

    def create(self, validated_data):
     exercises = validated_data.pop("exercises", [])
     template = WorkoutPlanTemplate.objects.create(**validated_data)
     template.exercises.set(exercises)
     return template


# --- Diet Type (basic) ---
class DietTypeSerializer(serializers.ModelSerializer):
    diet = serializers.StringRelatedField()
    class Meta:
        model = DietType
        fields = '__all__'


# --- Recipe ---
class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time',
                  'calories', 'protein', 'carbs', 'fat']
        read_only_fields = ['id']


# --- Diet Serializer (uses DietType & Recipe above) ---
class DietSerializer(serializers.ModelSerializer):
    types = DietTypeSerializer(many=True, read_only=True)
    recipes = RecipeSerializer(many=True, read_only=True)
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Diet
        fields = [
            'id',
            'name',
            'description',
            'protein_ratio',
            'carb_ratio',
            'fat_ratio',
            'benefits',
            'image',
            'slug',
            'types',
            'recipes'
        ]
        read_only_fields = ['id', 'user']


# --- Simple Diet Serializer for Saved View ---
class DietSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diet
        fields = ['id', 'name', 'image', 'description']


# --- Mini Diet Type Serializer for nested Saved View ---
class DietTypeMiniSerializer(serializers.ModelSerializer):
    diet = DietSimpleSerializer(read_only=True)

    class Meta:
        model = DietType
        fields = ['id', 'name', 'goal', 'foods', 'avoid', 'diet']


# --- Saved DietType Serializer ---
class SavedDietTypeSerializer(serializers.ModelSerializer):
    diet_type = DietTypeMiniSerializer(read_only=True)

    class Meta:
        model = SavedDietType
        fields = ['id', 'diet_type', 'saved_at']

# serializers.py

class AssignedDietSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedDiet
        fields = '__all__'
        read_only_fields = ['trainer', 'id', 'assigned_at'] 



# --- Recipe Step ---
class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['step_number', 'description']
        read_only_fields = ['id']


# --- Ingredient ---
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['name', 'quantity']
        read_only_fields = ['id']


# --- Full Recipe Detail ---
class RecipeDetailSerializer(serializers.ModelSerializer):
    steps = RecipeStepSerializer(many=True, read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time',
                  'calories', 'protein', 'carbs', 'fat', 'steps', 'ingredients']
        read_only_fields = ['id']
        
# achievements and badges 
class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'code', 'name', 'description', 'icon']

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer()

    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'earned_at']


