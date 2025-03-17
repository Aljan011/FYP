from django.urls import path
from .views import index

urlpatterns = [
    path ('', index),
    path('user', index),
    path('workout/', index, name='workout_tracking'),
]