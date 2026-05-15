import type { Pagination } from ".";
import type { DiscountTypeProps, SelectionType } from "./course";
import type { GlobalResponse } from "./user";

export type QuestionTypeProps = "mcq" | "subjective" | "omr" | ""
export interface OptionProps {
    id: number | null,
    option: string,
    is_correct: boolean
}

export interface QuestionProps {
    id: number | null;
    points: number;
    question: string;
    options: OptionProps[],
    megacategory_id: number | null;
    question_type: QuestionTypeProps
    has_image_in_option?: boolean;
}

export const QuestionInitialState: QuestionProps = {
    id: null,
    points: 0,
    question: "",
    options: [{ id: null, option: "", is_correct: false }],
    megacategory_id: null,
    question_type: "mcq"
};

export interface QuestionList extends GlobalResponse {
    data: {
        data: QuestionProps[];
        pagination: Pagination
    }
}

export interface TestProps {
    id?: number;
    course_id?: number;
    name: string;
    test_type?: string;
    duration: {
        hours: number;
        minutes: number;
    };
    description: string;
    full_mark: number;
    pass_mark: number;
    start_datetime: string;
    end_datetime: string;
    course_ids: number[];
    question_ids: number[];
    category?: string[];
    questions?: number;
    status?: null;
    no_of_students?: number;
    total_questions?: number;
    has_taken_test?: boolean;
    is_scheduled?: boolean;
    is_graded?: boolean;
    has_expired?: boolean;
    marked_price?: string,
    sale_price?: string;
    selections: SelectionType;
    mega_categories?: string[];
    download_format_url?: string;
    results: {
        attempted: number;
        score: number
    }
}
export interface TestList {
    data: {
        data: TestProps[]
        pagination: Pagination
    }
}

export interface SingleMcqResponse extends GlobalResponse {
    data: QuestionProps[];
    overview: TestProps & {
        name: string;
        time: number;
        test_type: QuestionTypeProps;
        end_datetime: string;
    }
}
export interface Answers {
    question_id: number | null;
    option_id: number | null;
}
export interface SubjectiveAnswers {
    question_id: number | null;
    answer_id: number[];
}

export interface McqSubmissionPayload {
    answers: Answers[]
    time_taken: number;
}
export interface McqSubmissionData {
    score: number;
    correct: number;
    incorrect: number;
    skipped: number;
    time_taken: string | null;
    attempted: number;
    total_questions: number;
    percentage: number;
    test_type: "mcq" | "subjective" | string;
    test_name: string;
    /** Subjective result fields */
    total_points?: number;
    full_mark?: number;
    pass_mark?: number;
    status?: "pass" | "fail" | string;
}

export interface McqSubmissionResponse extends GlobalResponse {
    data: McqSubmissionData;
}


export interface McqReportAnswerItem {
    question: string;
    your_answer_id: number | null;
    options: OptionProps[];
}
export interface McqReportData {
    test_name: string;
    total_questions: number;
    timer: string;
    start_date: string;
    start_time: string;
    end_time: string;
    correct_answers: McqReportAnswerItem[];
    incorrect_answers: McqReportAnswerItem[];
    skipped_answers: McqReportAnswerItem[];
}

export type TestTypeProps = "subjective" | "mcq"


export interface SetProps {
    id?: number;
    name: string;
    description: string;
    price: string;
    discount_type: DiscountTypeProps;
    discount: string;
    set_count: string;
    test_ids: number[];
    thumbnail: File | null;
    thumbnail_url: string;
    status: "published" | "draft";
    marked_price?: string;
    sale_price?: string;
    sets: { label: string; value: string }[]
    selections: SelectionType;
    created_at: string
    mega_categories?: string[];
    enrolled: number;
    avg_score: number;
    progress: number;
    completed: number;
    has_purchased: boolean;
    not_started_count: number;
    in_progress_count: number;
}


export interface SetList extends GlobalResponse {
    data: {
        data: SetProps[];
        pagination: Pagination
    }
}

export interface SetOveriew extends SetProps {
    total_questions: number;
}