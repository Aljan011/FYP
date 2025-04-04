from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, filters
from .models import  Exercise
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from .serializers import RegistrationSerializer, UserSerializer
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Exercise, WorkoutSession, WorkoutExerciseSet, Diet, Recipe
from .serializers import (
    ExerciseSerializer, 
    WorkoutSessionSerializer, 
    WorkoutExerciseSetSerializer, DietSerializer,
    RecipeSerializer, RecipeDetailSerializer
)


# class LoginView(APIView):
#     permission_classes = [permissions.AllowAny]

#     # def get(self, request):
#     #     return JsonResponse({"detail": "GET method not allowed"}, status=405)

#     def post(self, request):
#         print("POST request received - CSRF exempt")
#         print("POST request received")  # Debugging line
#         username = request.data.get('username')
#         password = request.data.get('password')

#         user = authenticate(username=username, password=password)

#         if user is not None:
#             if user.is_active:
#                 login(request, user)
#                 return Response({
#                     'id': user.id,
#                     'username': user.username,
#                     'is_active': user.is_active
#                 }, status=status.HTTP_200_OK)
#             else:
#                 return Response({'detail': 'Account pending approval'}, status=status.HTTP_403_FORBIDDEN)

#         return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("POST request received - CSRF exempt")
        
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({
                    'id': user.id,
                    'username': user.username,
                    'is_active': user.is_active
                }, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Account pending approval'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

class ApproveUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"message": "User approved successfully"}, status=200)

class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]  # 👈 ALLOW PUBLIC ACCESS

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

class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user and started_at time
        serializer.save(
            user=self.request.user, 
            started_at=timezone.now()
        )

    @action(detail=True, methods=['POST'])
    def add_exercise_set(self, request, pk=None):
        workout_session = self.get_object()
        serializer = WorkoutExerciseSetSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create exercise set and link to workout session
            exercise_set = serializer.save(workout_session=workout_session)
            
            # Update workout session stats
            workout_session.total_exercises += 1
            workout_session.total_sets += 1
            workout_session.save()
            
            return Response(
                WorkoutExerciseSetSerializer(exercise_set).data, 
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['POST'])
    def finish_workout(self, request, pk=None):
        workout_session = self.get_object()
        
        # Calculate total duration
        workout_session.ended_at = timezone.now()
        workout_session.total_duration = (
            workout_session.ended_at - workout_session.started_at
        )
        
        # Optional: Add notes from request
        if 'notes' in request.data:
            workout_session.notes = request.data['notes']
        
        workout_session.save()
        
        return Response(
            WorkoutSessionSerializer(workout_session).data, 
            status=status.HTTP_200_OK
        )

class WorkoutExerciseSetViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutExerciseSetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutExerciseSet.objects.filter(
            workout_session__user=self.request.user
        )

class DietViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Diet.objects.all()
    serializer_class = DietSerializer

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
        return Response({"error": "Diet ID parameter is required"}, status=400)


