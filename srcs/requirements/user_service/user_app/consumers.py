import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.room_group_name = "online_users"

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()

            # 1. ADIM: Bağlandığı an cache'i "online" olarak işaretle
            await self.set_user_cache_status(True)
            
            # Veritabanını güncelle
            await self.update_user_status(True)

            online_user_ids = await self.get_online_users()
            
            # Kendisi listede yoksa ekle (Görsel tutarlılık için)
            if self.user.id not in online_user_ids:
                online_user_ids.append(self.user.id)

            await self.send(text_data=json.dumps({
                "type": "initial_status",
                "online_users": online_user_ids
            }))

            # Herkese "Ben geldim" de
            await self.broadcast_status("online")
            print(f"✅ WS Connected: {self.user.username}")
        else:
            print("❌ WS Auth Failed")
            await self.close(code=4003)

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            user_id = self.user.id
            
            # 2. ADIM: Cache'e "ben çıkıyorum ama beklemede kal" notu bırak
            await self.set_user_cache_status(False)

            # 3. ADIM: GRACE PERIOD (3 Saniye Yeterli)
            await asyncio.sleep(3)

            # 4. ADIM: Kontrol et, kullanıcı geri geldi mi?
            is_still_online = await self.check_user_cache_status()
            
            if is_still_online:
                print(f"♻️ {self.user.username} reconnected immediately. Skipping offline status.")
                return

            # Geri gelmediyse offline yap
            await self.update_user_status(False)
            await self.broadcast_status("offline")
            
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'heartbeat':
                await self.update_user_status(True)
                await self.set_user_cache_status(True)
        except:
            pass

    async def broadcast_status(self, status):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_update",
                "user_id": self.user.id,
                "status": status
            }
        )

    async def user_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_update',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    # --- YARDIMCI FONKSİYONLAR ---

    @database_sync_to_async
    def update_user_status(self, is_online):
        User = get_user_model()
        User.objects.filter(pk=self.user.pk).update(
            is_online=is_online, 
            last_seen=timezone.now()
        )

    @database_sync_to_async
    def get_online_users(self):
        User = get_user_model()
        return list(User.objects.filter(is_online=True).values_list('id', flat=True))

    @database_sync_to_async
    def set_user_cache_status(self, is_online):
        key = f"ws_presence_{self.user.id}"
        if is_online:
            cache.set(key, "online", 30)
        else:
            cache.delete(key)

    @database_sync_to_async
    def check_user_cache_status(self):
        key = f"ws_presence_{self.user.id}"
        status = cache.get(key)
        return status == "online"