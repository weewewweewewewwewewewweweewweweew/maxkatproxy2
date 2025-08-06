// Код для файла /api/proxy.js

export const config = {
  runtime: 'edge', // Используем быстрый Edge Runtime от Vercel
};

export default async function handler(request) {
  // Обрабатываем preflight-запросы (метод OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No Content
      headers: {
        'Access-Control-Allow-Origin': '*', // Разрешаем доступ с любого домена
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY, Authorization', // Важно для Кинопоиска
      },
    });
  }

  // Получаем URL, к которому нужно сделать запрос, из параметра ?url=
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Параметр "url" не найден.', { status: 400 });
  }

  try {
    // Копируем заголовки из оригинального запроса
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('host');
    requestHeaders.delete('referer');
    
    // Делаем фактический запрос к целевому API
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      redirect: 'follow',
    });

    // Создаем новый ответ, чтобы добавить CORS-заголовки
    const response = new Response(apiResponse.body, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: apiResponse.headers,
    });

    // Добавляем нужные заголовки для CORS
    response.headers.set('Access-Control-Allow-Origin', '*');

    return response;

  } catch (error) {
    return new Response('Ошибка при обращении к прокси.', { status: 500 });
  }
}
