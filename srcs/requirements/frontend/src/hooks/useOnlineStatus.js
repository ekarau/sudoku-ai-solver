import { useState, useEffect, useRef } from 'react';

function checkAuthCookie() {
	return document.cookie.includes('csrftoken') ||
		document.cookie.includes('access_token') ||
		document.cookie.includes('sessionid');
}

const useOnlineStatus = (user) => {
	const [onlineUsers, setOnlineUsers] = useState(new Set());
	const socketRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);

	useEffect(() => {
		let isUnmounted = false;

		if (!user || !checkAuthCookie())
			return;

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}/ws/presence/`;

		const connect = () => {
			if (!checkAuthCookie() || isUnmounted)
				return;

			console.log("wsUrl: ", wsUrl);
			const ws = new WebSocket(wsUrl);
			socketRef.current = ws;

			ws.onopen = () => console.log('✅ WS Online Status Connected');

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);

					if (data.type === 'initial_status' && Array.isArray(data.online_users)) {
						const ids = data.online_users.map(id => Number(id));
						setOnlineUsers(new Set(ids));
					}
					else if (data.user_id && data.status) {
						setOnlineUsers(prev => {
							const newSet = new Set(prev);
							const userId = Number(data.user_id);

							if (data.status === 'online')
								newSet.add(userId);
							else
								newSet.delete(userId);

							return newSet;
						});
					}
				}
				catch (e) {
					console.error("WS Parse Error:", e);
				}
			};

			ws.onclose = (e) => {
				if (isUnmounted)
					return;

				if (e.code === 4003)
					return;

				if (checkAuthCookie())
					reconnectTimeoutRef.current = setTimeout(connect, 3000);
			};
		};

		connect();

		const heartbeat = setInterval(() => {
			if (socketRef.current?.readyState === WebSocket.OPEN)
				socketRef.current.send(JSON.stringify({ type: 'heartbeat' }));
		}, 30000);

		return () => {
			isUnmounted = true;

			clearInterval(heartbeat);

			if (reconnectTimeoutRef.current)
				clearTimeout(reconnectTimeoutRef.current);

			if (socketRef.current) {
				const ws = socketRef.current;
				ws.onclose = null;

				if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
					ws.close();
			}
		};
	}, [user]);

	return onlineUsers;
};

export default useOnlineStatus;