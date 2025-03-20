from django.urls import path
from .views import index, workout_view

urlpatterns = [
    path ('', index),
    path('user', index, name = 'user'),
    path('workout/', workout_view, name='workout_tracking'),
]