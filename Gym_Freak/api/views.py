from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import  Exercise


from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import DietPlan, WorkoutTracking, WorkoutPost, Like, Comment, Share, Exercise



@api_view(['GET'])
def get_exercises(request):
    query = request.GET.get('q', '')
    
    if query:
        exercises = Exercise.objects.filter(
            name__icontains=query
        ) | Exercise.objects.filter(
            target__icontains=query
        ) | Exercise.objects.filter(
            description__icontains=query
        ) | Exercise.objects.filter(
            equipment__icontains=query
        )
    else:
        exercises = Exercise.objects.all()

    exercise_list = list(exercises.values("id", "name", "target", "description", "equipment", "image_url"))
    return JsonResponse(exercise_list, safe=False)

@api_view(['GET'])
def echo(request):
    return JsonResponse(['Hello world this is api'], safe=False)



