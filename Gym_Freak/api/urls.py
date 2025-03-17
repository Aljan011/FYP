from django.urls import path
from .views import RoomView, WorkoutTrackingListCreateView, WorkoutPostListCreateView, DietPlanListCreateView, DietPlanDetailView, ChatMessageListView, SendMessageView, LoginView  # Import the correct view

urlpatterns = [
    path('room', RoomView.as_view()),
    path('workouts/', WorkoutTrackingListCreateView.as_view(), name='workout-tracking-list'), 
    path('workout-posts/', WorkoutPostListCreateView.as_view(), name='workout-post-list'), 
    path('dietplans/', DietPlanListCreateView.as_view(), name="dietplan-list"),
    path('dietplans/<int:pk>/', DietPlanDetailView.as_view(), name="dietplan-detail"),
    path('chat/<int:user_id>/', ChatMessageListView.as_view(), name='chat-messages'),
    path('chat/send/', SendMessageView.as_view(), name='send-message'),
    path('login/', LoginView.as_view(), name='login'),  # Add the login URL pattern
]
