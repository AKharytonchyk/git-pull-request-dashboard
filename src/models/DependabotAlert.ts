export interface DependabotAlert {
  number: number;
  state: 'auto_dismissed' | 'dismissed' | 'fixed' | 'open';
  dependency: {
    package: {
      ecosystem: string;
      name: string;
    };
    manifest_path: string;
    scope: 'development' | 'runtime';
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string | null;
    summary: string;
    description: string;
    vulnerabilities: Vulnerability[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    cvss: {
      vector_string: string;
      score: number;
    };
    cvss_severities: {
      cvss_v3?: {
        vector_string: string;
        score: number;
      };
      cvss_v4?: {
        vector_string: string;
        score: number;
      };
    };
    epss?: Array<{
      percentage: number;
      percentile: string;
    }>;
    cwes: Array<{
      cwe_id: string;
      name: string;
    }>;
    identifiers: Array<{
      type: string;
      value: string;
    }>;
    references: Array<{
      url: string;
    }>;
    published_at: string;
    updated_at: string;
    withdrawn_at: string | null;
  };
  security_vulnerability: {
    package: {
      ecosystem: string;
      name: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    vulnerable_version_range: string;
    first_patched_version: {
      identifier: string;
    } | null;
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  dismissed_at: string | null;
  dismissed_by: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    type: string;
  } | null;
  dismissed_reason: 'fix_started' | 'inaccurate' | 'no_bandwidth' | 'not_used' | 'tolerable_risk' | null;
  dismissed_comment: string | null;
  fixed_at: string | null;
  repository?: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    private: boolean;
    owner: {
      login: string;
      id: number;
      avatar_url: string;
      html_url: string;
      type: string;
    };
  };
}

export interface Vulnerability {
  package: {
    ecosystem: string;
    name: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  vulnerable_version_range: string;
  first_patched_version: {
    identifier: string;
  } | null;
}

export interface DependabotAlertSummary {
  total: number;
  open: number;
  dismissed: number;
  fixed: number;
  auto_dismissed: number;
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_ecosystem: Record<string, number>;
}

export interface DependabotAlertsOptions {
  state?: 'auto_dismissed' | 'dismissed' | 'fixed' | 'open';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ecosystem?: 'composer' | 'go' | 'maven' | 'npm' | 'nuget' | 'pip' | 'pub' | 'rubygems' | 'rust';
  package?: string;
  manifest?: string;
  scope?: 'development' | 'runtime';
  sort?: 'created' | 'updated' | 'epss_percentage';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}
