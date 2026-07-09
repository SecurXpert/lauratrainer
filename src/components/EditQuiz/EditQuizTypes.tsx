export interface Question {
  id?: number;
  _client_id: string; // client-only unique key
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // 'a' | 'b' | 'c' | 'd'
  difficulty?: string;
  type?: string;
  points?: number;
}
