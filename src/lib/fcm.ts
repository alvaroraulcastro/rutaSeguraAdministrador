/** Envío FCM legacy (server key). Migrar a HTTP v1 con service account (plan B1). */
export async function enviarFcmLegacy(params: {
  serverKey: string;
  token: string;
  title: string;
  body: string;
}): Promise<boolean> {
  try {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${params.serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.token,
        notification: { title: params.title, body: params.body },
        priority: 'high',
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[fcm.send.error]', err);
    return false;
  }
}