from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    # 42 Intra Data
    email = models.EmailField(unique=True)
    intra_id = models.IntegerField(unique=True, null=True, blank=True)
    display_name = models.CharField(max_length=50, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # Social Features (Friends & Status)
    # last_seen tracks the exact moment of the last WebSocket pulse or request
    last_seen = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)

    def __str__(self):
        return f"{self.username} ({self.display_name})"

    @property
    def status(self):
        """
        Returns 'online' if the boolean is True AND the user has been seen 
        within the last 60 seconds (prevents ghost-online status).
        """
        if self.is_online and self.last_seen:
            now = timezone.now()
            if self.last_seen > now - timezone.timedelta(seconds=60):
                return "online"
        return "offline"


class Relationship(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('friends', 'Friends')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
