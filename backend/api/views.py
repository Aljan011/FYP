from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.http import JsonResponse
from rest_framework import status, viewsets, filters, permissions, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import Exercise, WorkoutSession, WorkoutExerciseSet, Diet, Recipe, UserProfile, Workout, WorkoutPost
from .serializers import (
    ExerciseSerializer, WorkoutSerializer,
    WorkoutSessionSerializer, 
    WorkoutExerciseSetSerializer, WorkoutPostSerializer,
    DietSerializer,
    RecipeSerializer, RecipeDetailSerializer, 
    RegistrationSerializer, UserSerializer
)


# ✅ LOGIN VIEW WITH TOKEN
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                # 🔐 Get or create token
                token, _ = Token.objects.get_or_create(user=user)

                return Response({
                    'id': user.id,
                    'username': user.username,
                    'is_active': user.is_active,
                    'token': token.key  # ✅ Send token in response
                }, status=status.HTTP_200_OK)
            return Response({'detail': 'Account pending approval'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# ✅ USER REGISTRATION VIEW
class RegisterUserView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]

# ✅ APPROVE USER VIEW (Admin Only)
class ApproveUserView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"message": "User approved successfully"}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        user_data = {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile": {
                "bio": profile.bio,
                "date_of_birth": profile.date_of_birth,
                "phone_number": profile.phone_number,
                "address": profile.address,
                "favorite_exercises": profile.favorite_exercises,
                "preferred_diet_plan": profile.preferred_diet_plan,
            }
        }
        
        if profile.profile_picture:
            user_data["profile"]["profile_picture"] = profile.profile_picture.url
            
        return Response(user_data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update user data
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        
        user.save()
        
        # Update profile data
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        if 'date_of_birth' in request.data:
            profile.date_of_birth = request.data['date_of_birth']
        if 'phone_number' in request.data:
            profile.phone_number = request.data['phone_number']
        if 'address' in request.data:
            profile.address = request.data['address']
        if 'favorite_exercises' in request.data:
            profile.favorite_exercises = request.data['favorite_exercises']
        if 'preferred_diet_plan' in request.data:
            profile.preferred_diet_plan = request.data['preferred_diet_plan']
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
        
        profile.save()
        
        # Return updated user data
        return self.get(request)

class UserProfileViewSet(viewsets.ModelViewSet):
    
    @action(detail=True, methods=['get'])
    def workouts(self, request, pk=None):
        """Get workouts for a specific user profile"""
        User = get_user_model()
        try:
            user = User.objects.get(pk=pk)
            # Check permission - only allow if requesting own data or admin
            if request.user != user and not request.user.is_staff:
                return Response(
                    {"detail": "You do not have permission to view this user's workouts"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            workouts = Workout.objects.filter(user=user).order_by('-created_at')
            serializer = WorkoutSerializer(workouts, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

# ✅ EXERCISE VIEWSET (Public Access)
class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return Exercise.objects.filter(
                Q(name__icontains=query) | 
                Q(target__icontains=query) | 
                Q(description__icontains=query) | 
                Q(equipment__icontains=query)
            )
        return Exercise.objects.all()
    
    
class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Workout.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Add this method to get user workouts
    @action(detail=False, methods=['get'])
    def user_workouts(self, request):
        """Get all workouts for the current user"""
        workouts = self.get_queryset()
        serializer = self.get_serializer(workouts, many=True)
        return Response(serializer.data)
    
class UserWorkoutList(APIView):
     permission_classes = [IsAuthenticated]

     def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        workouts = Workout.objects.filter(user=user).order_by('-created_at')
        serializer = WorkoutSerializer(workouts, many=True)
        return Response(serializer.data)


# ✅ WORKOUT SESSION VIEWSET
     """
    The code defines viewsets for managing workout sessions and exercise sets, including actions to add
    exercise sets and finish a workout session.
    
    :param request: The `request` parameter in Django represents the HTTP request that triggered the
    view. It contains information about the request, such as the request method, headers, data, and user
    making the request. In the context of Django viewsets, the `request` parameter is typically used to
    access data sent in
    :param pk: The `pk` parameter in Django REST framework stands for "primary key" and is used to
    identify a specific instance of a model. In the context of a viewset, `pk` refers to the primary key
    value of the object being operated on. It is typically used in URLs to specify which
    :return: The `WorkoutSessionViewSet` class defines a viewset for managing workout sessions. It
    includes methods for creating workout sessions, adding exercise sets to a session, and finishing a
    workout session. The `WorkoutExerciseSetViewSet` class defines a viewset for managing workout
    exercise sets. Both viewsets require authentication for access.
    """
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated]
    queryset = WorkoutSession.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, started_at=timezone.now())

    @action(detail=True, methods=['POST'])
    def add_exercise_set(self, request, pk=None):
        workout_session = self.get_object()
        print(f"Received request data: {request.data}")  # Debug

        serializer = WorkoutExerciseSetSerializer(data=request.data)
        if serializer.is_valid():
            exercise_set = serializer.save(workout_session=workout_session)
            workout_session.total_exercises += 1
            workout_session.total_sets += 1
            workout_session.save()

            return Response(WorkoutExerciseSetSerializer(exercise_set).data, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")  # Debug
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'])
    def finish_workout(self, request, pk=None):
        workout_session = self.get_object()

        workout_session.ended_at = timezone.now()
        workout_session.total_duration = workout_session.ended_at - workout_session.started_at

        notes = request.data.get('notes', "")
        if notes:
            workout_session.notes = notes
        workout_session.save()

        # 💥 Create a Workout entry
        workout = Workout.objects.create(
            user=request.user,
            title=f"Workout on {workout_session.started_at.strftime('%Y-%m-%d')}",
            description=notes,
            duration=workout_session.total_duration,
            notes=notes,
        )

        # ✅ Add exercises
        exercises = Exercise.objects.filter(
            id__in=workout_session.exercise_sets.values_list('exercise_id', flat=True)
        ).distinct()
        workout.exercises.set(exercises)

        # ✅ Add sets
        sets = []
        for exercise_set in workout_session.exercise_sets.all():
            sets.append({
                "exercise": exercise_set.exercise.name,
                "set_number": exercise_set.set_number,
                "weight": exercise_set.weight,
                "reps": exercise_set.reps,
                "rest_time": exercise_set.rest_time,
            })
        workout.sets = sets
        workout.save()

        # 🔗 Link the WorkoutSession to Workout
        workout.session = workout_session
        workout.save()

        return Response({"message": "Workout finished successfully", "workout_id": workout.id}, status=status.HTTP_200_OK)


# ✅ WORKOUT EXERCISE SET VIEWSET
class WorkoutExerciseSetViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutExerciseSetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutExerciseSet.objects.filter(workout_session__user=self.request.user)
    
class WorkoutPostCreateView(generics.CreateAPIView):
    serializer_class = WorkoutPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WorkoutPostListView(generics.ListAPIView):
    queryset = WorkoutPost.objects.all().order_by('-posted_at')
    serializer_class = WorkoutPostSerializer
    permission_classes = [permissions.IsAuthenticated]

# ✅ DIET VIEWSET
class DietViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Diet.objects.all()
    serializer_class = DietSerializer
    lookup_field = 'slug'
    
    def get_object(self):
          queryset = self.get_queryset()
          filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
          obj = get_object_or_404(queryset, **filter_kwargs)
          self.check_object_permissions(self.request, obj)
          return obj

# ✅ RECIPE VIEWSET
class RecipeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['diet']
    search_fields = ['title', 'description', 'tags']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RecipeDetailSerializer
        return RecipeSerializer

    @action(detail=False, methods=['get'])
    def by_diet(self, request):
        diet_id = request.query_params.get('diet_id')
        if diet_id:
            recipes = Recipe.objects.filter(diet_id=diet_id)
            serializer = self.get_serializer(recipes, many=True)
            return Response(serializer.data)
        return Response({"error": "Diet ID parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
