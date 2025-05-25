import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Idea {
  id: string;
  title: string;
  created_at: string;
  total_sats_received: number;
  exclude_from_display: boolean;
  // Add other fields as needed
}

export async function GET() {
  try {
    const [
      newestRes,
      mostVotedRes,
      oldestRes,
      randomRes,
      randomVotedRes
    ] = await Promise.all([
      supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('ideas')
        .select('*')
        .order('total_sats_received', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(2),
      supabase
        .rpc('get_random_ideas', { count: 3 }),
      supabase
        .rpc('get_random_voted_ideas', { count: 5 })
    ]);

    const errors = {
      newest: newestRes.error,
      mostVoted: mostVotedRes.error,
      oldest: oldestRes.error,
      random: randomRes.error,
      randomVoted: randomVotedRes.error
    };
    // Log errors but do not fail the whole API if one group fails
    Object.entries(errors).forEach(([key, err]) => {
      if (err) console.error(`Supabase error in ${key}:`, err);
    });

    // Deduplicate and order: mostVoted, newest, oldest, randomVoted, random
    const seen = new Set<string>();
    const combinedUniqueIdeas: Idea[] = [];
    [
      mostVotedRes.data || [],
      newestRes.data || [],
      oldestRes.data || [],
      randomVotedRes.data || [],
      randomRes.data || []
    ].forEach(group => {
      group.forEach((idea: Idea) => {
        if (!seen.has(idea.id)) {
          seen.add(idea.id);
          combinedUniqueIdeas.push(idea);
        }
      });
    });
    return NextResponse.json({
      newest: newestRes.data || [],
      mostVoted: mostVotedRes.data || [],
      oldest: oldestRes.data || [],
      random: randomRes.data || [],
      randomVoted: randomVotedRes.data || [],
      combinedUniqueIdeas
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
} 