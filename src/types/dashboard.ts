export interface Analytics {
    title: string;
    value: string;
    description: string;
    type: "success" | "error" | "info" | "warning"
    icon?: React.ReactNode;
}

export interface AnalyticsList {
    data: Analytics[];
}

// ─── Daily Quiz ───────────────────────────────────────────────────────────────

export interface DailyQuizOption {
    id: number;
    option: string;
    correct_answer: boolean;
}

export interface DailyQuizQuestion {
    id: number;
    quiz_id: number;
    question: string;
    category: string;
    options: DailyQuizOption[];
}

export interface DailyQuizStats {
    streak: number;
    best_streak: number;
    answered_today: boolean;
    selected_option_id: number | null;
}

export interface DailyQuizResponse {
    message: string;
    status: number;
    data: {
        quiz: DailyQuizQuestion;
        is_correct: boolean;
        stats: DailyQuizStats;
    };
}

export interface DailyQuizSubmitPayload {
    quiz_id: number;
    option_id: number;
}

export interface DailyQuizSubmitResponse {
    message: string;
    status: string;
    data: {
        is_correct: boolean;
        stats: DailyQuizStats;
    };
}

export type ProgressRange = 7 | 30 | 90;

export interface StudyTimeChartData {
    chart_data: number[];
    labels: string[];
    total_this_week: number;
    total_this_period: number;
    change_percentage: number;
}

export interface StudyTimeResponse {
    status: string;
    data: StudyTimeChartData;
}

export interface TestScoreChartData {
    chart_data: number[];
    labels: string[];
    total_tests: number;
    avg_score: number;
    best_score: number;
}

export interface TestScoreResponse {
    status: string;
    data: TestScoreChartData;
}