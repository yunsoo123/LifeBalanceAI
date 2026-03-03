/**
 * 한글 기본 / 영어 전환. 프로덕션 한글 출시용.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'ko' | 'en';

type Strings = {
  common: {
    save: string;
    saving: string;
    delete: string;
    cancel: string;
    loading: string;
    error: string;
    add: string;
    ok: string;
    done: string;
    offlineMessage: string;
    signInRequiredTitle: string;
    signInRequiredToSave: string;
    limitReachedTitle: string;
    limitReachedParse: string;
    limitReachedSchedule: string;
    limitReachedInsight: string;
    retry: string;
    saveFailed: string;
    offlineSaveMessage: string;
  };
  inbox: {
    title: string;
    subtitle: string;
    structureAll: string;
    placeholder: string;
    quickAddPlaceholder: string;
    addEntry: string;
    voice: string;
    recentEntries: string;
    emptyTitle: string;
    emptyDesc: string;
    parsed: string;
    parse: string;
    savedToNote: string;
  };
  capture: {
    title: string;
    placeholder: string;
    save: string;
    placementCalendarOnly: string;
    placementTodoOnly: string;
    placementBoth: string;
    aiSchedule: string;
    addSuccess: string;
    todoSuccess: string;
    bothSuccess: string;
  };
  todo: {
    title: string;
    add: string;
    emptyTitle: string;
    emptyDesc: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
    deleteSuccess: string;
    longPressToDelete: string;
    dueDate: string;
    category: string;
    recurrence: string;
    changeDate: string;
    categoryWorkout: string;
    categoryProject: string;
    categoryStudy: string;
    categoryOther: string;
    recurrenceNone: string;
    recurrenceDaily: string;
    recurrenceWeekly: string;
    recurrenceMonthly: string;
  };
  schedule: {
    title: string;
    subtitle: string;
    description: string;
    inputQuestion: string;
    inputPlaceholder: string;
    tip: string;
    morningPerson: string;
    yes: string;
    no: string;
    workHours: string;
    morning: string;
    afternoon: string;
    generate: string;
    generating: string;
    generatedSchedule: string;
    addToCalendar: string;
    saveSchedule: string;
    saving: string;
    newSchedule: string;
    emptyTitle: string;
    emptyDesc: string;
    totalHours: string;
    feasible: string;
    suggestions: string;
    saveSuccess: string;
    saveFailedMessage: string;
  };
  calendar: {
    today: string;
    addEvent: string;
    editEvent: string;
    newEvent: string;
    eventTitle: string;
    eventTitlePlaceholder: string;
    descriptionOptional: string;
    descriptionPlaceholder: string;
    date: string;
    dateTapHint: string;
    startTime: string;
    startTimePlaceholder: string;
    endTime: string;
    endTimePlaceholder: string;
    prevDay: string;
    nextDay: string;
    create: string;
    creating: string;
    eventTitleRequired: string;
    createEventSuccess: string;
    createEventFailed: string;
    endTimeAfterStart: string;
    signInRequiredTitle: string;
    signInRequiredMessage: string;
    timetableMoveHint: string;
    timetableMoveCancel: string;
    conflictTitle: string;
    conflictMessage: string;
    conflictMessageWithTitle: string;
    conflictCancel: string;
    conflictMoveHere: string;
    eventActionMove: string;
    eventActionAddNextWeek: string;
    eventActionRepeatWeekday: string;
    eventActionDelete: string;
    eventActionEdit: string;
    deleteEventSuccess: string;
    deleteEventFailed: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
    addNextWeekSuccess: string;
    repeatWeekdaySuccess: string;
    importAI: string;
    notes: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyAction: string;
    recurrenceLabel: string;
    achievementLabel: string;
  };
  notes: {
    title: string;
    newNote: string;
    noteSaved: string;
    noteDeleted: string;
    searchPlaceholder: string;
    aiEnhance: string;
    linkedEvents: string;
    linkedEventsCount: string;
    addTag: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyDescSearch: string;
    firstNoteCta: string;
    linkEventDescription: string;
    selectNoteTitle: string;
    selectNoteDesc: string;
    changeCover: string;
    lastEdited: string;
    untitledNote: string;
    noteTitlePlaceholder: string;
    startWritingPlaceholder: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    linkEvent: string;
    emptyNoteTitle: string;
    emptyNoteMessage: string;
    emptyNoteParenthesis: string;
    enhance: string;
    generating: string;
    generateSuggestionsDesc: string;
    back: string;
    edit: string;
    selectEvents: string;
    done: string;
    noUpcomingEvents: string;
    todayLabel: string;
    yesterdayLabel: string;
    daysAgoLabel: string;
    signInRequiredTitle: string;
    signInRequiredMessage: string;
    signIn: string;
    createNoteFailed: string;
    saveNoteFailed: string;
    deleteNoteTitle: string;
    deleteNoteMessage: string;
    linkEventFailed: string;
    deleteNoteFailed: string;
    aiSuggestionsFailedTitle: string;
    aiSuggestionsFailedMessage: string;
    knowledgeLinkLabel: string;
    knowledgeLinkPlaceholder: string;
    aiSummaryLabel: string;
    actionItemsLabel: string;
    suggestionsLabel: string;
    eventAlertTitle: string;
    eventAlertMessage: string;
    filterAll: string;
    filterLinked: string;
    viewInReview: string;
  };
  review: {
    title: string;
    weeklyReport: string;
    copy: string;
    share: string;
    emptyAction: string;
    export: string;
    generate: string;
    prev: string;
    next: string;
    thisWeek: string;
    tasksCompleted: string;
    incomplete: string;
    notesCreated: string;
    completionRate: string;
    aiInsights: string;
    generateInsights: string;
    emptyTitle: string;
    emptyDesc: string;
    signInToSeeTitle: string;
    signInToSeeDesc: string;
    weeklySummary: string;
    achievementOverview: string;
    weeklyAchievementRate: string;
    excellent: string;
    good: string;
    keepGoing: string;
    hoursProgress: string;
    keyMetrics: string;
    hoursCompleted: string;
    eventsCompleted: string;
    notesCreatedLabel: string;
    newNotes: string;
    aiInsightsTitle: string;
    insightsCount: string;
    analyzingYourWeek: string;
    mayTakeFewSeconds: string;
    generateInsightsDesc: string;
    preparingExport: string;
    planAchievementRateTooltip: string;
    eventCompletionRateLabel: string;
    summaryTitle: string;
    totalFocusTimeLabel: string;
    planAchievementRateLabel: string;
    overBudgetLine: string;
  };
  profile: {
    title: string;
    darkMode: string;
    language: string;
    langKo: string;
    langEn: string;
    upgradePro: string;
    unlockAI: string;
    upgrade: string;
    signOut: string;
    free: string;
    pro: string;
    usageTitle: string;
    schedules: string;
    parses: string;
    insights: string;
    proDescription: string;
    freeDescription: string;
  };
  guide: {
    title: string;
    inboxTitle: string;
    inboxBody: string;
    scheduleTitle: string;
    scheduleBody: string;
    calendarTitle: string;
    calendarBody: string;
    notesTitle: string;
    notesBody: string;
    reviewTitle: string;
    reviewBody: string;
    back: string;
    linkLabel: string;
  };
  auth: {
    welcomeBack: string;
    signInDesc: string;
    signIn: string;
    createAccount: string;
    createAccountPrompt: string;
    alreadyHaveAccount: string;
    signUp: string;
    signUpDesc: string;
    signUpTagline: string;
    email: string;
    password: string;
    enterEmailAndPassword: string;
    passwordMinLength: string;
    checkEmailTitle: string;
    checkEmailMessage: string;
    signUpFailed: string;
    signInRequiredToAddToCalendar: string;
  };
  onboarding: {
    slide1Subtitle: string;
    slide1Title: string;
    slide1Description: string;
    slide2Subtitle: string;
    slide2Title: string;
    slide2Description: string;
    slide3Subtitle: string;
    slide3Title: string;
    slide3Description: string;
    skip: string;
    next: string;
    start: string;
    previousSlide: string;
    goToSlide: string;
  };
};

const ko: Strings = {
  common: {
    save: '저장',
    saving: '저장 중...',
    delete: '삭제',
    cancel: '취소',
    loading: '로딩 중...',
    error: '오류',
    add: '추가',
    ok: '확인',
    done: '완료',
    offlineMessage: '오프라인 — 연결되면 동기화돼요',
    signInRequiredTitle: '로그인 필요',
    signInRequiredToSave: '저장하려면 로그인해 주세요.',
    limitReachedTitle: '한도 초과',
    limitReachedParse: '무료 플랜은 월 {n}회까지 파싱이 가능해요.',
    limitReachedSchedule:
      '무료 플랜은 월 {n}회까지 AI 일정 생성이 가능해요. Pro는 인앱 결제로 업그레이드 예정이에요.',
    limitReachedInsight:
      '무료 플랜은 월 {n}회까지 AI 인사이트 생성이 가능해요. Pro는 인앱 결제로 업그레이드 예정이에요.',
    retry: '다시 시도',
    saveFailed: '저장 실패',
    offlineSaveMessage: '오프라인이라 저장되지 않았어요. 연결 후 다시 시도해 주세요.',
  },
  inbox: {
    title: '브레인 덤프',
    subtitle: '한 줄로 적고 → 구조화·캘린더에 추가',
    structureAll: '구조화하기',
    placeholder: '자유롭게 입력하세요... 🧠',
    quickAddPlaceholder: '한 줄로 적고 Enter 또는 추가',
    addEntry: '항목 추가',
    voice: '음성',
    recentEntries: '최근 항목',
    emptyTitle: '아직 항목이 없어요',
    emptyDesc:
      '여기에 생각을 적고 [항목 추가]를 누른 뒤, [구조화하기]로 일정·노트로 넘길 수 있어요.',
    parsed: '구조화됨',
    parse: '구조화',
    savedToNote: 'Notes에 저장됨',
  },
  capture: {
    title: '캡처',
    placeholder: '할 일이나 일정을 적어 보세요',
    save: '저장',
    placementCalendarOnly: '일정에만 추가',
    placementTodoOnly: '할 일만 추가',
    placementBoth: '일정 + 할 일 둘 다',
    aiSchedule: 'AI 주간 일정 만들기',
    addSuccess: '캘린더에 추가되었어요',
    todoSuccess: '할 일에 추가되었어요',
    bothSuccess: '일정과 할 일에 추가되었어요',
  },
  todo: {
    title: '할 일',
    add: '할 일 추가',
    emptyTitle: '할 일이 없어요',
    emptyDesc: 'Capture에서 추가하거나 아래 버튼으로 만드세요.',
    deleteConfirmTitle: '할 일 삭제',
    deleteConfirmMessage: '삭제하면 복구할 수 없어요.',
    deleteSuccess: '삭제되었어요',
    longPressToDelete: '길게 누르면 삭제할 수 있어요',
    dueDate: '마감일',
    category: '카테고리',
    recurrence: '반복',
    changeDate: '날짜 변경',
    categoryWorkout: '운동',
    categoryProject: '프로젝트',
    categoryStudy: '공부',
    categoryOther: '기타',
    recurrenceNone: '없음',
    recurrenceDaily: '매일',
    recurrenceWeekly: '매주',
    recurrenceMonthly: '매월',
  },
  schedule: {
    title: 'AI 일정 생성',
    subtitle: 'AI와 대화로 주간 일정 설계',
    description: '일정에 대해 알려주세요',
    inputQuestion: '이번 주에 무엇을 하고 싶나요?',
    inputPlaceholder: '예: 앱 개발, 시험 공부, 파트타임...',
    tip: '고정 일정(학교, 회사)과 선호(아침형/올빼미형)를 적어 주세요.',
    morningPerson: '아침형이에요? ☀️',
    yes: '예',
    no: '아니오',
    workHours: '일하는 시간? 💼',
    morning: '오전',
    afternoon: '오후',
    generate: '🪄 내 일정 생성하기',
    generating: '생성 중...',
    generatedSchedule: '생성된 일정',
    addToCalendar: '📅 캘린더에 추가',
    saveSchedule: '💾 일정 저장',
    saving: '저장 중...',
    newSchedule: '새로 만들기',
    emptyTitle: '일정을 만들어 볼까요?',
    emptyDesc:
      '이번 주 목표를 한 줄로 적어 보세요. 위 입력창에 쓰면 AI가 주간 일정을 만들어 드려요.',
    totalHours: '총 시간',
    feasible: '현실성',
    suggestions: '💡 AI 제안',
    saveSuccess: '일정이 저장되었어요.',
    saveFailedMessage: '일정 저장에 실패했어요. 다시 시도해 주세요.',
  },
  calendar: {
    today: '오늘',
    addEvent: '이벤트 추가',
    editEvent: '일정 수정',
    newEvent: '새 일정',
    eventTitle: '제목',
    eventTitlePlaceholder: '제목 입력',
    descriptionOptional: '설명 (선택)',
    descriptionPlaceholder: '설명 추가',
    date: '날짜',
    dateTapHint: '탭하여 날짜 선택',
    startTime: '시작 시간 (HH:MM)',
    startTimePlaceholder: '09:00',
    endTime: '종료 시간 (HH:MM)',
    endTimePlaceholder: '10:00',
    prevDay: '이전 날',
    nextDay: '다음 날',
    create: '만들기',
    creating: '저장 중...',
    eventTitleRequired: '제목을 입력해 주세요.',
    createEventSuccess: '일정이 추가되었어요.',
    createEventFailed: '일정 추가에 실패했어요.',
    endTimeAfterStart: '종료 시간은 시작 시간보다 뒤여야 해요.',
    signInRequiredTitle: '로그인 필요',
    signInRequiredMessage: '일정을 추가하려면 로그인해 주세요.',
    timetableMoveHint: '일정 블록을 길게 누른 뒤, 이동할 칸을 탭하세요',
    timetableMoveCancel: '취소',
    conflictTitle: '시간 충돌',
    conflictMessage: '이 시간대에 다른 일정이 있어요. 이동할까요?',
    conflictMessageWithTitle: '이 시간대에 "{title}" 일정이 있어요. 이동할까요?',
    conflictCancel: '취소',
    conflictMoveHere: '이동하기',
    eventActionMove: '옮기기',
    eventActionAddNextWeek: '다음 주에도 추가',
    eventActionRepeatWeekday: '매주 {weekday}마다',
    eventActionDelete: '삭제',
    eventActionEdit: '수정',
    deleteEventSuccess: '일정이 삭제되었어요.',
    deleteEventFailed: '삭제에 실패했어요.',
    deleteConfirmTitle: '일정 삭제',
    deleteConfirmMessage: '삭제하면 복구할 수 없어요.',
    addNextWeekSuccess: '다음 주에 추가되었어요.',
    repeatWeekdaySuccess: '반복 일정이 추가되었어요.',
    importAI: 'AI 가져오기',
    notes: '노트',
    emptyTitle: '이번 주 이벤트가 없어요',
    emptyDesc: '추가하거나 Schedule에서 가져와 보세요.',
    emptyAction: '일정 만들기',
    recurrenceLabel: '반복',
    achievementLabel: '성취도',
  },
  notes: {
    title: '노트',
    newNote: '새 노트',
    noteSaved: '노트가 저장되었어요.',
    noteDeleted: '노트가 삭제되었어요.',
    searchPlaceholder: '노트 검색...',
    aiEnhance: 'AI 보강',
    linkedEvents: '연결된 이벤트',
    linkedEventsCount: '연결된 일정 ({count})',
    addTag: '태그 추가',
    emptyTitle: '노트가 없어요',
    emptyDesc: '새로 만들거나 Inbox에서 저장해 보세요.',
    emptyDescSearch: '검색 결과가 없어요',
    firstNoteCta: '첫 노트 만들기',
    linkEventDescription: '이 노트를 캘린더 일정과 연결하면 리뷰에서 함께 볼 수 있어요.',
    selectNoteTitle: '노트를 선택하세요',
    selectNoteDesc: '목록에서 고르거나 새 노트를 만드세요.',
    changeCover: '커버 변경',
    lastEdited: '마지막 수정',
    untitledNote: '제목 없는 노트',
    noteTitlePlaceholder: '노트 제목...',
    startWritingPlaceholder: '내용을 입력하세요...',
    tagsLabel: '태그 (쉼표로 구분)',
    tagsPlaceholder: '업무, 개인, 아이디어...',
    linkEvent: '+ 일정 연결',
    emptyNoteTitle: '빈 노트',
    emptyNoteMessage: '노트에 내용을 먼저 추가해 주세요.',
    emptyNoteParenthesis: '(빈 노트)',
    enhance: '보강',
    generating: '생성 중...',
    generateSuggestionsDesc: '이 노트로 제안을 생성해요.',
    back: '뒤로',
    edit: '수정',
    selectEvents: '일정 선택',
    done: '완료',
    noUpcomingEvents: '예정된 일정이 없어요',
    todayLabel: '오늘',
    yesterdayLabel: '어제',
    daysAgoLabel: '{count}일 전',
    signInRequiredTitle: '로그인 필요',
    signInRequiredMessage: '노트를 만들려면 로그인해 주세요.',
    signIn: '로그인',
    createNoteFailed: '노트 만들기에 실패했어요.',
    saveNoteFailed: '노트 저장에 실패했어요.',
    deleteNoteTitle: '노트 삭제',
    deleteNoteMessage: '이 노트를 삭제할까요?',
    linkEventFailed: '일정 연결에 실패했어요.',
    deleteNoteFailed: '노트 삭제에 실패했어요.',
    aiSuggestionsFailedTitle: 'AI 제안 실패',
    aiSuggestionsFailedMessage:
      'AI 제안을 생성하지 못했어요.\n\n확인해 주세요:\n1. OpenAI API 키\n2. API 서버 실행 여부\n3. /api/note/enhance 엔드포인트',
    knowledgeLinkLabel: '지식 연결 · 연결된 일정',
    knowledgeLinkPlaceholder: '지식 연결: 연결된 일정·노트가 여기에 표시됩니다.',
    aiSummaryLabel: 'AI 요약',
    actionItemsLabel: '실행 항목',
    suggestionsLabel: '제안',
    eventAlertTitle: '일정',
    eventAlertMessage: '(상세 보기는 Phase 5에서)',
    filterAll: '전체',
    filterLinked: '일정 연결됨',
    viewInReview: '리뷰에서 보기',
  },
  review: {
    title: '주간 리뷰',
    weeklyReport: '주간 리포트',
    copy: '복사',
    share: '공유',
    export: '내보내기',
    generate: '인사이트 생성',
    prev: '이전',
    next: '다음',
    thisWeek: '이번 주',
    tasksCompleted: '완료한 작업',
    incomplete: '미완료',
    notesCreated: '작성한 노트',
    completionRate: '달성률',
    aiInsights: 'AI 인사이트',
    generateInsights: '인사이트 생성',
    emptyTitle: '이번 주 데이터가 없어요',
    emptyDesc: 'Schedule·Calendar를 사용하면 여기에 통계가 쌓여요.',
    emptyAction: 'Schedule로 가기',
    signInToSeeTitle: '로그인하면 주간 리뷰를 볼 수 있어요',
    signInToSeeDesc: '이번 주 몰입 시간, 계획 달성률, 목표 vs 실제가 표시돼요.',
    weeklySummary: '이번 주 노트 {notes}개 · 일정 {events}개',
    achievementOverview: '달성 현황',
    weeklyAchievementRate: '주간 달성률',
    excellent: '훌륭해요',
    good: '잘했어요',
    keepGoing: '조금만 더',
    hoursProgress: '시간 진행률',
    keyMetrics: '주요 지표',
    hoursCompleted: '달성 시간',
    eventsCompleted: '완료한 일정',
    notesCreatedLabel: '작성한 노트',
    newNotes: '개',
    aiInsightsTitle: 'AI 인사이트',
    insightsCount: '개 인사이트',
    analyzingYourWeek: '이번 주를 분석하고 있어요...',
    mayTakeFewSeconds: '잠시만 기다려 주세요.',
    generateInsightsDesc: '주간 성과를 바탕으로 맞춤 인사이트를 생성해 드려요.',
    preparingExport: '내보내는 중...',
    planAchievementRateTooltip: '계획한 시간 대비 실제 한 시간 비율이에요.',
    eventCompletionRateLabel: '이벤트 완료율',
    summaryTitle: '이번 주 요약',
    totalFocusTimeLabel: '총 몰입 시간',
    planAchievementRateLabel: '계획 달성률',
    overBudgetLine: '목표 초과',
  },
  profile: {
    title: '프로필',
    darkMode: '다크 모드',
    language: '언어',
    langKo: '한글',
    langEn: 'English',
    upgradePro: 'Pro 업그레이드',
    unlockAI: 'AI 기능 무제한',
    upgrade: '업그레이드',
    signOut: '로그아웃',
    free: '무료',
    pro: 'Pro',
    usageTitle: '이번 달 AI 사용량',
    schedules: '일정 생성',
    parses: '노트 파싱',
    insights: 'AI 인사이트',
    proDescription: 'Pro 플랜으로 무제한 이용 중이에요.',
    freeDescription: 'Free 플랜 (무료 한도). Pro로 업그레이드할 수 있어요.',
  },
  guide: {
    title: 'Mendly 사용 가이드',
    inboxTitle: 'Capture',
    inboxBody:
      '할 일이나 일정을 적어 보세요. 일정만, 할 일만, 또는 둘 다 추가할 수 있어요. AI 주간 일정도 여기서 만들 수 있어요.',
    scheduleTitle: 'Schedule',
    scheduleBody: '하고 싶은 일을 말하면 AI가 질문으로 맞춤 주간 일정을 만들어요. 요일·시간을 바꾼 뒤 캘린더에 등록하세요.',
    calendarTitle: 'Calendar',
    calendarBody: '주간 타임테이블에서 일정을 보고, 길게 누르면 이동·수정할 수 있어요. + 버튼으로 새 일정을 추가해 보세요.',
    notesTitle: 'Notes',
    notesBody: '노트를 저장하고 검색할 수 있어요. Inbox에서 저장한 항목도 여기서 볼 수 있어요.',
    reviewTitle: 'Review',
    reviewBody: '이번 주 달성 현황과 AI 인사이트를 확인하고, 리포트를 복사·공유할 수 있어요.',
    back: '뒤로',
    linkLabel: '사용 가이드',
  },
  auth: {
    welcomeBack: '다시 오신 걸 환영해요',
    signInDesc: '로그인하면 일정, 노트, 리뷰가 동기화돼요.',
    signIn: '로그인',
    createAccount: '계정 만들기',
    createAccountPrompt: '계정이 없으신가요?',
    alreadyHaveAccount: '이미 계정이 있어요. 로그인',
    signUp: '가입하기',
    signUpDesc: '일정, 노트, 주간 리뷰를 한 계정으로.',
    signUpTagline: '이메일로 간편하게 시작하세요',
    email: '이메일',
    password: '비밀번호',
    enterEmailAndPassword: '이메일과 비밀번호를 입력해 주세요.',
    passwordMinLength: '비밀번호는 6자 이상이에요.',
    checkEmailTitle: '이메일을 확인해 주세요',
    checkEmailMessage: '인증 링크를 보냈어요. 메일에서 링크를 누른 뒤 로그인해 주세요.',
    signUpFailed: '가입에 실패했어요',
    signInRequiredToAddToCalendar: '캘린더에 추가하려면 로그인해 주세요.',
  },
  onboarding: {
    slide1Subtitle: 'Inbox',
    slide1Title: '생각을 쏟아내세요',
    slide1Description: '떠오르는 생각, 할 일, 아이디어를\n바로 적거나 말해보세요.',
    slide2Subtitle: 'Schedule',
    slide2Title: 'AI가 한 주를 설계해요',
    slide2Description: 'AI가 우선순위를 분석해\n최적의 주간 계획을 만들어 드려요.',
    slide3Subtitle: 'Organize',
    slide3Title: '캘린더, 노트, 리뷰',
    slide3Description: '캘린더, 노트, 주간 리뷰까지\n한 곳에서 관리하세요.',
    skip: '건너뛰기',
    next: '다음',
    start: '시작',
    previousSlide: '이전 슬라이드',
    goToSlide: '슬라이드 {n}로 이동',
  },
};

const en: Strings = {
  common: {
    save: 'Save',
    saving: 'Saving...',
    delete: 'Delete',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    add: 'Add',
    ok: 'OK',
    done: 'Done',
    offlineMessage: 'Offline — changes will sync when connected',
    signInRequiredTitle: 'Sign in required',
    signInRequiredToSave: 'Please sign in to save.',
    limitReachedTitle: 'Limit reached',
    limitReachedParse: 'Free plan allows {n} parses per month.',
    limitReachedSchedule:
      'Free plan allows {n} AI schedule generations per month. Pro upgrade coming soon.',
    limitReachedInsight:
      'Free plan allows {n} AI insights per month. Pro upgrade coming soon.',
    retry: 'Retry',
    saveFailed: 'Save failed',
    offlineSaveMessage: 'Offline. Please try again when connected.',
  },
  inbox: {
    title: 'Brain Dump',
    subtitle: 'Type a line → structure & add to calendar',
    structureAll: 'Structure All',
    placeholder: 'Type freely... 🧠',
    quickAddPlaceholder: 'Type a line and Enter or Add',
    addEntry: 'Add Entry',
    voice: 'Voice',
    recentEntries: 'Recent Entries',
    emptyTitle: 'No entries yet',
    emptyDesc:
      'Type here, tap [Add Entry], then use [Structure] to turn them into schedule or notes.',
    parsed: 'Parsed',
    parse: 'Parse',
    savedToNote: 'Saved to Notes',
  },
  capture: {
    title: 'Capture',
    placeholder: 'Add a task or schedule',
    save: 'Save',
    placementCalendarOnly: 'Add to calendar only',
    placementTodoOnly: 'Add to to-do only',
    placementBoth: 'Add to both calendar & to-do',
    aiSchedule: 'Create AI weekly schedule',
    addSuccess: 'Added to calendar',
    todoSuccess: 'Added to to-do',
    bothSuccess: 'Added to calendar and to-do',
  },
  todo: {
    title: 'To-Do',
    add: 'Add to-do',
    emptyTitle: 'No to-dos',
    emptyDesc: 'Add from Capture or use the button below.',
    deleteConfirmTitle: 'Delete to-do?',
    deleteConfirmMessage: 'This cannot be undone.',
    deleteSuccess: 'Deleted',
    longPressToDelete: 'Long press to delete',
    dueDate: 'Due date',
    category: 'Category',
    recurrence: 'Repeat',
    changeDate: 'Change date',
    categoryWorkout: 'Workout',
    categoryProject: 'Project',
    categoryStudy: 'Study',
    categoryOther: 'Other',
    recurrenceNone: 'None',
    recurrenceDaily: 'Daily',
    recurrenceWeekly: 'Weekly',
    recurrenceMonthly: 'Monthly',
  },
  schedule: {
    title: 'AI Schedule Generator',
    subtitle: 'Plan your week with AI conversation',
    description: 'Tell me about your commitments',
    inputQuestion: 'What do you want to accomplish this week?',
    inputPlaceholder: 'Example: app dev, study, work...',
    tip: 'Mention fixed commitments and preferences (morning/evening).',
    morningPerson: 'Morning person? ☀️',
    yes: 'Yes',
    no: 'No',
    workHours: 'Work hours? 💼',
    morning: 'Morning',
    afternoon: 'Afternoon',
    generate: '🪄 Generate My Schedule',
    generating: 'Generating...',
    generatedSchedule: 'Generated Schedule',
    addToCalendar: '📅 Add to Calendar',
    saveSchedule: '💾 Save Schedule',
    saving: 'Saving...',
    newSchedule: 'New',
    emptyTitle: 'Ready to plan your week?',
    emptyDesc: "Type your goal in one line above and I'll create a realistic schedule.",
    totalHours: 'Total Hours',
    feasible: 'Feasibility',
    suggestions: '💡 AI Suggestions',
    saveSuccess: 'Schedule saved.',
    saveFailedMessage: 'Failed to save schedule. Please try again.',
  },
  calendar: {
    today: 'Today',
    addEvent: 'Add Event',
    editEvent: 'Edit Event',
    newEvent: 'New Event',
    eventTitle: 'Event title',
    eventTitlePlaceholder: 'Enter title',
    descriptionOptional: 'Description (optional)',
    descriptionPlaceholder: 'Add description',
    date: 'Date',
    dateTapHint: 'Tap to select date',
    startTime: 'Start time (HH:MM)',
    startTimePlaceholder: '09:00',
    endTime: 'End time (HH:MM)',
    endTimePlaceholder: '10:00',
    prevDay: 'Prev day',
    nextDay: 'Next day',
    create: 'Create',
    creating: 'Creating...',
    eventTitleRequired: 'Please enter event title.',
    createEventSuccess: 'Event created.',
    createEventFailed: 'Failed to create event.',
    endTimeAfterStart: 'End time must be after start time.',
    signInRequiredTitle: 'Sign in required',
    signInRequiredMessage: 'Please sign in to create events.',
    timetableMoveHint: 'Long-press an event block, then tap a cell to move',
    timetableMoveCancel: 'Cancel',
    conflictTitle: 'Time conflict',
    conflictMessage: 'This slot has another event. Move here anyway?',
    conflictMessageWithTitle: 'This slot has "{title}". Move here anyway?',
    conflictCancel: 'Cancel',
    conflictMoveHere: 'Move here',
    eventActionMove: 'Move',
    eventActionAddNextWeek: 'Add to next week',
    eventActionRepeatWeekday: 'Every {weekday}',
    eventActionDelete: 'Delete',
    eventActionEdit: 'Edit',
    deleteEventSuccess: 'Event deleted.',
    deleteEventFailed: 'Failed to delete.',
    deleteConfirmTitle: 'Delete event?',
    deleteConfirmMessage: 'This cannot be undone.',
    addNextWeekSuccess: 'Added to next week.',
    repeatWeekdaySuccess: 'Recurring events added.',
    importAI: 'Import AI',
    notes: 'Notes',
    emptyTitle: 'No events this week',
    emptyDesc: 'Add one or import from Schedule.',
    emptyAction: 'Create schedule',
    recurrenceLabel: 'Repeat',
    achievementLabel: 'Achievement',
  },
  notes: {
    title: 'Notes',
    newNote: 'New Note',
    noteSaved: 'Note saved.',
    noteDeleted: 'Note deleted.',
    searchPlaceholder: 'Search notes...',
    aiEnhance: 'AI Enhance',
    linkedEvents: 'Linked Events',
    linkedEventsCount: 'Linked Events ({count})',
    addTag: 'Add tag',
    emptyTitle: 'No notes',
    emptyDesc: 'Create one or save from Inbox.',
    emptyDescSearch: 'No matching notes',
    firstNoteCta: 'Create your first note',
    linkEventDescription: 'Link this note to a calendar event to see it in your weekly review.',
    selectNoteTitle: 'Select a note',
    selectNoteDesc: 'Choose from the list or create a new one.',
    changeCover: 'Change Cover',
    lastEdited: 'Last edited',
    untitledNote: 'Untitled Note',
    noteTitlePlaceholder: 'Note title...',
    startWritingPlaceholder: 'Start writing...',
    tagsLabel: 'Tags (comma-separated)',
    tagsPlaceholder: 'work, personal, ideas...',
    linkEvent: '+ Link Event',
    emptyNoteTitle: 'Empty note',
    emptyNoteMessage: 'Add some content to the note first.',
    emptyNoteParenthesis: '(Empty note)',
    enhance: 'Enhance',
    generating: 'Generating...',
    generateSuggestionsDesc: 'Generate suggestions from this note.',
    back: 'Back',
    edit: 'Edit',
    selectEvents: 'Select Events',
    done: 'Done',
    noUpcomingEvents: 'No upcoming events',
    todayLabel: 'Today',
    yesterdayLabel: 'Yesterday',
    daysAgoLabel: '{count} days ago',
    signInRequiredTitle: 'Sign in required',
    signInRequiredMessage: 'Please sign in to create notes.',
    signIn: 'Sign in',
    createNoteFailed: 'Failed to create note.',
    saveNoteFailed: 'Failed to save note.',
    deleteNoteTitle: 'Delete note',
    deleteNoteMessage: 'Delete this note?',
    linkEventFailed: 'Failed to link event.',
    deleteNoteFailed: 'Failed to delete note.',
    aiSuggestionsFailedTitle: 'AI suggestions failed',
    aiSuggestionsFailedMessage:
      'Failed to generate AI suggestions.\n\nCheck:\n1. OpenAI API key\n2. API server running\n3. /api/note/enhance endpoint',
    knowledgeLinkLabel: 'Knowledge connection · Linked schedule',
    knowledgeLinkPlaceholder: 'Knowledge links: Connected events and notes appear here.',
    aiSummaryLabel: 'AI Summary',
    actionItemsLabel: 'Action Items',
    suggestionsLabel: 'Suggestions',
    eventAlertTitle: 'Event',
    eventAlertMessage: '(Full navigation in Phase 5)',
    filterAll: 'All',
    filterLinked: 'Linked to schedule',
    viewInReview: 'View in Review',
  },
  review: {
    title: 'Weekly Review',
    weeklyReport: 'Weekly report',
    copy: 'Copy',
    share: 'Share',
    export: 'Export',
    generate: 'Generate',
    prev: 'Prev',
    next: 'Next',
    thisWeek: 'This Week',
    tasksCompleted: 'tasks completed',
    incomplete: 'incomplete',
    notesCreated: 'notes created',
    completionRate: 'completion rate',
    aiInsights: 'AI Insights',
    generateInsights: 'Generate Insights',
    emptyTitle: 'No data for this week',
    emptyDesc: 'Use Schedule and Calendar to see stats here.',
    emptyAction: 'Go to Schedule',
    signInToSeeTitle: 'Sign in to see your weekly review',
    signInToSeeDesc: 'See total focus time, achievement rate, and goal vs actual.',
    weeklySummary: 'This week: {notes} notes · {events} events',
    achievementOverview: 'Achievement Overview',
    weeklyAchievementRate: 'Weekly Achievement Rate',
    excellent: 'Excellent',
    good: 'Good',
    keepGoing: 'Keep Going',
    hoursProgress: 'Hours Progress',
    keyMetrics: 'Key Metrics',
    hoursCompleted: 'Hours Completed',
    eventsCompleted: 'Events Completed',
    notesCreatedLabel: 'Notes Created',
    newNotes: 'new notes',
    aiInsightsTitle: 'AI Insights',
    insightsCount: 'insights',
    analyzingYourWeek: 'Analyzing your week...',
    mayTakeFewSeconds: 'This may take a few seconds.',
    generateInsightsDesc:
      'Generate AI insights to get personalized recommendations based on your weekly performance.',
    preparingExport: 'Preparing export...',
    planAchievementRateTooltip: 'Actual hours done vs planned hours.',
    eventCompletionRateLabel: 'Event completion rate',
    summaryTitle: "This week's summary",
    totalFocusTimeLabel: 'Total focus time',
    planAchievementRateLabel: 'Plan achievement rate',
    overBudgetLine: 'Over budget',
  },
  profile: {
    title: 'Profile',
    darkMode: 'Dark Mode',
    language: 'Language',
    langKo: '한글',
    langEn: 'English',
    upgradePro: 'Upgrade to Pro',
    unlockAI: 'Unlock AI features',
    upgrade: 'Upgrade',
    signOut: 'Sign Out',
    free: 'Free',
    pro: 'Pro',
    usageTitle: 'AI usage this month',
    schedules: 'Schedules',
    parses: 'Parses',
    insights: 'Insights',
    proDescription: 'You are on Pro with unlimited access.',
    freeDescription: 'Free tier (limits apply). Upgrade to Pro for more.',
  },
  guide: {
    title: 'How to use Mendly',
    inboxTitle: 'Capture',
    inboxBody:
      'Add tasks or events here. You can add to calendar only, to-do only, or both. Create AI weekly schedules here too.',
    scheduleTitle: 'Schedule',
    scheduleBody: 'Tell AI what you want to do; it asks a few questions and builds a weekly plan. Adjust days/times, then add to calendar.',
    calendarTitle: 'Calendar',
    calendarBody: 'View events on the weekly timetable. Long-press to move or edit. Use + to add new events.',
    notesTitle: 'Notes',
    notesBody: 'Save and search notes. Items saved from Inbox appear here.',
    reviewTitle: 'Review',
    reviewBody: 'See this week\'s progress and AI insights. Copy or share your report.',
    back: 'Back',
    linkLabel: 'Usage guide',
  },
  auth: {
    welcomeBack: 'Welcome back',
    signInDesc: 'Sign in to sync your schedules, notes, and reviews.',
    signIn: 'Sign In',
    createAccount: 'Create account',
    createAccountPrompt: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account? Sign in',
    signUp: 'Sign Up',
    signUpDesc: 'One account for schedules, notes, and weekly reviews.',
    signUpTagline: 'Get started with your email',
    email: 'Email',
    password: 'Password',
    enterEmailAndPassword: 'Please enter email and password.',
    passwordMinLength: 'Use at least 6 characters for password.',
    checkEmailTitle: 'Check your email',
    checkEmailMessage: 'We sent a confirmation link. Sign in after confirming.',
    signUpFailed: 'Sign up failed',
    signInRequiredToAddToCalendar: 'Please sign in to add to calendar.',
  },
  onboarding: {
    slide1Subtitle: 'Inbox',
    slide1Title: 'Dump your thoughts',
    slide1Description: 'Jot down or speak thoughts, to-dos, and ideas as they come.',
    slide2Subtitle: 'Schedule',
    slide2Title: 'AI builds your week',
    slide2Description: 'AI analyzes priorities and creates an optimal weekly plan for you.',
    slide3Subtitle: 'Organize',
    slide3Title: 'Calendar, notes, review',
    slide3Description: 'Manage your calendar, notes, and weekly review in one place.',
    skip: 'Skip',
    next: 'Next',
    start: 'Start',
    previousSlide: 'Previous slide',
    goToSlide: 'Go to slide {n}',
  },
};

const strings: Record<Lang, Strings> = { ko, en };

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko');
  const t = strings[lang];
  const value: I18nContextValue = {
    lang,
    setLang: useCallback((l: Lang) => setLang(l), []),
    t,
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: 'ko', setLang: () => {}, t: ko };
  return ctx;
}
