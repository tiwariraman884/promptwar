import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

// Mock gamification dependencies
vi.mock('@/lib/gamification', () => ({
  ECO_COIN_REWARDS: { dailyEntry: 10, badgeUnlocked: 25 },
  evaluateBadgeAwards: vi.fn().mockReturnValue([]),
}));

vi.mock('@/lib/emission-factors', () => ({
  INDIA_DAILY_AVERAGE_KG: 5.2,
}));

import { awardCoins, updateStreak } from '@/lib/gamification-server';

describe('awardCoins', () => {
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect, upsert: mockUpsert }));

  const mockSupabase = { from: mockFrom } as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: { total_coins: 100 } });
  });

  it('adds coins to existing total', async () => {
    const total = await awardCoins(mockSupabase, 'user-1', 10);
    expect(total).toBe(110);
    expect(mockUpsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      total_coins: 110,
    });
  });

  it('starts from 0 if no existing coins', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    const total = await awardCoins(mockSupabase, 'user-1', 25);
    expect(total).toBe(25);
  });
});

describe('updateStreak', () => {
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect, upsert: mockUpsert }));

  const mockSupabase = { from: mockFrom } as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts streak at 1 for first entry', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    const result = await updateStreak(mockSupabase, 'user-1', '2024-06-15');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it('increments streak for consecutive days', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { current_streak: 5, longest_streak: 10, last_entry_date: '2024-06-14' },
    });
    const result = await updateStreak(mockSupabase, 'user-1', '2024-06-15');
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(10);
  });

  it('keeps same streak for same day', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { current_streak: 5, longest_streak: 5, last_entry_date: '2024-06-15' },
    });
    const result = await updateStreak(mockSupabase, 'user-1', '2024-06-15');
    expect(result.currentStreak).toBe(5);
  });

  it('resets streak after gap', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { current_streak: 5, longest_streak: 10, last_entry_date: '2024-06-10' },
    });
    const result = await updateStreak(mockSupabase, 'user-1', '2024-06-15');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10);
  });

  it('updates longest streak when current exceeds it', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { current_streak: 9, longest_streak: 9, last_entry_date: '2024-06-14' },
    });
    const result = await updateStreak(mockSupabase, 'user-1', '2024-06-15');
    expect(result.currentStreak).toBe(10);
    expect(result.longestStreak).toBe(10);
  });
});
