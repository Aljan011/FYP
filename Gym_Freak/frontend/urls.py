from django.urls import path
from .views import index

urlpatterns = [
    path ('', index),
    path('user', index, name = 'user'),
    path('workouts/', index, name='workout_tracking'),
    path('diet-plan/', index, name='diet-plan'),
]