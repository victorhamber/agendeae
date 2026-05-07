import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function getUploadsDir() {
  return process.env.UPLOADS_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'public', 'uploads');
}

function contentTypeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

export async function GET(_: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;

  // evita path traversal
  const safe = path.basename(file);
  const absPath = path.join(getUploadsDir(), safe);

  try {
    const bytes = await fs.readFile(absPath);
    return new NextResponse(bytes, {
      headers: {
        'content-type': contentTypeFor(safe),
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
  }
}

