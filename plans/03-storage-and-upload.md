# 03 — Storage & Upload

## Goal
Users upload raw footage that might be 50+ GB without choking our infra.
The browser streams directly to R2 via multipart signed URLs. Our server
never proxies bytes.

## Key facts

- **Provider:** Cloudflare R2
- **Bucket:** `editron-media`
- **Jurisdiction:** WEUR (European Union)
- **Endpoint:** `https://897a68f060784ae59fc48d973c7d2a40.r2.cloudflarestorage.com`
- **Auth:** S3-compatible — `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` in secrets
- **Egress:** free (the R2 selling point)

## Object key schema

```
users/{userId}/projects/{projectId}/
├── source/{uploadId}/original.mp4      — raw upload, never modified
├── reference/{uploadId}/original.mp4   — reference video for style
├── brief/{uploadId}/memo.ogg           — voice memo brief
├── transcripts/{uploadId}.json         — Scribe output, cached
├── proxies/{uploadId}/720p.m3u8        — HLS playlist
├── proxies/{uploadId}/720p_00001.ts    — segments
├── renders/{edlId}/final.mp4
└── renders/{edlId}/preview.mp4
```

---

## Tasks

### 1 — S3 client
- [ ] `packages/shared/src/r2.ts` exports a typed `@aws-sdk/client-s3` client configured against the R2 endpoint + region `auto`
- [ ] Helper: `getObjectKey(userId, projectId, kind, uploadId, filename)`

### 2 — Multipart upload endpoints
- [ ] `POST /api/uploads/initiate` — takes `{ projectId, kind, filename, contentType, sizeBytes }`, creates an `uploads` row with status `pending`, calls `CreateMultipartUploadCommand`, returns `{ uploadId, multipartUploadId, partSize, partCount }`. Chunks of 10 MB.
- [ ] `POST /api/uploads/:id/part-url` — takes `{ partNumber }`, returns a presigned `UploadPartCommand` URL valid for 1 h. Browser does the PUT directly.
- [ ] `POST /api/uploads/:id/complete` — takes `{ parts: [{ partNumber, etag }] }`, calls `CompleteMultipartUploadCommand`, updates status to `uploaded`. Kicks the `audio-extract` BullMQ job.
- [ ] `POST /api/uploads/:id/abort` — cleans up a half-done multipart session.

### 3 — Audio-extract worker (the key trick)

The worker **never downloads the full source**. It uses the S3 client
with HTTP Range requests and pipes the byte stream into ffmpeg on
stdin:

```typescript
const body = await s3.send(new GetObjectCommand({
  Bucket: R2_BUCKET,
  Key: sourceKey
})); // returns a streaming body
body.Body!.pipe(ffmpegStdin);
// ffmpeg: -i pipe:0 -vn -ac 1 -ar 16000 -c:a pcm_s16le audio.wav
```

For very large files where the S3 SDK's streaming is unreliable, fall
back to chunked Range requests — but the pipe approach works for
anything up to ~10 GB in practice.

- [ ] Worker definition in `apps/api/src/workers/audio-extract.ts`
- [ ] BullMQ queue name `audio-extract`
- [ ] Output: Scribe WAV written to a temp dir, transcribed, uploaded to `transcripts/{uploadId}.json`, `transcripts` row written, source file NOT deleted
- [ ] Emit progress via a Redis pub/sub channel `upload:{id}:progress` so the frontend can live-update

### 4 — CORS on the bucket
- [ ] R2 CORS rule allowing PUT from `*.azin.host`, `calm-wolf.boxd.sh`, and `editron.video` (later). Origins-wildcarded during dev.

### 5 — Lifecycle rules
- [ ] Drafts older than 30 days → delete (users/anon leftovers)
- [ ] Proxies older than 90 days → delete (can be regenerated from source)
- [ ] Source never expires

### 6 — Tests
- [ ] Fixture video (1s colorbars + sine tone, generated via ffmpeg in a test helper) roundtrips: initiate → part-url → PUT → complete → audio extract → transcript row. All via real R2 using a test prefix.

---

## Notes

- **No browser-side compression.** Source stays lossless. Any re-encoding
  loses quality for no gain (R2 is cheap enough).
- **5 MB minimum part size** is the S3 spec; we use 10 MB.
- **Resumable uploads** — the upload state is saved after each
  successful part. Browser refresh resumes from the last uploaded part.
- **Signed URL lifetime** — 1 h is enough for a 10 MB chunk on even the
  slowest connection. Refresh if needed via `/part-url` again.
