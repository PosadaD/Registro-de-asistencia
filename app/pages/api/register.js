import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { tempChallenge } from './register-options';

let registeredCredential = null;

function base64ToArrayBuffer(base64) {
  return Uint8Array.from(Buffer.from(base64, 'base64')).buffer;
}

export default async function handler(req, res) {
  try {
    const body = req.body;

    // Convertir Base64 a ArrayBuffer
    const attestationResponse = {
      ...body,
      rawId: base64ToArrayBuffer(body.rawId),
      response: {
        attestationObject: base64ToArrayBuffer(body.response.attestationObject),
        clientDataJSON: base64ToArrayBuffer(body.response.clientDataJSON),
      },
    };

    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: tempChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (verification.verified) {
      registeredCredential = verification.registrationInfo;
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ ok: false });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

export { registeredCredential };