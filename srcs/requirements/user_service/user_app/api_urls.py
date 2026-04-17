from django.urls import path
from . import api_views

urlpatterns = [
    path('me/', api_views.current_user_api, name='api-current-user'),
    path('friends/', api_views.friend_action_api, name='api-friends'),
    path('friends/status/<str:username>/', api_views.check_friend_status_api, name='check_friend_status'),
    path('signup/', api_views.signup_api, name='api-signup'),
    path('login/', api_views.login_api, name='api_login'),
    path('profile/edit/', api_views.edit_api, name='epi_edit'),
    path('profile/delete/', api_views.delete_account_api, name='delete_account_api'),
    path('csrf/', api_views.get_csrf_token, name='get_csrf_token'),
    path('logout/', api_views.logout_api, name='api_logout'),
    path('info/<int:user_id>/', api_views.user_info_api, name='user_info_api'),
    path('auth/login/', api_views.FortyTwoLoginView.as_view(), name='api-fortytwo-login'),
    path('auth/callback/', api_views.FortyTwoCallbackView.as_view(), name='api-fortytwo-callback'),
    path('by-username/<str:username>/', api_views.user_by_username_api, name='user_by_username_api'),
]