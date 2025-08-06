// Финальный код для /api/proxy.js на Vercel

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Обработка preflight-запроса OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY, Authorization',
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    const errorResponse = new Response('Параметр "url" не найден.', { status: 400 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }

  try {
    // Создаем НОВЫЙ объект запроса, чтобы избежать проблем с заголовками
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: { // Передаем только нужные заголовки
        'User-Agent': request.headers.get('user-agent'),
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': request.headers.get('accept-language'),
        'X-API-KEY': request.headers.get('x-api-key') || undefined, // Для Кинопоиска
        'Authorization': request.headers.get('authorization') || undefined
      },
      body: request.body,
      redirect: 'follow',
    });

    // Делаем запрос к целевому API
    const apiResponse = await fetch(proxyRequest);

    // Создаем новый ответ на основе ответа от API
    const response = new Response(apiResponse.body, apiResponse);
    
    // ВАЖНЫЙ ШАГ: просто добавляем заголовок, разрешающий CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    // Удаляем заголовки, которые могут блокировать ответ
    response.headers.delete('X-Frame-Options');

    return response;

  } catch (error) {
    const errorResponse = new Response('Ошибка на стороне прокси-сервера.', { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}
