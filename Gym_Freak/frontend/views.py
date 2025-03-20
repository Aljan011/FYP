from django.shortcuts import render

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def workout_view(request, *args, **kwargs):
    return render(request, 'frontend/workout_track.html')