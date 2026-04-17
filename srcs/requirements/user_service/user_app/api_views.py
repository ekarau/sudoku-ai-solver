from django.conf import settings
from django.shortcuts import redirect
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
import requests

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

# Channels katmanı (WebSocket haberleşmesi için)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Modeller ve Serializerlar
from .models import CustomUser, Relationship
from .serializers import CustomUserSerializer, RegisterSerializer

# --- YARDIMCI FONKSİYONLAR (JWT & COOKIE) ---

def get_tokens_for_user(user):
    """Kullanıcı için manuel JWT token üretir."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def set_jwt_cookies(response, user):
    """Response nesnesine JWT token'larını cookie olarak ekler."""
    tokens = get_tokens_for_user(user)
    
    # Access Token (Kısa ömürlü - 1 saat)
    response.set_cookie(
        key='access_token',
        value=tokens['access'],
        httponly=False,  # Frontend okuyabilsin diye False (WebSocket için)
        samesite='Lax',
        secure=True,
        max_age=3600
    )
    
    # Refresh Token (Uzun ömürlü - 1 gün)
    response.set_cookie(
        key='refresh_token',
        value=tokens['refresh'],
        httponly=True,   # Güvenlik için JS okuyamasın
        samesite='Lax',
        secure=True,
        max_age=86400
    )

def set_jwt_cookie_and_redirect(user, request, target_url=None):
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    response = redirect('/') # Redirect to frontend home

    response.set_cookie(
        key='refresh_token', 
        value=str(refresh), 
        httponly=True, 
        secure=True, 
        samesite='Lax',
        path='/'
    )
    
    response.set_cookie(
        key='access_token', 
        value=access_token, 
        httponly=False, 
        secure=True, 
        samesite='Lax',
        path='/'
    )
    
    return response

# --- 42 OAUTH VIEWS ---

class FortyTwoLoginView(APIView):
    """Force logout then redirect to 42 Authorization."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        if request.user.is_authenticated:
            logout(request)
            
        url = (
            f"https://api.intra.42.fr/oauth/authorize"
            f"?client_id={settings.FT_CLIENT_ID}"
            f"&redirect_uri={settings.FT_REDIRECT_URI}"
            f"&response_type=code"
        )
        return redirect(url)

class FortyTwoCallbackView(APIView):
    """Handles return from 42, fetches user data, and logs them in."""
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return JsonResponse({"error": "No code provided"}, status=400)

        # 1. Exchange code for Access Token
        token_response = requests.post("https://api.intra.42.fr/oauth/token", data={
            "grant_type": "authorization_code",
            "client_id": settings.FT_CLIENT_ID,
            "client_secret": settings.FT_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.FT_REDIRECT_URI,
        })
        
        if token_response.status_code != 200:
            print(f"42 Token Error: {token_response.status_code} {token_response.text}", flush=True)
            return JsonResponse({"error": "Failed to get token"}, status=400)
            
        access_token = token_response.json().get("access_token")

        # 2. Get User Info
        user_info_res = requests.get("https://api.intra.42.fr/v2/me", headers={
            "Authorization": f"Bearer {access_token}"
        })
        user_info = user_info_res.json()

        # 3. Create or Get User
        intra_id = user_info.get('id')
        try:
            user = CustomUser.objects.get(intra_id=intra_id)
            created = False
        except CustomUser.DoesNotExist:
            base_username = f"42_{user_info.get('login')}"
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
                
            user = CustomUser.objects.create(
                intra_id=intra_id,
                username=username,
                display_name=username,
                email=user_info.get('email'),
                is_active=True
            )
            created = True

        if not user.display_name:
            user.display_name = user.username
            user.save()

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        request.session.modified = True
        
        return set_jwt_cookie_and_redirect(user, request)

# --- TEMEL VIEWLER ---

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Frontend'in CSRF token alabilmesi için endpoint."""
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([AllowAny])
def current_user_api(request):
    """Giriş yapmış kullanıcının bilgilerini döner, misafirse null döner."""
    if request.user.is_authenticated:
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    return Response({"user": None}, status=200)

