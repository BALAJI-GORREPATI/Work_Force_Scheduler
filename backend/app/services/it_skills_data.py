"""
Curated IT Skills Taxonomy and Master Data
Strictly restricted to IT industry domains.
7 Categories, 60 distinct skills with deterministic IDs (SKILL-001 to SKILL-060).
"""

from typing import List, Dict, Any

IT_SKILLS_CATALOGUE: List[Dict[str, str]] = [
    # Category 1: Software Engineering (SKILL-001 to SKILL-012)
    {"skill_id": "SKILL-001", "name": "Python", "category": "Software Engineering", "desc": "Advanced Python programming, asynchronous execution, and backend architecture"},
    {"skill_id": "SKILL-002", "name": "Java", "category": "Software Engineering", "desc": "Enterprise Java, Spring Boot, JVM performance tuning"},
    {"skill_id": "SKILL-003", "name": "JavaScript", "category": "Software Engineering", "desc": "Modern ECMAScript, event-driven web programming, Node.js"},
    {"skill_id": "SKILL-004", "name": "TypeScript", "category": "Software Engineering", "desc": "Static typing, advanced interfaces, large-scale application design"},
    {"skill_id": "SKILL-005", "name": "Go", "category": "Software Engineering", "desc": "Golang systems programming, concurrency, microservices"},
    {"skill_id": "SKILL-006", "name": "C#", "category": "Software Engineering", "desc": ".NET Core ecosystem, ASP.NET Web API, enterprise services"},
    {"skill_id": "SKILL-007", "name": "C++", "category": "Software Engineering", "desc": "High-performance systems programming, memory safety, algorithms"},
    {"skill_id": "SKILL-008", "name": "Rust", "category": "Software Engineering", "desc": "Memory-safe systems programming, concurrency, low-level tooling"},
    {"skill_id": "SKILL-009", "name": "Backend Development", "category": "Software Engineering", "desc": "Server-side business logic, transaction handling, caching layers"},
    {"skill_id": "SKILL-010", "name": "Frontend Development", "category": "Software Engineering", "desc": "React, modern UI frameworks, responsive design, state management"},
    {"skill_id": "SKILL-011", "name": "REST APIs", "category": "Software Engineering", "desc": "OpenAPI/Swagger, RESTful API design, HTTP status patterns"},
    {"skill_id": "SKILL-012", "name": "Microservices", "category": "Software Engineering", "desc": "Service mesh, domain-driven design, gRPC, distributed workflows"},

    # Category 2: Data Engineering & Analytics (SKILL-013 to SKILL-021)
    {"skill_id": "SKILL-013", "name": "Pandas", "category": "Data Engineering & Analytics", "desc": "Tabular data manipulation, aggregation, feature engineering in Python"},
    {"skill_id": "SKILL-014", "name": "NumPy", "category": "Data Engineering & Analytics", "desc": "Multidimensional array computation, numerical operations"},
    {"skill_id": "SKILL-015", "name": "Data Analysis", "category": "Data Engineering & Analytics", "desc": "Exploratory data analysis, hypothesis testing, metric tracking"},
    {"skill_id": "SKILL-016", "name": "ETL Pipelines", "category": "Data Engineering & Analytics", "desc": "Extract-Transform-Load pipeline orchestration, batch & streaming"},
    {"skill_id": "SKILL-017", "name": "Data Warehousing", "category": "Data Engineering & Analytics", "desc": "Star schema, dimensional modeling, Snowflake, BigQuery"},
    {"skill_id": "SKILL-018", "name": "SQL Optimization", "category": "Data Engineering & Analytics", "desc": "Query execution plan analysis, index tuning, query rewrites"},
    {"skill_id": "SKILL-019", "name": "Apache Spark", "category": "Data Engineering & Analytics", "desc": "Distributed dataset processing, PySpark, cluster compute tuning"},
    {"skill_id": "SKILL-020", "name": "Tableau", "category": "Data Engineering & Analytics", "desc": "Enterprise analytics dashboards, data storytelling, KPI boards"},
    {"skill_id": "SKILL-021", "name": "Power BI", "category": "Data Engineering & Analytics", "desc": "DAX queries, data modeling, business intelligence reports"},

    # Category 3: AI & Machine Learning (SKILL-022 to SKILL-029)
    {"skill_id": "SKILL-022", "name": "Machine Learning", "category": "AI & Machine Learning", "desc": "Supervised, unsupervised learning, model lifecycle management"},
    {"skill_id": "SKILL-023", "name": "Deep Learning", "category": "AI & Machine Learning", "desc": "Neural networks, CNNs, RNNs, transformer architectures"},
    {"skill_id": "SKILL-024", "name": "Natural Language Processing", "category": "AI & Machine Learning", "desc": "Tokenization, embeddings, text classification, LLM prompt engineering"},
    {"skill_id": "SKILL-025", "name": "Computer Vision", "category": "AI & Machine Learning", "desc": "Image recognition, object detection, OpenCV, vision models"},
    {"skill_id": "SKILL-026", "name": "Scikit-learn", "category": "AI & Machine Learning", "desc": "Classical ML modeling, cross-validation, hyperparameter tuning"},
    {"skill_id": "SKILL-027", "name": "TensorFlow", "category": "AI & Machine Learning", "desc": "Model training, graph execution, Keras APIs"},
    {"skill_id": "SKILL-028", "name": "PyTorch", "category": "AI & Machine Learning", "desc": "Dynamic computational graphs, tensor calculus, GPU training"},
    {"skill_id": "SKILL-029", "name": "MLOps", "category": "AI & Machine Learning", "desc": "Model registries, MLflow, model monitoring, automated retraining"},

    # Category 4: Cloud & DevOps (SKILL-030 to SKILL-038)
    {"skill_id": "SKILL-030", "name": "AWS", "category": "Cloud & DevOps", "desc": "Amazon Web Services (EC2, S3, RDS, Lambda, IAM, ECS)"},
    {"skill_id": "SKILL-031", "name": "Azure", "category": "Cloud & DevOps", "desc": "Microsoft Azure cloud services, Azure DevOps, AKS"},
    {"skill_id": "SKILL-032", "name": "Google Cloud", "category": "Cloud & DevOps", "desc": "GCP (Compute Engine, GKE, BigQuery, Cloud Run)"},
    {"skill_id": "SKILL-033", "name": "Docker", "category": "Cloud & DevOps", "desc": "Containerization, Dockerfile optimization, multi-stage builds"},
    {"skill_id": "SKILL-034", "name": "Kubernetes", "category": "Cloud & DevOps", "desc": "Container orchestration, Helm charts, ingress, auto-scaling"},
    {"skill_id": "SKILL-035", "name": "CI/CD", "category": "Cloud & DevOps", "desc": "Automated build, test, and release pipelines (GitHub Actions, GitLab)"},
    {"skill_id": "SKILL-036", "name": "Terraform", "category": "Cloud & DevOps", "desc": "Infrastructure as Code, state management, multi-cloud modules"},
    {"skill_id": "SKILL-037", "name": "Linux", "category": "Cloud & DevOps", "desc": "Linux system administration, bash scripting, kernel tuning, networking"},
    {"skill_id": "SKILL-038", "name": "Cloud Monitoring", "category": "Cloud & DevOps", "desc": "Prometheus, Grafana, Datadog, alert management, telemetry"},

    # Category 5: Cybersecurity & Networking (SKILL-039 to SKILL-046)
    {"skill_id": "SKILL-039", "name": "Application Security", "category": "Cybersecurity & Networking", "desc": "OWASP Top 10 remediation, SAST/DAST tooling, secure coding"},
    {"skill_id": "SKILL-040", "name": "Network Security", "category": "Cybersecurity & Networking", "desc": "Firewalls, VPNs, IDS/IPS, zero-trust network architectures"},
    {"skill_id": "SKILL-041", "name": "Vulnerability Assessment", "category": "Cybersecurity & Networking", "desc": "Nessus, CVE analysis, automated vulnerability scanning"},
    {"skill_id": "SKILL-042", "name": "IAM", "category": "Cybersecurity & Networking", "desc": "Identity and Access Management, SSO, SAML, OAuth2, RBAC/ABAC"},
    {"skill_id": "SKILL-043", "name": "Security Monitoring", "category": "Cybersecurity & Networking", "desc": "SIEM, Splunk, SOC alerts, threat hunting, anomaly detection"},
    {"skill_id": "SKILL-044", "name": "TCP/IP", "category": "Cybersecurity & Networking", "desc": "OSI model, routing protocols, subnetting, Wireshark packet analysis"},
    {"skill_id": "SKILL-045", "name": "DNS", "category": "Cybersecurity & Networking", "desc": "Domain name resolution, BIND, DNSSEC, Route53"},
    {"skill_id": "SKILL-046", "name": "Network Troubleshooting", "category": "Cybersecurity & Networking", "desc": "Latency debugging, packet loss investigation, traceroute, tcpdump"},

    # Category 6: Software Quality Assurance (SKILL-047 to SKILL-053)
    {"skill_id": "SKILL-047", "name": "Manual Testing", "category": "Software Quality Assurance", "desc": "Test plan authoring, exploratory testing, bug lifecycle reporting"},
    {"skill_id": "SKILL-048", "name": "Automated Testing", "category": "Software Quality Assurance", "desc": "Test automation frameworks, regression testing suites"},
    {"skill_id": "SKILL-049", "name": "API Testing", "category": "Software Quality Assurance", "desc": "Postman, Newman, REST API contract verification"},
    {"skill_id": "SKILL-050", "name": "Selenium", "category": "Software Quality Assurance", "desc": "Browser automation, WebDriver, cross-browser test suites"},
    {"skill_id": "SKILL-051", "name": "Playwright", "category": "Software Quality Assurance", "desc": "Modern end-to-end testing, headless browser automation"},
    {"skill_id": "SKILL-052", "name": "Pytest", "category": "Software Quality Assurance", "desc": "Python test fixtures, parameterized testing, coverage analysis"},
    {"skill_id": "SKILL-053", "name": "Performance Testing", "category": "Software Quality Assurance", "desc": "JMeter, k6, stress testing, throughput and latency benchmarking"},

    # Category 7: Databases & Operations (SKILL-054 to SKILL-060)
    {"skill_id": "SKILL-054", "name": "PostgreSQL", "category": "Databases & Operations", "desc": "Relational schema design, ACID transactions, PL/pgSQL, extensions"},
    {"skill_id": "SKILL-055", "name": "MySQL", "category": "Databases & Operations", "desc": "InnoDB engine, replication, replication topology, query caching"},
    {"skill_id": "SKILL-056", "name": "MongoDB", "category": "Databases & Operations", "desc": "Document data store, aggregation framework, sharding, replica sets"},
    {"skill_id": "SKILL-057", "name": "Redis", "category": "Databases & Operations", "desc": "In-memory caching, pub/sub messaging, sorted sets, Redis cluster"},
    {"skill_id": "SKILL-058", "name": "Database Design", "category": "Databases & Operations", "desc": "Relational normalization, ER modeling, constraint enforcement"},
    {"skill_id": "SKILL-059", "name": "Incident Management", "category": "Databases & Operations", "desc": "PagerDuty on-call, root cause analysis (RCA), blameless postmortems"},
    {"skill_id": "SKILL-060", "name": "IT Operations", "category": "Databases & Operations", "desc": "ITIL service management, infrastructure maintenance, system patching"}
]

