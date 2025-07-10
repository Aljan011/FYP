# api/permissions.py

from rest_framework.permissions import BasePermission

class IsTrainer(BasePermission):
    """
    Allows access only to users with role 'trainer'.
    """

    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and request.user.profile.role == 'trainer'
