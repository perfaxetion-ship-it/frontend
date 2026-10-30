export interface MatchInfo {
  home_team: string;
  away_team: string;
  stadium: string;
  city: string;
  lat: number;
  lon: number;
  kickoff_local: string;
  timezone: string;
  house_system: string;
}

export interface MinuteWindow {
  range: string;
  description: string;
}

export interface Predictions {
  ms: string;
  ms_code: string;
  confidence_pct: number;
  net_score_diff: number;
  half_time: string;
  half_time_goal: string;
  half_time_goal_reasons: string[];
  corners: string;
  corners_by_team: string;
  corner_reasons: string[];
  goals: string;
  exact_scores: string;
  xg: {
    home: number;
    away: number;
  };
  minute_windows: MinuteWindow[];
  full_report?: string;
  quick_summary?: string;
}

export interface AnalysisResponse {
  id?: number;
  match: MatchInfo;
  predictions: Predictions;
  telegram?: any;
}

export interface Stadium {
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}
