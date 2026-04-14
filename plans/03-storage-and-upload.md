# 03 — File Storage & Video Upload

## Goal
Reliable video upload pipeline with progress tracking, chunked uploads for large files, and cloud storage.

---

## Tasks

### 3.1 Cloud Storage
- [ ] Set up Cloudflare R2 (or AWS S3) bucket
- [ ] Configure CORS for direct browser uploads
- [ ] Presigned URL generation endpoint
- [ ] Storage lifecycle rules (auto-delete temp files)

### 3.2 Upload Pipeline
- [ ] Chunked/resumable upload (tus protocol or custom)
- [ ] Upload progress UI with percentage bar
- [ ] File type validation (video formats: mp4, mov, avi, webm, mkv)
- [ ] File size limits per plan (free: 500MB, pro: 5GB, business: 25GB)
- [ ] Drag-and-drop upload zone UI
- [ ] Multiple file upload support

### 3.3 Video Transcoding
- [ ] Webhook on upload complete → trigger transcoding job
- [ ] FFmpeg transcoding to web-friendly format (H.264/mp4)
- [ ] Generate multiple resolutions (360p, 720p, 1080p)
- [ ] Generate video thumbnail at 3 key frames
- [ ] Store transcoded versions alongside original
- [ ] Update media record with transcoded URLs

### 3.4 Media Library UI
- [ ] Grid/list view of uploaded media per project
- [ ] Thumbnail previews
- [ ] File metadata display (duration, resolution, size)
- [ ] Delete / rename / organize into folders

---

## Keys Needed
- Cloudflare R2 access key + secret + bucket name
- (or AWS S3 credentials)

## Depends On
- 01-infrastructure
- 02-auth-and-database

## Estimated Effort
~4-5 days
