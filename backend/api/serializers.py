from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Exercise, WorkoutSession, WorkoutExerciseSet, UserProfile, Diet, Recipe, RecipeStep, Ingredient, Workout, WorkoutTracking, WorkoutPost
# from rest_framework import serializers



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_active"]

# class RegistrationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Userfrom rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import Exercise, WorkoutSession, WorkoutExerciseSet, UserProfile, Diet, Recipe, RecipeStep, Ingredient

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_active"]
        read_only_fields = ["is_active"]

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
        # Pop profile-related fields
        profile_data = {
            'bio': validated_data.pop('bio', ''),
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'phone_number': validated_data.pop('phone_number', ''),
            'address': validated_data.pop('address', ''),
            'favorite_exercises': validated_data.pop('favorite_exercises', ''),
            'preferred_diet_plan': validated_data.pop('preferred_diet_plan', ''),
        }

        # Create user
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # still requires admin approval
        user.save()

        # Create user profile with additional info
        UserProfile.objects.create(user=user, **profile_data)

        return user

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
         workout_session = validated_data.get('workout_session')  # Ensure this is passed
         # Now you can save it to the database
         exercise_set = WorkoutExerciseSet.objects.create(**validated_data)
         return exercise_set

class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercise_sets = WorkoutExerciseSetSerializer(
        many=True, 
        read_only=True
    )
    
    class Meta:
        model = WorkoutSession
        fields = '__all__'
        read_only_fields = ['id', 'user', 'started_at']

class DietSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diet
        fields = '__all__'
        read_only_fields = ['id']

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['step_number', 'description']
        read_only_fields = ['id']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['name', 'quantity']
        read_only_fields = ['id']

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time', 
                  'calories', 'protein', 'carbs', 'fat']
        read_only_fields = ['id']

class RecipeDetailSerializer(serializers.ModelSerializer):
    steps = RecipeStepSerializer(many=True, read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)
    
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time', 
                  'calories', 'protein', 'carbs', 'fat', 'steps', 'ingredients']
        read_only_fields = ['id']
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Requires admin approval
        user.save()
        UserProfile.objects.create(user=user)
        return user

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'target', 'difficulty', 
            'equipment', 'description', 'image_url', 
            'recommended_sets', 'recommended_reps', 
            'recommended_rest_time'
        ]

# class WorkoutExerciseSetSerializer(serializers.ModelSerializer):
#     exercise = ExerciseSerializer(read_only=True)
#     exercise_id = serializers.PrimaryKeyRelatedField(
#         queryset=Exercise.objects.all(), 
#         source='exercise', 
#         write_only=True
#     )

#     class Meta:
#         model = WorkoutExerciseSet
#         fields = [
#             'id', 'exercise', 'exercise_id', 'workout_session', 
#             'set_number', 'weight', 'reps', 'rest_time'
#         ]
#         read_only_fields = ['id']

class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercise_sets = WorkoutExerciseSetSerializer(many=True, read_only=True)
    workout_id = serializers.PrimaryKeyRelatedField(
        queryset=Workout.objects.all(), 
        source='workout',
        write_only=True,
        required=False
    )
    workout = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'user', 'workout', 'workout_id', 'started_at', 'ended_at', 
            'total_duration', 'total_exercises', 'total_sets', 'notes', 'exercise_sets'
        ]
        read_only_fields = ['user', 'started_at', 'workout', 'exercise_sets']
        
class DietSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diet
        fields = '__all__'

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['step_number', 'description']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['name', 'quantity']

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time', 
                  'calories', 'protein', 'carbs', 'fat']

class RecipeDetailSerializer(serializers.ModelSerializer):
    steps = RecipeStepSerializer(many=True, read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)
    
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'image', 'prep_time', 
                  'calories', 'protein', 'carbs', 'fat', 'steps', 'ingredients']