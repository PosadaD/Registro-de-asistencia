import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { registeredCredential } from './register';

function base64ToArrayBuffer(base64) {
  return Uint8Array.from(Buffer.from(base64, 'base64')).buffer;
}

export default async function handler(req, res) {
  try {
    if (!registeredCredential) {
      return res.status(400).json({ error: 'No hay credencial registrada' });
    }

    const body = req.body;

    const authResponse = {
      ...body,
      rawId: base64ToArrayBuffer(body.rawId),
      response: {
        authenticatorData: base64ToArrayBuffer(body.response.authenticatorData),
        clientDataJSON: base64ToArrayBuffer(body.response.clientDataJSON),
        signature: base64ToArrayBuffer(body.response.signature),
        userHandle: body.response.userHandle
          ? base64ToArrayBuffer(body.response.userHandle)
          : null,
      },
    };

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: body.response.clientDataJSON, // Para demo
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
      authenticator: registeredCredential,
    });

    res.status(200).json({ ok: verification.verified });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}