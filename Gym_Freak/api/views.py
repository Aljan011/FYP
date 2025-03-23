from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import DietPlan, WorkoutTracking, WorkoutPost, Like, Comment, Share, Exercise
from .serializers import DietPlanSerializer, WorkoutTrackingSerializer, WorkoutPostSerializer, LikeSerializer, CommentSerializer, ShareSerializer, ChatMessageSerializer, ExerciseSerializer

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import DietPlan, WorkoutTracking, WorkoutPost, Like, Comment, Share, Exercise
from .serializers import DietPlanSerializer, WorkoutTrackingSerializer, WorkoutPostSerializer, LikeSerializer, CommentSerializer, ShareSerializer, ChatMessageSerializer, ExerciseSerializer

class LoginView(APIView):
    def post(self, request):
        print('hrllo')
        data = request.data
        username = data.get('username');
        password = data.get('password');
        response = [username, password];

        isValidCredential = False;

        if username == 'aljan' and password == 'chatake':
            isValidCredential = True;
        
        if isValidCredential == True:
            response = {
                'message': 'Login Successful',
                'status': 200
            }
        else:
            response = {
                'message': 'Invalid Credentials',
                'status': 401
            }
        return Response(response);


class DietPlanListCreateView(ListCreateAPIView):
    queryset = DietPlan.objects.all()
    serializer_class = DietPlanSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DietPlanDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DietPlan.objects.all()
    serializer_class = DietPlanSerializer
    # permission_classes = [IsAuthenticated]


class WorkoutTrackingListCreateView(ListCreateAPIView):
    queryset = WorkoutTracking.objects.all()
    serializer_class = WorkoutTrackingSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutTrackingDetailView(RetrieveUpdateDestroyAPIView):
    queryset = WorkoutTracking.objects.all()
    serializer_class = WorkoutTrackingSerializer
    # permission_classes = [IsAuthenticated]


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



class WorkoutPostListCreateView(ListCreateAPIView):
    queryset = WorkoutPost.objects.all()
    serializer_class = WorkoutPostSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutPostDetailView(RetrieveUpdateDestroyAPIView):
    queryset = WorkoutPost.objects.all()
    serializer_class = WorkoutPostSerializer
    # permission_classes = [IsAuthenticated]


# Views for Like

class LikeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(WorkoutPost, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            return Response({"message": "Post liked successfully!"}, status=status.HTTP_201_CREATED)
        return Response({"message": "You already liked this post."}, status=status.HTTP_400_BAD_REQUEST)

# Views for Comment

class CommentCreateView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(WorkoutPost, id=post_id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Views for Share

class ShareCreateView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(WorkoutPost, id=post_id)
        share, created = Share.objects.get_or_create(user=request.user, post=post)
        if created:
            return Response({"message": "Post shared successfully!"}, status=status.HTTP_201_CREATED)
        return Response({"message": "You already shared this post."}, status=status.HTTP_400_BAD_REQUEST)
    
# Views for ChatMessage
class ChatMessageListView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SendMessageView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
