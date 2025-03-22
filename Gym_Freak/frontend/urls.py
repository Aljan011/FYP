from django.urls import path
from .views import index, workout_view, diet_plan_view

urlpatterns = [
    path ('', index),
    path('user', index, name = 'user'),
    path('workouts/', workout_view, name='workout_tracking'),
    path('diet-plan/', diet_plan_view, name='diet-plan'),
]