// API endpoint for GET collections containing a prompt
import { NextRequest, NextResponse } from 'next/server';
import Collection from '@/lib/models/collection';
import CollectionPrompts from '@/lib/models/collectionPrompts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const promptId = searchParams.get('promptId');
  if (!promptId) return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
  const collectionIds = await CollectionPrompts.getCollections(promptId);
  const collections = await Promise.all(collectionIds.map(id => Collection.findById(id)));
  return NextResponse.json(collections.filter(Boolean));
}
