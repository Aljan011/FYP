from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views
from .views import RegisterUserView, ApproveUserView, LoginView, DietViewSet, RecipeViewSet, UserProfileView

# Initialize the router
router = DefaultRouter()

# Register viewsets (for models that require ViewSets)
router.register(r'exercises', views.ExerciseViewSet, basename='exercise')
# router.register(r'finish_workout', views.FinishWorkoutViewSet, basename='finishworkout')
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
    
     # ✅ User Profile API Endpoint
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    
    
    path('token/', obtain_auth_token, name='api_token_auth'),

    # Django REST Framework's built-in login/logout endpoints
    path("api-auth/", include("rest_framework.urls")),
]
