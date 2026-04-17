import os
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import CustomUser


# 1. Delete file from system when user is deleted
@receiver(post_delete, sender=CustomUser)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.avatar:
        if os.path.isfile(instance.avatar.path):
            os.remove(instance.avatar.path)

# 2. Delete old file when a new one is uploaded
@receiver(pre_save, sender=CustomUser)
def auto_delete_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return False

    try:
        old_file = CustomUser.objects.get(pk=instance.pk).avatar
    except CustomUser.DoesNotExist:
        return False

    new_file = instance.avatar
    if not old_file == new_file:
        if old_file and os.path.isfile(old_file.path):
            os.remove(old_file.path)