import { generateRegistrationOptions } from '@simplewebauthn/server';

let tempChallenge = ''; // para pruebas locales

export default function handler(req, res) {
  const options = generateRegistrationOptions({
    rpName: 'Demo WebAuthn',
    rpID: 'localhost',
    userID: 'user-123',
    userName: 'demo@example.com',
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'required',
    },
  });

  tempChallenge = options.challenge;

  res.status(200).json(options);
}

export { tempChallenge };