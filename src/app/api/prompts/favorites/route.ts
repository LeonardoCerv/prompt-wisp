// API endpoint for GET user's favorite prompts
import { NextRequest, NextResponse } from 'next/server';
import UsersPrompts from '@/lib/models/usersPrompts';
import Prompt from '@/lib/models/prompt';
import { getUserFromRequest } from '@/lib/utils/getUserFromRequest';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ids = await UsersPrompts.getFavorites(user.id);
  const prompts = await Promise.all(ids.map(id => Prompt.findById(id)));
  return NextResponse.json(prompts.filter(Boolean));
}
