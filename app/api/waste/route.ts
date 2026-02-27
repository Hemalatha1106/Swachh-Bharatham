import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, waste_category_id, weight_kg, image_url, notes } = body;

    if (!user_id || !waste_category_id || !weight_kg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert waste log
    const { data: wasteLog, error: logError } = await supabaseAdmin
      .from('waste_logs')
      .insert([
        {
          user_id,
          waste_category_id,
          weight_kg: parseFloat(weight_kg),
          image_url,
          notes,
          status: 'verified',
        },
      ])
      .select()
      .single();

    if (logError) throw logError;

    // Update user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('total_waste_kg, total_points')
      .eq('id', user_id)
      .single();

    if (profile) {
      const newWasteKg = profile.total_waste_kg + weight_kg;
      const xpGained = Math.round(weight_kg * 10);
      const newPoints = profile.total_points + xpGained;

      await supabaseAdmin
        .from('user_profiles')
        .update({
          total_waste_kg: newWasteKg,
          total_points: newPoints,
        })
        .eq('id', user_id);

      // Log XP
      await supabaseAdmin.from('xp_logs').insert([
        {
          user_id,
          waste_log_id: wasteLog.id,
          xp_earned: xpGained,
          reason: 'Waste disposal',
        },
      ]);

      // Check and award badges
      await checkAndAwardBadges(user_id, newWasteKg, newPoints);
    }

    return NextResponse.json(wasteLog, { status: 201 });
  } catch (error) {
    console.error('[v0] Error in waste API:', error);
    return NextResponse.json(
      { error: 'Failed to log waste' },
      { status: 500 }
    );
  }
}

async function checkAndAwardBadges(userId: string, totalWasteKg: number, totalPoints: number) {
  try {
    // Get all badges
    const { data: badges } = await supabaseAdmin
      .from('badges')
      .select('*');

    if (!badges) return;

    // Get earned badges
    const { data: earnedBadges } = await supabaseAdmin
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

    // Check each badge criteria
    for (const badge of badges) {
      if (earnedIds.has(badge.id)) continue;

      let shouldEarn = false;

      if (badge.criteria_kg && totalWasteKg >= badge.criteria_kg) {
        shouldEarn = true;
      } else if (badge.criteria_count && totalWasteKg > 0) {
        // For badges without specific kg criteria
        shouldEarn = true;
      }

      if (shouldEarn) {
        await supabaseAdmin
          .from('user_badges')
          .insert([{ user_id: userId, badge_id: badge.id }])
          .select();
      }
    }
  } catch (error) {
    console.error('[v0] Error checking badges:', error);
  }
}
