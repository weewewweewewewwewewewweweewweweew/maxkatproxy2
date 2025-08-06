// Финальный, самый надежный код для /api/proxy.js

export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY, Authorization',
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response('Параметр "url" не найден.', {
        status: 400,
        headers: CORS_HEADERS,
      });
    }
    
    // ВАЖНОЕ ИЗМЕНЕНИЕ: Создаем новый, чистый объект заголовков
    const headers = new Headers();

    // Копируем только те заголовки, которые нам важны
    if (request.headers.has('x-api-key')) {
      headers.set('x-api-key', request.headers.get('x-api-key'));
    }
    if (request.headers.has('authorization')) {
      headers.set('authorization', request.headers.get('authorization'));
    }
    
    // Делаем запрос к целевому API с нашими "чистыми" заголовками
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: headers, // Используем новый объект
      body: request.body,
      redirect: 'follow',
    });

    const response = new Response(apiResponse.body, apiResponse);

    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value);
    }

    return response;

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response('Ошибка на стороне прокси-сервера.', {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
