"use client"
import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Convertir ArrayBuffer a Base64
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Transformar attResp antes de enviar al servidor
function transformAttResp(attResp) {
  return {
    ...attResp,
    rawId: bufferToBase64(attResp.rawId),
    response: {
      attestationObject: bufferToBase64(attResp.response.attestationObject),
      clientDataJSON: bufferToBase64(attResp.response.clientDataJSON),
    },
  };
}

// Transformar authResp
function transformAuthResp(authResp) {
  return {
    ...authResp,
    rawId: bufferToBase64(authResp.rawId),
    response: {
      authenticatorData: bufferToBase64(authResp.response.authenticatorData),
      clientDataJSON: bufferToBase64(authResp.response.clientDataJSON),
      signature: bufferToBase64(authResp.response.signature),
      userHandle: authResp.response.userHandle
        ? bufferToBase64(authResp.response.userHandle)
        : null,
    },
  };
}

export default function Home() {
  const [status, setStatus] = useState('');

  const handleRegister = async () => {
    try {
      const optionsResp = await fetch('/api/register-options');
      const options = await optionsResp.json();

      const attResp = await startRegistration(options);
      const attRespTransformed = transformAttResp(attResp);

      const resultResp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attRespTransformed),
      });

      const result = await resultResp.json();
      setStatus(result.ok ? 'Registrado ✅' : 'Error registro ❌');
    } catch (err : any) {
      console.error(err);
      setStatus('Error: ' + err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const optionsResp = await fetch('/api/login-options');
      const options = await optionsResp.json();

      const authResp = await startAuthentication(options);
      const authRespTransformed = transformAuthResp(authResp);

      const resultResp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authRespTransformed),
      });

      const result = await resultResp.json();
      setStatus(result.ok ? 'Login ✅' : 'Error login ❌');
    } catch (err : any) {
      console.error(err);
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Demo WebAuthn con Huella</h1>
      <button onClick={handleRegister} style={{ marginRight: '1rem' }}>
        Registrar huella
      </button>
      <button onClick={handleLogin}>Login con huella</button>
      <p>{status}</p>
    </div>
  );
}