/**
 * The rotating boarding code, generated on the student's device (spec §7.2).
 *
 * The exact byte format is fixed by the backend (app/services/boarding.py) and
 * must be reproduced here to the character, or the helper's signature check
 * fails on every scan:
 *
 *     ticket_id . passenger_count . time_slice . nonce . base64url(signature)
 *
 * where the signature is Ed25519 over the first four dot-joined fields, and
 * time_slice = floor(unix_seconds / slice_seconds). The code re-signs every
 * slice (30 s), so a screenshot is worthless within half a minute.
 *
 * The private key comes from GET /shop/tickets/{id}/qr-material, so the code
 * can be produced with no signal — which is the whole point of offline
 * boarding. That the key lives on the device is an accepted trade-off, bounded
 * by the per-device nonce log and the cross-device fraud sweep (spec §7.5).
 */

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

import type { components } from "./api";

// @noble/ed25519 v2 leaves the hash pluggable; wire in sha512 for sync signing.
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

type QrMaterial = components["schemas"]["QrMaterialOut"];

function b64urlToBytes(value: string): Uint8Array {
  const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  // The backend decodes with urlsafe_b64decode, which accepts the "=" padding
  // btoa leaves on, so it is kept rather than stripped.
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_");
}

function randomNonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  // Opaque to the verifier; strip padding to mirror the server's token_urlsafe.
  return bytesToB64url(b).replace(/=+$/, "");
}

export interface BoardingSigner {
  ticketId: string;
  passengerCount: number;
  sliceSeconds: number;
  /** server_time − device_time at fetch, so a wrong phone clock cannot break
   * the time-slice the helper checks. */
  clockOffsetMs: number;
  privKey: Uint8Array;
  validTo: string;
}

export function makeSigner(material: QrMaterial): BoardingSigner {
  return {
    ticketId: material.ticket_id,
    passengerCount: material.passenger_count,
    sliceSeconds: material.slice_seconds,
    clockOffsetMs: Date.parse(material.server_time) - Date.now(),
    privKey: b64urlToBytes(material.qr_private_key),
    validTo: material.valid_to,
  };
}

/** The string to render as a QR right now. Call again each slice to rotate. */
export function boardingCode(signer: BoardingSigner): string {
  const nowUnix = (Date.now() + signer.clockOffsetMs) / 1000;
  const timeSlice = Math.floor(nowUnix / signer.sliceSeconds);
  const nonce = randomNonce();
  const signing = `${signer.ticketId}.${signer.passengerCount}.${timeSlice}.${nonce}`;
  const signature = ed.sign(new TextEncoder().encode(signing), signer.privKey);
  return `${signing}.${bytesToB64url(signature)}`;
}
