import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { UserProfile, UpdateProfileRequest, PhotoUploadResponse } from '../models/UserProfile';

export class ProfileService {
    /**
     * Получить профиль текущего пользователя
     */
    public static getProfile(): CancelablePromise<UserProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/profile',
        });
    }

    /**
     * Обновить профиль пользователя
     */
    public static updateProfile(
        requestBody: UpdateProfileRequest
    ): CancelablePromise<UserProfile> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/profile',
            body: requestBody,
        });
    }

    /**
     * Поиск пользователей по имени
     */
    public static searchUsers(
        query: string
    ): CancelablePromise<UserProfile[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/profile/search',
            query: {
                'q': query,
            },
        });
    }

    /**
     * Получить presigned URL для загрузки фото
     */
    public static getPhotoUploadUrl(): CancelablePromise<PhotoUploadResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/profile/photo/upload-url',
        });
    }
}