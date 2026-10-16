import { parseISO } from 'date-fns';

/**
 * 日付範囲文字列を解析してDateオブジェクトに変換する
 *
 * PostgreSQLから返される日付範囲文字列（例: ["2023-01-01","2023-01-05")）を
 * JavaScriptのDateオブジェクトに変換します。正規表現を使用して開始日と終了日を
 * 抽出し、parseISOで解析します。
 */
export const parseDateRange = (
  durationStr: string | null
): { startDate: Date | null; endDate: Date | null } => {
  if (!durationStr) return { startDate: null, endDate: null };

  const matches = durationStr.match(/\["?([^",]+)"?,[ "]*"?([^")]+)"?\)/);

  if (!matches || matches.length < 3) {
    console.warn(`Invalid duration format: ${durationStr}`);
    return { startDate: null, endDate: null };
  }

  try {
    return {
      startDate: parseISO(matches[1].trim()),
      endDate: parseISO(matches[2].trim()),
    };
  } catch (error) {
    console.error('Error parsing date range:', error);
    return { startDate: null, endDate: null };
  }
};
