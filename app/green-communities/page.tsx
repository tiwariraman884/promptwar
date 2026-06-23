"use client";

import { useState, useEffect } from "react";
import { Trophy, Users, MessageSquare, Target } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChallengeCard } from "@/components/green-communities/ChallengeCard";
import { GroupCard } from "@/components/green-communities/GroupCard";
import { LeaderboardTable } from "@/components/green-communities/LeaderboardTable";
import { DiscussionThread } from "@/components/green-communities/DiscussionThread";
import { NewDiscussionModal } from "@/components/green-communities/NewDiscussionModal";
import { GROUP_CHALLENGES } from "@/lib/carbonData";
import { demoLeaderboard } from "@/lib/demo-data";

type CityLeader = (typeof demoLeaderboard.city)[number];
type StateLeader = (typeof demoLeaderboard.state)[number];

export default function GreenCommunitiesPage() {
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>({});
  const [cityLeaders, setCityLeaders] = useState<CityLeader[]>(demoLeaderboard.city);
  const [stateLeaders, setStateLeaders] = useState<StateLeader[]>(demoLeaderboard.state);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  /* Load persisted joined challenges */
  useEffect(() => {
    const stored = localStorage.getItem("joined_challenges");
    if (stored) {
      try { setJoinedChallenges(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  /* Fetch live leaderboard data */
  useEffect(() => {
    fetch("/api/leaderboard?scope=city")
      .then((r) => r.json())
      .then((p) => p.data && setCityLeaders(p.data))
      .catch(() => setCityLeaders(demoLeaderboard.city));

    fetch("/api/leaderboard?scope=state")
      .then((r) => r.json())
      .then((p) => p.data && setStateLeaders(p.data))
      .catch(() => setStateLeaders(demoLeaderboard.state));
  }, []);

  const handleJoin = (id: string) => {
    const updated = { ...joinedChallenges, [id]: true };
    setJoinedChallenges(updated);
    localStorage.setItem("joined_challenges", JSON.stringify(updated));
  };

  const PROGRESS_VALUES = [45, 62, 30, 78];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-20 md:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Users size={24} />
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Community Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black">Green Communities</h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/70">
            Join challenges, connect with eco groups, climb leaderboards, and share ideas with fellow climate champions.
          </p>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4">
        <Tabs defaultValue="challenges">
          <div className="overflow-x-auto hide-scrollbar pb-1">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="challenges" className="gap-1.5">
                <Target size={16} /> Challenges
              </TabsTrigger>
              <TabsTrigger value="groups" className="gap-1.5">
                <Users size={16} /> Groups
              </TabsTrigger>
              <TabsTrigger value="leaderboards" className="gap-1.5">
                <Trophy size={16} /> Leaderboards
              </TabsTrigger>
              <TabsTrigger value="discussions" className="gap-1.5">
                <MessageSquare size={16} /> Discussions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Challenges */}
          <TabsContent value="challenges">
            <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-6 flex items-center gap-2">
              <Target size={18} /> Join community challenges to amplify your impact.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {GROUP_CHALLENGES.map((challenge, idx) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  progress={PROGRESS_VALUES[idx % PROGRESS_VALUES.length]}
                  isJoined={!!joinedChallenges[challenge.id]}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          </TabsContent>

          {/* Tab 2: Groups */}
          <TabsContent value="groups">
            <GroupCard />
          </TabsContent>

          {/* Tab 3: Leaderboards */}
          <TabsContent value="leaderboards">
            <LeaderboardTable cityLeaders={cityLeaders} stateLeaders={stateLeaders} />
          </TabsContent>

          {/* Tab 4: Discussions */}
          <TabsContent value="discussions">
            <DiscussionThread onNewThread={() => setShowNewDiscussion(true)} />
          </TabsContent>
        </Tabs>
      </div>

      {/* New Discussion Modal */}
      {showNewDiscussion && (
        <NewDiscussionModal onClose={() => setShowNewDiscussion(false)} />
      )}
    </div>
  );
}
