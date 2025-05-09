from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from django.conf.urls.static import static
from django.conf import settings
from . import views
from .views import RegisterUserView, ApproveUserView, LoginView, UserProfileView, DietViewSet, RecipeViewSet, WorkoutViewSet, UserWorkoutList, WorkoutPostListView, WorkoutPostCreateView, WorkoutPlanViewSet, chat_partners_for_user, get_chat_history

# Initialize the router
router = DefaultRouter()

# Register viewsets (for models that require ViewSets)
router.register(r'exercises', views.ExerciseViewSet, basename='exercise')
router.register(r'workouts', WorkoutViewSet, basename='workout')

# router.register(r'finish_workout', views.FinishWorkoutViewSet, basename='finishworkout')
router.register(r'workout_sessions', views.WorkoutSessionViewSet, basename='workoutsession')
router.register(r'workout_exercise_sets', views.WorkoutExerciseSetViewSet, basename='workoutexerciseset')
router.register(r'workout-plans', WorkoutPlanViewSet, basename='workoutplan')
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
    
    #workout fetch api
     path('users/<str:username>/workouts/', UserWorkoutList.as_view(), name='user-workouts'),
    
    
    path('token/', obtain_auth_token, name='api_token_auth'),
    
    #Workout post urls
    path('workout-posts/', WorkoutPostListView.as_view(), name='workout-posts'),
    path('workout-posts/create/', WorkoutPostCreateView.as_view(), name='create-workout-post'),
    
    #chat urls
    path('chat-partners-for-user/<int:user_id>/', chat_partners_for_user),
    path('chat-history/<int:user_id>/<int:partner_id>/', get_chat_history),



    # Django REST Framework's built-in login/logout endpoints
    path("api-auth/", include("rest_framework.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
