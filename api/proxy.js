// ФИНАЛЬНЫЙ ИСПРАВЛЕННЫЙ код для файла /api/proxy.js

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
    
    // Копируем заголовки из оригинального запроса
    const requestHeaders = new Headers(request.headers);
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Мы должны удалить 'host', чтобы fetch подставил правильный
    requestHeaders.delete('host'); 
    requestHeaders.delete('referer');
    
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders, // теперь здесь НЕТ неправильного хоста
      body: request.body,
      redirect: 'follow',
    });

    const response = new Response(apiResponse.body, apiResponse);

    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value);
    }

    return response;

  } catch (error) {
    return new Response('Ошибка на стороне прокси-сервера.', {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