# --- LOGIN API GÜNCELLEMESİ ---
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_api(request):
    if request.method == 'GET':
        return Response({"message": "CSRF cookie set"})

    if request.user.is_authenticated:
        logout(request)

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = authenticate(request, username=username, password=password)

    if user:
        login(request, user)
        
        user.is_online = True
        user.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "online_users",
            {
                "type": "user_update",
                "user_id": user.id,
                "status": "online"
            }
        )

        response = Response({
            "message": "Login successful", 
            "user": {
                "id": user.id, 
                "username": user.username,
                "display_name": getattr(user, 'display_name', user.username),
                "is_superuser": user.is_superuser,
                "avatar": user.avatar.url if user.avatar else None
            }
        }, status=200)
        
        set_jwt_cookies(response, user)
        return response
    
    return Response({"error": "Invalid credentials"}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_api(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        
        response = Response({
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "username": user.username
            }
        }, status=201)
        
        set_jwt_cookies(response, user)
        return response
    return Response(serializer.errors, status=400)

@csrf_exempt
def logout_api(request):
    if request.method == "POST":
        logout(request) # Django session'ı kapatır
        response = JsonResponse({'message': 'Successfully logged out'})
        
        # Tüm çerezleri sil
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        
        return response
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# --- ARKADAŞLIK İŞLEMLERİ ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def friend_action_api(request):
    if request.method == 'GET':
        # Incoming pending requests (to_user=me)
        pending_incoming = Relationship.objects.filter(to_user=request.user, status='pending')
        
        # Outgoing pending requests (from_user=me)
        pending_outgoing = Relationship.objects.filter(from_user=request.user, status='pending')
        
        friends_rel = Relationship.objects.filter(
            Q(status='friends') & (Q(from_user=request.user) | Q(to_user=request.user))
        )

        friends_data = []
        for rel in friends_rel:
            friend_user = rel.to_user if rel.from_user == request.user else rel.from_user
            
            d_name = getattr(friend_user, 'display_name', None) or friend_user.username

            friends_data.append({
                "id": friend_user.id,
                "username": friend_user.username,
                "display_name": d_name,
                "avatar": friend_user.avatar.url if friend_user.avatar else None,
                "is_online": getattr(friend_user, 'is_online', False),
                "rel_id": rel.id
            })

        # Incoming pending requests
        pending_incoming_data = []
        for r in pending_incoming:
            p_d_name = getattr(r.from_user, 'display_name', None) or r.from_user.username

            pending_incoming_data.append({
                "id": r.from_user.id,
                "username": r.from_user.username,
                "display_name": p_d_name,
                "avatar": r.from_user.avatar.url if r.from_user.avatar else None,
                "rel_id": r.id,
                "type": "incoming"
            })

        # Outgoing pending requests
        pending_outgoing_data = []
        for r in pending_outgoing:
            p_d_name = getattr(r.to_user, 'display_name', None) or r.to_user.username

            pending_outgoing_data.append({
                "id": r.to_user.id,
                "username": r.to_user.username,
                "display_name": p_d_name,
                "avatar": r.to_user.avatar.url if r.to_user.avatar else None,
                "rel_id": r.id,
                "type": "outgoing"
            })

        return Response({
            "friends": friends_data, 
            "pending_requests": pending_incoming_data,
            "sent_requests": pending_outgoing_data
        })

    # --- POST: Aksiyonlar (Send, Approve, Remove) ---
    action = request.data.get("action")
    
    if action == "send":
        target_username = request.data.get("target_username") 
        if not target_username or not target_username.strip():
            return Response({"success": False, "error": "Username is required."}, status=200)

        try:
            target_user = CustomUser.objects.get(username=target_username)
        except CustomUser.DoesNotExist:
            return Response({"success": False, "error": "User not found."}, status=200)

        if target_user == request.user:
             return Response({"error": "You cannot add yourself."}, status=400)

        exists = Relationship.objects.filter(
            (Q(from_user=request.user) & Q(to_user=target_user)) |
            (Q(from_user=target_user) & Q(to_user=request.user))
        ).exists()

        if exists:
            return Response({"message": "Relationship already exists"}, status=200)

        Relationship.objects.create(from_user=request.user, to_user=target_user, status='pending')
        return Response({"message": f"Request sent to {target_username}!"}, status=201)

    elif action == "approve":
        rel_id = request.data.get("rel_id")
        if not rel_id:
            return Response({"success": False, "error": "Request ID is required."}, status=200)
        try:
            rel = Relationship.objects.get(id=rel_id, to_user=request.user)
            rel.status = 'friends'
            rel.save()
            return Response({"message": "Friend request approved!"})
        except Relationship.DoesNotExist:
            return Response({"success": False, "error": "Request not found."}, status=200)

    elif action == "remove":
        rel_id = request.data.get("rel_id")
        if not rel_id:
            return Response({"success": False, "error": "Relationship ID is required."}, status=200)
        Relationship.objects.filter(
            Q(id=rel_id) & (Q(from_user=request.user) | Q(to_user=request.user))
        ).delete()
        return Response({"message": "Friendship/Request removed."})

    return Response({"error": "Invalid action."}, status=400)

# --- PROFİL DÜZENLEME ---

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def edit_api(request):
    user = request.user
    data = request.data

    if 'display_name' in data:
        display_name = data['display_name'].strip()
        if len(display_name) < 3 or len(display_name) > 20:
            return Response({"error": "Display name must be between 3 and 20 characters."}, status=status.HTTP_400_BAD_REQUEST)
        if re.search(r'<[^>]*>', display_name):
            return Response({"error": "Display name cannot contain script or HTML tags."}, status=status.HTTP_400_BAD_REQUEST)
        user.display_name = display_name
    
    if 'email' in data:
        email = data['email']
        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email format."}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email

    if data.get('remove_avatar') == 'true' or data.get('remove_avatar') is True:
        user.avatar = None
    elif 'avatar' in request.FILES:
        avatar_file = request.FILES['avatar']
        
        # 1. Size check (10MB)
        if avatar_file.size > 10 * 1024 * 1024:
            return Response({"error": "Avatar file size must be less than 10MB."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        
        # 2. Extension check
        ext = avatar_file.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'gif']:
            return Response({"error": "Unsupported file extension. Use jpg, jpeg, png, or gif."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.avatar = avatar_file

    try:
        # 3. Pillow validation (ImageField check)
        user.full_clean()
        user.save()
        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "display_name": getattr(user, 'display_name', user.username),
                "email": user.email,
                "avatar": user.avatar.url if user.avatar else None
            }
        }, status=200)
    except ValidationError as ve:
        return Response({"error": ve.message_dict}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def user_info_api(request, user_id):
    """Verilen ID'ye göre kullanıcının temel bilgilerini döner (Lobi için)"""
    try:
        user = CustomUser.objects.get(id=user_id)
        d_name = getattr(user, 'display_name', None) or user.username
        
        return Response({
            "id": user.id,
            "username": user.username,
            "display_name": d_name,
            "avatar": user.avatar.url if user.avatar else None
        }, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return Response({"success": False, "error": "User not found"}, status=status.HTTP_200_OK)



@api_view(['DELETE', 'POST'])
@permission_classes([IsAuthenticated])
def delete_account_api(request):
    """API endpoint to delete the current user's account."""
    user = request.user
    
    # 1. WS Disconnect (Opsiyonel ama iyi olur)
    # user.is_online = False
    # user.save()
    
    # 2. Sil
    user.delete()
    
    # 3. Oturumu Kapat ve Çerezleri Sil
    from django.contrib.auth import logout
    logout(request)
    
    response = Response({"message": "Account successfully deleted"}, status=status.HTTP_200_OK)
    response.delete_cookie('sessionid')
    response.delete_cookie('csrftoken')
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def user_by_username_api(request, username):
    """Verilen username'e göre kullanıcının temel bilgilerini döner"""
    try:
        user = CustomUser.objects.get(username=username)
        d_name = getattr(user, 'display_name', None) or user.username
        
        return Response({
            "id": user.id,
            "username": user.username,
            "display_name": d_name,
            "email": user.email,
            "avatar": user.avatar.url if user.avatar else None,
            "online_status": user.status
        }, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return Response({"success": False, "error": "User not found"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_friend_status_api(request, username):
    """Verilen username ile olan friend status'unu döner (friends/pending/none)"""
    try:
        target_user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({"status": "none"}, status=status.HTTP_200_OK)

    if target_user == request.user:
        return Response({"status": "self"}, status=status.HTTP_200_OK)

    # Check if already friends
    is_friends = Relationship.objects.filter(
        Q(status='friends') & (Q(from_user=request.user, to_user=target_user) | Q(from_user=target_user, to_user=request.user))
    ).exists()
    
    if is_friends:
        return Response({"status": "friends"}, status=status.HTTP_200_OK)

    # Check if pending request (sent by me)
    is_pending_sent = Relationship.objects.filter(
        from_user=request.user,
        to_user=target_user,
        status='pending'
    ).exists()
    
    if is_pending_sent:
        return Response({"status": "pending"}, status=status.HTTP_200_OK)

    return Response({"status": "none"}, status=status.HTTP_200_OK)


