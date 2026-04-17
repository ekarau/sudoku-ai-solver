from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import CustomUser

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom authentication backend to allow login by either username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get('username')

        if username is None:
            return None

        try:
            # Check for a user where username OR email matches
            user = CustomUser.objects.get(Q(username=username) | Q(email=username))
            
            # Check password
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except CustomUser.DoesNotExist:
            return None
        
        return None
