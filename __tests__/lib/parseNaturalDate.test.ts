import { parseNaturalDate } from '@/lib/parseNaturalDate';

describe('parseNaturalDate', () => {
  const base = new Date('2025-02-15T12:00:00Z'); // Saturday

  it('returns null for text without date keyword', () => {
    expect(parseNaturalDate('이메일 보내기', base)).toBeNull();
    expect(parseNaturalDate('Buy milk', base)).toBeNull();
  });

  it('parses Korean 오늘 and returns rest text', () => {
    const r = parseNaturalDate('회의 준비 오늘', base);
    expect(r).not.toBeNull();
    expect(r!.restText).toBe('회의 준비');
    expect(r!.date.toISOString().startsWith('2025-02-15')).toBe(true);
  });

  it('parses Korean 내일', () => {
    const r = parseNaturalDate('이메일 보내기 내일', base);
    expect(r).not.toBeNull();
    expect(r!.restText).toBe('이메일 보내기');
    expect(r!.date.toISOString().startsWith('2025-02-16')).toBe(true);
  });

  it('parses Korean 모레', () => {
    const r = parseNaturalDate('과제 제출 모레', base);
    expect(r).not.toBeNull();
    expect(r!.date.toISOString().startsWith('2025-02-17')).toBe(true);
  });

  it('parses English tomorrow', () => {
    const r = parseNaturalDate('Call John tomorrow', base);
    expect(r).not.toBeNull();
    expect(r!.restText).toBe('Call John');
    expect(r!.date.toISOString().startsWith('2025-02-16')).toBe(true);
  });

  it('parses next week', () => {
    const r = parseNaturalDate('리뷰 작성 다음 주', base);
    expect(r).not.toBeNull();
    expect(r!.date.toISOString().startsWith('2025-02-22')).toBe(true);
  });
});
