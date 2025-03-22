from django.urls import path
from .views import (
    DietPlanListCreateView, DietPlanDetailView, 
    ChatMessageListView, SendMessageView, LoginView, 
    WorkoutPostDetailView, WorkoutPostListCreateView, 
    WorkoutTrackingDetailView, WorkoutTrackingListCreateView, 
    get_exercises
)

urlpatterns = [
    # API routes (no extra 'api/')
    path('dietplans/', DietPlanListCreateView.as_view(), name="dietplan-list"),
    path('dietplans/<int:pk>/', DietPlanDetailView.as_view(), name="dietplan-detail"),
    
    # Chat
    path('chat/<int:user_id>/', ChatMessageListView.as_view(), name='chat-messages'),
    path('chat/send/', SendMessageView.as_view(), name='send-message'),
    
    # Authentication
    path('login/', LoginView.as_view(), name='login'),  

    # Exercises
    # path("exercises/", get_exercises, name="get_exercises"),
    path('get_exercises/', get_exercises, name='get_exercises'),

    # Workout Tracking
    path("workouts/", WorkoutTrackingListCreateView.as_view(), name="workout-list"),
    path("workouts/<int:pk>/", WorkoutTrackingDetailView.as_view(), name="workout-detail"),

    # Workout Posts
    path("posts/", WorkoutPostListCreateView.as_view(), name="workout-posts"),
    path("posts/<int:pk>/", WorkoutPostDetailView.as_view(), name="workout-post-detail"),
]
