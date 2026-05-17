import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { registeredCredential } from './register';

export default function handler(req, res) {
  if (!registeredCredential) {
    return res.status(400).json({ error: 'No hay credencial registrada' });
  }

  const options = generateAuthenticationOptions({
    allowCredentials: [
      {
        id: registeredCredential.credentialID,
        type: 'public-key',
      },
    ],
    userVerification: 'required',
    rpID: 'localhost',
  });

  res.status(200).json(options);
}