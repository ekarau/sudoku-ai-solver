from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_app', '0007_merge_20260403_0946'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Achievement',
        ),
        migrations.DeleteModel(
            name='LeaderboardResetSchedule',
        ),
    ]
