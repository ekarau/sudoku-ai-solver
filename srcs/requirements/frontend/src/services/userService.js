import { API_BASE_URL, getCookie } from './api';

export const getUserDetails = async () => {
	const response = await fetch(`${API_BASE_URL}/api/v1/user/me/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch user details');
	}
	return await response.json();
};

export const getUserById = async (userId) => {
	const response = await fetch(`${API_BASE_URL}/api/v1/user/info/${userId}/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch user by id');
	}
	return await response.json();
};

export const updateUserProfile = async (formData) => {
	const url = `${API_BASE_URL}/api/v1/user/profile/edit/`;

	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: formData
	});

	if (!response.ok) {
		if (response.status === 413) {
			throw new Error('File is too large. Maximum size allowed is 10MB.');
		}
		const errorText = await response.text();
		try {
			const jsonError = JSON.parse(errorText);
			throw new Error(jsonError.detail || jsonError.error || 'Update failed');
		}
		catch (e) {
			throw new Error(`Server Error: ${response.status}`);
		}
	}

	return await response.json();
};