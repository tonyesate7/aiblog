-- ==================== 스마트 콘텐츠 관리 시스템 ====================
-- Version 3.0: Smart Content Management System

-- 콘텐츠 시리즈 테이블
CREATE TABLE IF NOT EXISTS content_series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'draft')),
  total_planned_articles INTEGER DEFAULT 0,
  current_article_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  tags TEXT, -- JSON array of tags
  target_audience TEXT DEFAULT 'general',
  content_style TEXT DEFAULT 'informative',
  estimated_completion_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  creator_notes TEXT
);

-- 향상된 아티클 테이블 (기존 확장)
CREATE TABLE IF NOT EXISTS articles_enhanced (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keyword TEXT,
  main_keyword TEXT,
  content_style TEXT DEFAULT 'informative',
  target_audience TEXT DEFAULT 'general',
  content_length INTEGER,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  
  -- 시리즈 관리
  series_id TEXT,
  series_order INTEGER,
  
  -- 콘텐츠 분류 및 태그
  category TEXT,
  tags TEXT, -- JSON array
  
  -- 상태 관리
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  scheduled_publish_date DATETIME,
  
  -- SEO 및 메타데이터
  meta_description TEXT,
  seo_score INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  
  -- 성과 데이터
  estimated_views INTEGER DEFAULT 0,
  estimated_engagement REAL DEFAULT 0.0,
  
  -- 이미지 관리
  featured_image_url TEXT,
  image_alt_text TEXT,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  
  -- 관계 설정
  FOREIGN KEY (series_id) REFERENCES content_series(id) ON DELETE SET NULL
);

-- 콘텐츠 성과 추적 테이블
CREATE TABLE IF NOT EXISTS content_analytics (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  
  -- 성과 지표
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  bounce_rate REAL DEFAULT 0.0,
  time_on_page INTEGER DEFAULT 0, -- seconds
  social_shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- SEO 성과
  organic_traffic INTEGER DEFAULT 0,
  keyword_rankings TEXT, -- JSON object
  backlinks_count INTEGER DEFAULT 0,
  
  -- 수익 데이터
  revenue REAL DEFAULT 0.0,
  click_through_rate REAL DEFAULT 0.0,
  conversion_rate REAL DEFAULT 0.0,
  
  -- 측정 날짜
  measurement_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles_enhanced(id) ON DELETE CASCADE,
  UNIQUE(article_id, measurement_date)
);

-- 콘텐츠 계획 및 아이디어 테이블
CREATE TABLE IF NOT EXISTS content_ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT, -- JSON array
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1=highest, 5=lowest
  difficulty INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  estimated_traffic INTEGER DEFAULT 0,
  competition_level TEXT DEFAULT 'medium' CHECK (competition_level IN ('low', 'medium', 'high')),
  
  -- 계획 정보
  target_audience TEXT DEFAULT 'general',
  content_style TEXT DEFAULT 'informative',
  estimated_length INTEGER,
  estimated_hours REAL,
  
  -- 상태
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'researching', 'outlining', 'writing', 'completed', 'cancelled')),
  series_id TEXT,
  planned_publish_date DATE,
  
  -- 연구 데이터
  research_notes TEXT,
  competitor_analysis TEXT,
  trend_score INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (series_id) REFERENCES content_series(id) ON DELETE SET NULL
);

-- 키워드 트렌드 추적 테이블
CREATE TABLE IF NOT EXISTS keyword_trends (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  competition_score REAL DEFAULT 0.0,
  trend_direction TEXT DEFAULT 'stable' CHECK (trend_direction IN ('rising', 'stable', 'declining')),
  seasonal_factor REAL DEFAULT 1.0,
  
  -- 기회 점수
  opportunity_score INTEGER DEFAULT 0,
  difficulty_score INTEGER DEFAULT 0,
  
  -- 추적 날짜
  tracked_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(keyword, tracked_date)
);

-- 콘텐츠 템플릿 테이블
CREATE TABLE IF NOT EXISTS content_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('article', 'series', 'social_post')),
  
  -- 템플릿 구조
  structure TEXT NOT NULL, -- JSON object with sections
  example_content TEXT,
  
  -- 사용 통계
  usage_count INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0.0,
  
  -- 메타데이터
  tags TEXT, -- JSON array
  target_audience TEXT DEFAULT 'general',
  estimated_time_minutes INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성으로 성능 최적화
CREATE INDEX IF NOT EXISTS idx_articles_series ON articles_enhanced(series_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles_enhanced(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles_enhanced(category);
CREATE INDEX IF NOT EXISTS idx_analytics_article ON content_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON content_analytics(measurement_date);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON content_ideas(priority);
CREATE INDEX IF NOT EXISTS idx_keywords_tracked_date ON keyword_trends(tracked_date);
CREATE INDEX IF NOT EXISTS idx_series_status ON content_series(status);

-- 트리거로 자동 업데이트
CREATE TRIGGER IF NOT EXISTS update_series_count
  AFTER INSERT ON articles_enhanced
  WHEN NEW.series_id IS NOT NULL
BEGIN
  UPDATE content_series 
  SET current_article_count = (
    SELECT COUNT(*) FROM articles_enhanced 
    WHERE series_id = NEW.series_id AND status != 'archived'
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.series_id;
END;

CREATE TRIGGER IF NOT EXISTS update_article_timestamp
  AFTER UPDATE ON articles_enhanced
BEGIN
  UPDATE articles_enhanced SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_series_timestamp  
  AFTER UPDATE ON content_series
BEGIN
  UPDATE content_series SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;