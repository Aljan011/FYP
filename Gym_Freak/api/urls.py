from django.urls import path
from .views import (
    get_exercises,
)

urlpatterns = [
    # API routes (no extra 'api/')
    # path("exercises/", get_exercises, name="get_exercises"),
    path('api/workouts', get_exercises, name='get_exercises'),

]
