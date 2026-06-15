"use client";

import { Copy, Share2, Trophy, Users, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { MotionPage } from "@/components/motion-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { demoChallenge, demoLeaderboard } from "@/lib/demo-data";

type CityLeader = (typeof demoLeaderboard.city)[number];
type StateLeader = (typeof demoLeaderboard.state)[number];
type Challenge = typeof demoChallenge;

function LeaderRow({
  rank,
  primary,
  secondary,
  value
}: {
  rank: number;
  primary: string;
  secondary: string;
  value: string;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-card border border-line bg-white px-3 dark:border-white/10 dark:bg-white/5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-light font-heading font-extrabold text-primary-dark">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-ink dark:text-white">
          {primary}
        </p>
        <p className="truncate text-xs font-bold text-ink/70 dark:text-white/55">
          {secondary}
        </p>
      </div>
      <Badge tone="amber">{value}</Badge>
    </div>
  );
}

export default function CommunityPage() {
  const [cityLeaders, setCityLeaders] = useState<CityLeader[]>(demoLeaderboard.city);
  const [stateLeaders, setStateLeaders] = useState<StateLeader[]>(demoLeaderboard.state);
  const [challenge, setChallenge] = useState<Challenge>(demoChallenge);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth?ref=haridwar-greenstep`);

    fetch("/api/leaderboard?scope=city")
      .then((response) => response.json())
      .then((payload) => payload.data && setCityLeaders(payload.data))
      .catch(() => setCityLeaders(demoLeaderboard.city));

    fetch("/api/leaderboard?scope=state")
      .then((response) => response.json())
      .then((payload) => payload.data && setStateLeaders(payload.data))
      .catch(() => setStateLeaders(demoLeaderboard.state));

    fetch("/api/challenges")
      .then((response) => response.json())
      .then((payload) => payload.data?.[0] && setChallenge(payload.data[0]))
      .catch(() => setChallenge(demoChallenge));
  }, []);

  const joinChallenge = async () => {
    const response = await fetch("/api/challenges/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id })
    });
    const payload = await response.json();
    if (!payload.error) {
      setJoined(true);
      setMessage("Challenge joined. +50 eco-coins unlock when you complete it.");
    } else {
      setMessage(payload.error);
    }
  };

  const copyReferral = async () => {
    await navigator.clipboard.writeText(referralLink);
    setMessage("Invite link copied. You both get 50 eco-coins after their first entry.");
  };

  const shareResult = async () => {
    const text = "I reduced my carbon footprint by 18% this month! 🌿 #GreenIndia";
    if (navigator.share) {
      await navigator.share({ title: "GreenStep India", text, url: referralLink });
    } else {
      await navigator.clipboard.writeText(`${text} ${referralLink}`);
      setMessage("Share text copied.");
    }
  };

  return (
    <MotionPage>
      <section className="space-y-5">
        <div className="rounded-card bg-primary-dark p-5 text-white shadow-soft">
          <Badge className="bg-white/15 text-white" tone="dark">
            Haridwar community
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-extrabold">
            Community
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Friendly city progress, weekly challenges, and shareable wins.
          </p>
        </div>

        {message && (
          <p className="rounded-card bg-primary-light p-3 text-sm font-bold text-primary-dark">
            {message}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>City leaderboard</CardTitle>
              <CardDescription>Top 10 in your city this month.</CardDescription>
            </CardHeader>
            <div className="space-y-2">
              {cityLeaders.slice(0, 10).map((leader) => (
                <LeaderRow
                  key={leader.rank}
                  primary={leader.displayName}
                  rank={leader.rank}
                  secondary={leader.city}
                  value={`${leader.reductionPercent}%`}
                />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>State leaderboard</CardTitle>
              <CardDescription>Uttarakhand cities by average reduction.</CardDescription>
            </CardHeader>
            <div className="space-y-2">
              {stateLeaders.map((leader) => (
                <LeaderRow
                  key={leader.rank}
                  primary={leader.city}
                  rank={leader.rank}
                  secondary={leader.state}
                  value={`${leader.reductionPercent}%`}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="amber">Weekly challenge</Badge>
                <h2 className="mt-3 font-heading text-2xl font-extrabold text-primary-dark dark:text-white">
                  {challenge.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink/65 dark:text-white/65">
                  {challenge.description}
                </p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-light text-primary-dark">
                <Trophy aria-hidden size={24} />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Progress
                label="Challenge progress"
                max={challenge.targetKg}
                value={challenge.progressKg}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-ink/65 dark:text-white/65">
                <span>{challenge.progressKg} / {challenge.targetKg} kg progress</span>
                <span>{challenge.daysRemaining} days remaining</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-ink/65 dark:text-white/65">
                <Users aria-hidden size={18} />
                {challenge.participants.toLocaleString("en-IN")} participants
              </div>
              <Button disabled={joined} onClick={joinChallenge} type="button">
                <WandSparkles aria-hidden size={18} />
                {joined ? "Joined" : "Join challenge"}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invite a friend</CardTitle>
              <CardDescription>
                Both accounts get 50 eco-coins after their first entry.
              </CardDescription>
            </CardHeader>
            <div className="rounded-card border border-line bg-mist p-3 text-sm font-bold text-ink/70 break-all dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              {referralLink}
            </div>
            <Button className="mt-3 w-full" onClick={copyReferral} type="button" variant="secondary">
              <Copy aria-hidden size={18} />
              Copy invite
            </Button>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Badge>Share card</Badge>
              <h2 className="mt-3 font-heading text-2xl font-extrabold text-primary-dark dark:text-white">
                This month&apos;s win
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-white/65">
                Formatted for WhatsApp and Instagram Stories.
              </p>
              <Button className="mt-4" onClick={shareResult} type="button">
                <Share2 aria-hidden size={18} />
                Share result
              </Button>
            </div>
            <div className="mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-[28px] bg-primary-dark p-5 text-white shadow-soft">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <Badge className="bg-white/15 text-white" tone="dark">
                    GreenStep India
                  </Badge>
                  <h3 className="mt-6 font-heading text-3xl font-extrabold leading-tight">
                    I reduced my carbon footprint by 18% this month!
                  </h3>
                </div>
                <div>
                  <div className="mb-4 h-28 rounded-card bg-primary-light/20 p-4">
                    <div className="h-4 w-24 rounded-pill bg-white/80" />
                    <div className="mt-3 h-4 w-36 rounded-pill bg-white/40" />
                    <div className="mt-3 h-4 w-20 rounded-pill bg-amber" />
                  </div>
                  <p className="font-bold">🌿 #GreenIndia</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </MotionPage>
  );
}
