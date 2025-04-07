from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from rest_framework import status, viewsets, filters
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Exercise, WorkoutSession, WorkoutExerciseSet, Diet, Recipe
from .serializers import (
    ExerciseSerializer, 
    WorkoutSessionSerializer, 
    WorkoutExerciseSetSerializer, 
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

# ✅ WORKOUT SESSION VIEWSET
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, started_at=timezone.now())

    @action(detail=True, methods=['POST'])
    def add_exercise_set(self, request, pk=None):
        workout_session = self.get_object()
        serializer = WorkoutExerciseSetSerializer(data=request.data)
        
        if serializer.is_valid():
            exercise_set = serializer.save(workout_session=workout_session)
            workout_session.total_exercises += 1
            workout_session.total_sets += 1
            workout_session.save()
            return Response(WorkoutExerciseSetSerializer(exercise_set).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'])
    def finish_workout(self, request, pk=None):
        workout_session = self.get_object()
        workout_session.ended_at = timezone.now()
        workout_session.total_duration = workout_session.ended_at - workout_session.started_at
        workout_session.notes = request.data.get('notes', workout_session.notes)
        workout_session.save()
        return Response(WorkoutSessionSerializer(workout_session).data, status=status.HTTP_200_OK)

# ✅ WORKOUT EXERCISE SET VIEWSET
class WorkoutExerciseSetViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutExerciseSetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutExerciseSet.objects.filter(workout_session__user=self.request.user)

# ✅ DIET VIEWSET
class DietViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Diet.objects.all()
    serializer_class = DietSerializer

# ✅ RECIPE VIEWSET
class RecipeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    filter_backends = [filters.SearchFilter]
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