# Standard IT Job Roles mapped to relevant skill clusters
IT_JOB_ROLES: List[Dict[str, Any]] = [
    {"role": "Senior Backend Engineer", "skills": ["Python", "Go", "Backend Development", "REST APIs", "PostgreSQL", "Docker", "Microservices"]},
    {"role": "Frontend Engineer", "skills": ["TypeScript", "JavaScript", "Frontend Development", "REST APIs", "Playwright"]},
    {"role": "Full-Stack Engineer", "skills": ["TypeScript", "Python", "Frontend Development", "Backend Development", "PostgreSQL", "Docker"]},
    {"role": "Cloud DevOps Specialist", "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Cloud Monitoring"]},
    {"role": "Site Reliability Engineer (SRE)", "skills": ["Linux", "Kubernetes", "Prometheus", "Cloud Monitoring", "Incident Management", "Python", "Go"]},
    {"role": "Data Engineer", "skills": ["SQL Optimization", "ETL Pipelines", "Pandas", "Apache Spark", "Data Warehousing", "Python", "PostgreSQL"]},
    {"role": "Machine Learning Engineer", "skills": ["Python", "Machine Learning", "PyTorch", "TensorFlow", "MLOps", "NumPy", "Pandas"]},
    {"role": "Cybersecurity Analyst", "skills": ["Application Security", "Network Security", "Vulnerability Assessment", "Security Monitoring", "IAM"]},
    {"role": "QA Automation Engineer", "skills": ["Automated Testing", "Playwright", "Selenium", "API Testing", "Pytest", "Manual Testing"]},
    {"role": "Database Administrator (DBA)", "skills": ["PostgreSQL", "MySQL", "Database Design", "SQL Optimization", "Redis", "Incident Management"]},
    {"role": "Network Operations Engineer", "skills": ["TCP/IP", "DNS", "Network Troubleshooting", "Network Security", "Linux", "IT Operations"]},
    {"role": "IT Systems Administrator", "skills": ["Linux", "IT Operations", "IAM", "Incident Management", "Cloud Monitoring", "Docker"]}
]
