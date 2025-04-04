from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import RegisterUserView, ApproveUserView, LoginView, DietViewSet, RecipeViewSet

# Initialize the router
router = DefaultRouter()

# Register viewsets (for models that require ViewSets)
router.register(r'exercises', views.ExerciseViewSet, basename='exercise')
router.register(r'workout_sessions', views.WorkoutSessionViewSet, basename='workoutsession')
router.register(r'workout_exercise_sets', views.WorkoutExerciseSetViewSet, basename='workoutexerciseset')
router.register(r'diets', DietViewSet)
router.register(r'recipes', RecipeViewSet)

# Define the API URLs
urlpatterns = [
    path('', include(router.urls)),  # Includes all ViewSet routes

    # ✅ Ensure API prefix for endpoints
    path("register/", RegisterUserView.as_view(), name="register"),
    path("approve/<int:pk>/", ApproveUserView.as_view(), name="approve-user"),
    path("login/", LoginView.as_view(), name="login"),

    # Django REST Framework's built-in login/logout endpoints
    path("api-auth/", include("rest_framework.urls")),
]
