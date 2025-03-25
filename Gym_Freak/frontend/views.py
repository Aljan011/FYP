from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    try:
        return render(request, 'index.html')  # Renders index.html from the templates directory
    except Exception as e:
        return HttpResponse(f"Error loading template: {e}")