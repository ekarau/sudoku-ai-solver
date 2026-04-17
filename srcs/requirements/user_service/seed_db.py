import os
import sys
import django
import shutil
import random
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from django.contrib.auth.hashers import make_password

# 1. Mevcut dizini ( /app ) yola ekle
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# 2. settings.py dosyasını dinamik olarak bul
def find_settings_module():
    for path in BASE_DIR.rglob("settings.py"):
        parts = path.relative_to(BASE_DIR).with_suffix("").parts
        return ".".join(parts)
    return None

settings_module = find_settings_module()
if settings_module:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
    print(f"--- Ayar Modülü Tespit Edildi: {settings_module} ---")
else:
    print("HATA: settings.py dosyası bulunamadı!")
    sys.exit(1)

try:
    django.setup()
except Exception as e:
    print(f"HATA: Django başlatılamadı: {e}")
    sys.exit(1)

from user_app.models import CustomUser, Relationship
from django.db.models import Q

STATS_SERVICE_URL = "http://stats_service:8090/api/stats/report"
session = requests.Session()

def record_stats(payload):
    """Helper to record game results in stats_service"""
    try:
        res = session.post(STATS_SERVICE_URL, json=payload, timeout=5)
        if res.status_code != 200:
             print(f"  [Stats Error] {res.status_code}: {res.text}")
    except Exception as e:
        print(f"  [Stats Exception] {e}")

def seed_data():
    DOWNLOADS_PATH = Path("/mnt/downloads")
    MEDIA_AVATARS_PATH = Path("/app/media/avatars")
    MEDIA_AVATARS_PATH.mkdir(parents=True, exist_ok=True)

    print("--- Admin hariç kullanıcılar/ilişkiler temizleniyor ---")
    Relationship.objects.all().delete()
    CustomUser.objects.filter(is_superuser=False).delete()
    
    users = []
    user_ids = {}
    turkish_names = ["Caner", "Melis", "Mert", "Selin", "Batuhan", "Emre", "Ayşe", "Mehmet", "Fatma", "Ali"]
    TOTAL_USERS = 167
    print(f"--- {TOTAL_USERS} Yeni Kullanıcı Hazırlanıyor ---")
    
    users_to_create = []
    default_password = make_password("1")
    
    for i in range(1, TOTAL_USERS + 1):
        u_name = f"user{i}"
        d_name = turkish_names[(i-1) % len(turkish_names)]
        if i > 5:
             d_name = f"{d_name}_{i}"
        
        db_avatar_path = None
        if i <= 5:
            src_file_name = f"download ({i}).jpeg"
            src_path = DOWNLOADS_PATH / src_file_name
            target_file_name = f"avatar_{u_name}.jpeg"
            target_path = MEDIA_AVATARS_PATH / target_file_name

            if src_path.exists():
                shutil.copy(str(src_path), str(target_path))
                db_avatar_path = f"avatars/{target_file_name}" 
        
        user_obj = CustomUser(
            username=u_name,
            password=default_password,
            email=f"{u_name}@example.com",
            display_name=d_name,
            avatar=db_avatar_path, 
            is_active=True
        )
        users_to_create.append(user_obj)

    print(f"--- {TOTAL_USERS} Kullanıcı Veritabanına Yazılıyor (Bulk) ---")
    CustomUser.objects.bulk_create(users_to_create, ignore_conflicts=True)
    users = list(CustomUser.objects.filter(username__startswith="user").order_by('id'))
    user_ids = {u.username: u.id for u in users}

    # 1. Add Friendships
    print("\n--- Arkadaşlık İlişkileri Hazırlanıyor (Rastgele) ---")
    rels_to_create = []
    for i, u1 in enumerate(users):
        friend_count = random.randint(2, 5)
        possible_friends = [u for j, u in enumerate(users) if i != j]
        friends = random.sample(possible_friends, friend_count)
        
        for u2 in friends:
            first, second = (u1, u2) if u1.id < u2.id else (u2, u1)
            rels_to_create.append(Relationship(from_user=first, to_user=second, status='friends'))
        
    print(f"--- {len(rels_to_create)} İlişki Yazılıyor (Bulk) ---")
    Relationship.objects.bulk_create(rels_to_create, ignore_conflicts=True)

    # 2. Add Match History (Stats)
    print("\n--- Oyun Geçmişi Görevleri Hazırlanıyor ---")
    stat_payloads = []
    for i, u in enumerate(users):
        # Solo Games
        win_count = random.randint(1, 3)
        for _ in range(win_count):
            stat_payloads.append({
                "user_id": u.id, "username": u.username, "difficulty": random.randint(1, 5),
                "mode": "offline", "result": "win", "time_seconds": random.randint(90, 600)
            })
        stat_payloads.append({
             "user_id": u.id, "username": u.username, "difficulty": random.randint(1, 5),
             "mode": "offline", "result": "lose"
        })
        
        # Online Games
        opponent = users[(i + 1) % len(users)] # Modulo pattern for speed
        diff = random.randint(1, 5)
        
        stat_payloads.append({
            "user_id": u.id, "username": u.username, "difficulty": diff, "mode": "online",
            "result": "win", "time_seconds": random.randint(90, 600), "opponent": opponent.username
        })
        stat_payloads.append({
            "user_id": opponent.id, "username": opponent.username, "difficulty": diff, "mode": "online",
            "result": "lose", "opponent": u.username
        })

    print(f"--- {len(stat_payloads)} İstatistik Raporu Gönderiliyor (Parallel - 20 Threads) ---")
    with ThreadPoolExecutor(max_workers=20) as executor:
        list(executor.map(record_stats, stat_payloads))

if __name__ == "__main__":
    seed_data()
    print("\nBaşarıyla tamamlandı!")