from django.urls import path
from .views import RoomView, WorkoutTrackingListCreateView, WorkoutPostListCreateView  # Import the correct view

urlpatterns = [
    path('room', RoomView.as_view()),
    path('workouts/', WorkoutTrackingListCreateView.as_view(), name='workout-tracking-list'), 
    path('workout-posts/', WorkoutPostListCreateView.as_view(), name='workout-post-list'), 
]


