import { useAuth } from "react-oidc-context";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { upVariants } from "../animations";
import './IndexPage.scss';
import { redirectUri} from "../main";


// Типы для API
interface UserProfile {
    sub: string;
    name: string;
    bio: string;
    photo_url: string;
    created_at: string;
    updated_at: string;
}

function IndexPage() {
    const auth = useAuth();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const API_BASE = 'backend-alb-635489014.sa-east-1.elb.amazonaws.com/api';

    // Загрузка профиля при монтировании компонента
    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.access_token) {
            loadProfile();
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    // - --- from amazon
    const signOut = async () => {
        const clientId = "1dthdfdnlojrvd2c56663dvo86";
        const cognitoDomain = "https://sa-east-1abyvmc2px.auth.sa-east-1.amazoncognito.com";
       // const redirectUri = redi  //"https://localhost:44407";
        const redirect_uri = redirectUri.split("/auth")[0];
        // 1. Сначала делаем logout в Cognito
        const logoutUrl = `${cognitoDomain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(redirect_uri)}`;
        try {
          await auth.removeUser();
        } catch (e) {
            console.warn("removeUser failed:", e);
        }
       // 3. Редиректим на logout, который потом вернет на главную
        window.location.href = logoutUrl;
    };

// Функция загрузки профиля
    const loadProfile = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${API_BASE}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.user?.access_token}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load profile');
            }

            const data: UserProfile = await response.json();
            setName(data.name);
            setBio(data.bio);
            setPhotoUrl(data.photo_url);
        } catch (err) {
            console.error('Error loading profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // Функция сохранения профиля
    const handleSaveNameBio = async () => {
        try {
            console.log('Saving:', name, bio);
            setLoading(true);
            setError('');
            setSuccessMessage('');

            const response = await fetch(`${API_BASE}/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.user?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, bio })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const data: UserProfile = await response.json();
            setName(data.name);
            setBio(data.bio);
            setSuccessMessage('✅ Профиль успешно сохранен!');

            // Убираем сообщение через 3 секунды
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };
/// Функция загрузки фото через presigned URL
    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение');
            return;
        }

        // Проверка размера (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5MB');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');

            // 1. Запрашиваем presigned URL у бэкенда
            const presignedResponse = await fetch(`${API_BASE}/profile/presigned-url`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.user?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file_name: file.name,
                    content_type: file.type
                })
            });

            if (!presignedResponse.ok) {
                const errorData = await presignedResponse.json();
                throw new Error(errorData.error || 'Failed to get presigned URL');
            }

            const { upload_url, photo_url } = await presignedResponse.json();

            // 2. Загружаем файл напрямую в S3 используя presigned URL
            const uploadResponse = await fetch(upload_url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload photo to S3');
            }

            // подтверждаем загрузки для сохр. в базе
            const saveResponse = await fetch(`${API_BASE}/profile/confirm-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.user?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    photo_url: photo_url
                })
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || 'Failed to save photo URL');
            }

            const data: UserProfile = await saveResponse.json();
            setPhotoUrl(data.photo_url);

            setPhotoUrl(photo_url);
            setSuccessMessage('✅ Фото успешно загружено!');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error uploading photo:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
        // Здесь будет логика поиска
    };


    return (
        <motion.div
            variants={upVariants}
            initial={'init'}
            animate={'show'}
            exit={'hide'}
            className={'index-page'}
        >
            {/* Header с поиском */}
            <header className="header">
                <div className="container">
                    <h1 className="logo">Tinderchik</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Поиск по имени1..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch}>🔍 Найти</button>
                    </div>
                </div>
            </header>

            <div className="container main-content">
                {/* Сообщения об ошибках и успехе */}
                {error && (
                    <div className="alert alert-error">
                        ❌ {error}
                    </div>
                )}
                {successMessage && (
                    <div className="alert alert-success">
                        {successMessage}
                    </div>
                )}

                {/* Профиль пользователя */}
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="avatar-container">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Profile"
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    <svg width="200" height="200" viewBox="0 0 200 200">
                                        <rect width="200" height="200" fill="#e0e0e0"/>
                                        <circle cx="100" cy="80" r="40" fill="#bdbdbd"/>
                                        <ellipse cx="100" cy="160" rx="60" ry="50" fill="#bdbdbd"/>
                                    </svg>
                                </div>
                            )}

                            {/* Кнопка загрузки фото */}
                            <div className="upload-wrapper">
                                <input
                                    id="photoInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    disabled={loading}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    className="btn-primary"
                                    onClick={() => document.getElementById('photoInput')?.click()}
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Загрузка...' : '📷 Загрузить фото'}
                                </button>
                            </div>
                        </div>

                        <div className="profile-info">
                            <input
                                type="text"
                                className="name-input"
                                placeholder="Ваше имя"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                            <p className="email">{auth.user?.profile?.email}</p>
                        </div>
                    </div>

                    <div className="bio-section">
                        <h3>О себе</h3>
                        <textarea
                            placeholder="Расскажите о себе..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            disabled={loading}
                        />
                        <button
                            className="btn-primary"
                            onClick={handleSaveNameBio}
                            disabled={loading}
                        >
                            {loading ? '⏳ Сохранение...' : '💾 Сохранить профиль'}
                        </button>
                    </div>
                </div>

                {/* Debug информация */}
                <div className="debug-section">
                    <div className="debug-content">
                        <div className="button-group">
                            <button className="btn-logout" onClick={signOut}>
                                🚪 Signout
                            </button>

                        </div>
                    </div>
                </div>
            </div>

               <div style={{ fontSize: '10px', overflow: 'auto', padding: '10px' }}>
                        <pre>Access Token: {auth.user?.access_token}</pre>
               </div>

        </motion.div>
    );
}

export default IndexPage;