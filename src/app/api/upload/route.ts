import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getUploadsDir() {
  // Em produção no Easypanel, você pode montar um volume em /app/public/uploads
  return process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Formato não permitido' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
  }

  const ext =
    file.type === 'image/jpeg' ? 'jpg' :
    file.type === 'image/png' ? 'png' :
    file.type === 'image/webp' ? 'webp' :
    file.type === 'image/gif' ? 'gif' :
    'bin';

  const uploadsDir = getUploadsDir();
  await fs.mkdir(uploadsDir, { recursive: true });

  const id = crypto.randomUUID();
  const filename = `${id}.${ext}`;
  const absPath = path.join(uploadsDir, filename);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(absPath, Buffer.from(bytes));

  const urlPath = `/uploads/${filename}`;
  return NextResponse.json({ url: urlPath });
}
