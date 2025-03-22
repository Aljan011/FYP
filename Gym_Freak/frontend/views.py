from django.shortcuts import render

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def workout_view(request, *args, **kwargs):
    return render(request, 'frontend/workout_track.html')

def diet_plan_view(request):
    return render(request, 'frontend/DietPlan.html') 