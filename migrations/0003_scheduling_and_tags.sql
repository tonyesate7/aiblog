-- ==================== 콘텐츠 예약 발행 + 태그 시스템 확장 ====================
-- Version 3.1: Advanced Scheduling & Tag Management System

-- 콘텐츠 스케줄링 테이블
CREATE TABLE IF NOT EXISTS content_schedule (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  series_id TEXT,
  
  -- 스케줄링 정보
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'Asia/Seoul',
  
  -- 발행 상태
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  publish_attempts INTEGER DEFAULT 0,
  last_attempt_at DATETIME,
  published_at DATETIME,
  
  -- 발행 설정
  auto_publish BOOLEAN DEFAULT true,
  publish_to_platforms TEXT, -- JSON array: ['blog', 'social', 'newsletter']
  
  -- 반복 발행 설정
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date DATE,
  next_occurrence DATETIME,
  
  -- 메타데이터
  created_by TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles_enhanced(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES content_series(id) ON DELETE SET NULL
);

-- 스케줄링 로그 테이블
CREATE TABLE IF NOT EXISTS scheduling_logs (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  
  -- 로그 정보
  event_type TEXT NOT NULL CHECK (event_type IN ('scheduled', 'published', 'failed', 'cancelled', 'rescheduled')),
  event_message TEXT,
  event_details TEXT, -- JSON object
  
  -- 시스템 정보
  system_status TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (schedule_id) REFERENCES content_schedule(id) ON DELETE CASCADE
);

-- 향상된 태그 시스템
CREATE TABLE IF NOT EXISTS content_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  
  -- 태그 정보
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- hex color code
  category TEXT, -- 'topic', 'difficulty', 'format', 'audience'
  
  -- 사용 통계
  usage_count INTEGER DEFAULT 0,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- SEO 정보
  seo_value INTEGER DEFAULT 0, -- SEO 가치 점수 (1-100)
  trend_score INTEGER DEFAULT 0, -- 트렌드 점수 (1-100)
  
  -- 자동 태깅
  is_auto_generated BOOLEAN DEFAULT false,
  auto_tag_confidence REAL DEFAULT 0.0, -- 자동 태깅 신뢰도 (0.0-1.0)
  
  -- 메타데이터
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 콘텐츠-태그 연결 테이블
CREATE TABLE IF NOT EXISTS content_tag_relations (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  
  -- 연결 정보
  relevance_score REAL DEFAULT 1.0, -- 연관성 점수 (0.0-1.0)
  is_primary BOOLEAN DEFAULT false, -- 주요 태그 여부
  added_method TEXT DEFAULT 'manual' CHECK (added_method IN ('manual', 'auto', 'suggested')),
  
  -- 메타데이터
  added_by TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles_enhanced(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES content_tags(id) ON DELETE CASCADE,
  UNIQUE(article_id, tag_id)
);

-- 태그 카테고리 테이블
CREATE TABLE IF NOT EXISTS tag_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  sort_order INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 콘텐츠 발행 히스토리
CREATE TABLE IF NOT EXISTS publishing_history (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  
  -- 발행 정보
  platform TEXT NOT NULL, -- 'blog', 'social', 'newsletter'
  platform_id TEXT, -- 외부 플랫폼의 게시물 ID
  publish_date DATETIME NOT NULL,
  
  -- 성과 데이터
  initial_views INTEGER DEFAULT 0,
  peak_views INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  
  -- 발행 상태
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'updated', 'deleted')),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles_enhanced(id) ON DELETE CASCADE
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_schedule_date ON content_schedule(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_schedule_status ON content_schedule(status);
CREATE INDEX IF NOT EXISTS idx_schedule_article ON content_schedule(article_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON content_tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON content_tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON content_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tag_relations_article ON content_tag_relations(article_id);
CREATE INDEX IF NOT EXISTS idx_tag_relations_tag ON content_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_publishing_platform ON publishing_history(platform, publish_date);

-- 기본 태그 카테고리 삽입
INSERT OR IGNORE INTO tag_categories (id, name, description, color, sort_order) VALUES 
  ('cat_topic', '주제', '콘텐츠의 주제/분야', '#3B82F6', 1),
  ('cat_difficulty', '난이도', '콘텐츠의 난이도 레벨', '#EF4444', 2),
  ('cat_format', '형식', '콘텐츠의 형식/스타일', '#10B981', 3),
  ('cat_audience', '대상', '타겟 독자층', '#F59E0B', 4),
  ('cat_season', '시즌', '계절성/트렌드', '#8B5CF6', 5);

-- 기본 태그 삽입
INSERT OR IGNORE INTO content_tags (id, name, slug, category, color, seo_value, trend_score) VALUES 
  -- 주제 태그
  ('tag_tech', '기술', 'tech', 'topic', '#3B82F6', 85, 90),
  ('tag_programming', '프로그래밍', 'programming', 'topic', '#1E40AF', 90, 85),
  ('tag_web_dev', '웹개발', 'web-dev', 'topic', '#2563EB', 88, 87),
  ('tag_ai', 'AI', 'ai', 'topic', '#6366F1', 95, 95),
  ('tag_business', '비즈니스', 'business', 'topic', '#059669', 80, 75),
  ('tag_marketing', '마케팅', 'marketing', 'topic', '#0D9488', 82, 78),
  ('tag_design', '디자인', 'design', 'topic', '#7C3AED', 75, 80),
  ('tag_productivity', '생산성', 'productivity', 'topic', '#DC2626', 70, 85),
  
  -- 난이도 태그
  ('tag_beginner', '초보자', 'beginner', 'difficulty', '#22C55E', 85, 90),
  ('tag_intermediate', '중급자', 'intermediate', 'difficulty', '#F59E0B', 75, 70),
  ('tag_advanced', '고급자', 'advanced', 'difficulty', '#EF4444', 65, 60),
  
  -- 형식 태그
  ('tag_tutorial', '튜토리얼', 'tutorial', 'format', '#06B6D4', 90, 85),
  ('tag_guide', '가이드', 'guide', 'format', '#0EA5E9', 85, 80),
  ('tag_review', '리뷰', 'review', 'format', '#8B5CF6', 70, 75),
  ('tag_tips', '팁', 'tips', 'format', '#F97316', 80, 85),
  ('tag_news', '뉴스', 'news', 'format', '#EF4444', 60, 90);

-- 트리거: 태그 사용 횟수 자동 업데이트
CREATE TRIGGER IF NOT EXISTS update_tag_usage_count
  AFTER INSERT ON content_tag_relations
BEGIN
  UPDATE content_tags 
  SET usage_count = usage_count + 1,
      last_used_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.tag_id;
END;

-- 트리거: 스케줄 상태 변경 로그
CREATE TRIGGER IF NOT EXISTS log_schedule_status_change
  AFTER UPDATE ON content_schedule
  WHEN OLD.status != NEW.status
BEGIN
  INSERT INTO scheduling_logs (id, schedule_id, event_type, event_message, created_at)
  VALUES (
    'log_' || datetime('now') || '_' || substr(lower(hex(randomblob(4))), 1, 8),
    NEW.id,
    NEW.status,
    'Status changed from ' || OLD.status || ' to ' || NEW.status,
    CURRENT_TIMESTAMP
  );
END;

-- 트리거: 예약 발행 시간 업데이트
CREATE TRIGGER IF NOT EXISTS update_schedule_timestamp
  AFTER UPDATE ON content_schedule
BEGIN
  UPDATE content_schedule SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;