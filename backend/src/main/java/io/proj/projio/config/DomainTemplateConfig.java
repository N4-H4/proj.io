package io.proj.projio.config;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Single source of truth for domain-specific workflow blueprints.
 *
 * <p>Each entry maps a {@code Project.domain} string to an ordered list of
 * {@link PhaseTemplate} value objects. A {@code PhaseTemplate} carries not just a
 * phase name but also semantic context ({@code guidance}, {@code expectedOutcome})
 * that today populates {@code WorkflowPhase.description} and tomorrow can feed
 * AI task-generation features.
 *
 * <h3>Ordering guarantee</h3>
 * The outer map is a {@link LinkedHashMap} wrapped as unmodifiable — insertion order
 * is therefore deterministic and independent of JVM hash-bucketing (unlike
 * {@code Map.of(...)}). Each inner {@code List} preserves the explicit {@code order}
 * field on every {@link PhaseTemplate}.
 *
 * <h3>Fallback policy</h3>
 * Unknown or unrecognised domains fall back to the {@code "OTHER"} template via
 * {@link #getTemplates(String)}. This is the <em>only</em> place that fallback
 * logic lives — {@link io.proj.projio.service.TemplateService} delegates here entirely.
 *
 * <h3>Extension guide</h3>
 * To add a new domain: add a new {@code List.of(PhaseTemplate...)} entry to
 * {@code DOMAIN_TEMPLATES} below, then add the matching enum constant if one exists.
 * No other files need changing.
 */
public final class DomainTemplateConfig {

    // ── Master blueprint registry ─────────────────────────────────────────────

    public static final Map<String, List<PhaseTemplate>> DOMAIN_TEMPLATES;

    static {
        Map<String, List<PhaseTemplate>> map = new LinkedHashMap<>();

        // ── WEB_DEVELOPMENT ──────────────────────────────────────────────────
        // Browser-product delivery: discovery → design → client build → server wiring → QA → live.
        map.put("WEB_DEVELOPMENT", List.of(
                new PhaseTemplate(
                        0,
                        "Product Discovery & Scoping",
                        "Define the user problem, establish project scope, and agree on measurable success criteria before any design or code begins.",
                        "A signed-off scope document and prioritised feature list agreed upon by all stakeholders.",
                        "Conduct stakeholder interviews\nDocument user personas and pain points\nDefine measurable success criteria\nPrioritise feature list (MoSCoW or equivalent)\nGet written sign-off on scope",
                        List.of(
                                "Conduct stakeholder interviews",
                                "Document user personas and pain points",
                                "Define measurable success criteria",
                                "Prioritise feature list (MoSCoW)",
                                "Get written sign-off on scope"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "UI/UX Design & Prototyping",
                        "Create wireframes, establish the design system and component library, and produce a clickable high-fidelity prototype for stakeholder validation.",
                        "An approved hi-fi prototype with a documented design system, ready for developer hand-off.",
                        "Produce low-fidelity wireframes for all core screens\nDefine design tokens (colours, typography, spacing)\nBuild component library\nCreate high-fidelity prototype\nConduct usability review and get stakeholder approval",
                        List.of(
                                "Produce low-fidelity wireframes for all core screens",
                                "Define design tokens (colours, typography, spacing)",
                                "Build component library",
                                "Create high-fidelity prototype",
                                "Conduct usability review and get stakeholder approval"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "Frontend Development",
                        "Build a responsive, accessible, and component-driven UI that faithfully implements the approved designs across target browsers and viewports.",
                        "A pixel-accurate, fully interactive frontend that passes accessibility checks and matches the approved designs.",
                        "Scaffold project structure and routing\nImplement all UI components from design system\nEnsure responsive layout across breakpoints\nPass WCAG 2.1 AA accessibility checks\nConnect to API mock or live endpoints",
                        List.of(
                                "Scaffold project structure and routing",
                                "Implement UI components from design system",
                                "Ensure responsive layout across breakpoints",
                                "Pass WCAG 2.1 AA accessibility checks",
                                "Connect to API mock or live endpoints"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Backend & API Integration",
                        "Connect the frontend to backend APIs, implement authentication flows, handle async data loading, and wire up all client-server interactions.",
                        "A fully integrated application with working data round-trips, auth, and error handling across all user flows.",
                        "Integrate authentication and session management\nWire all data-fetching calls to live API\nHandle loading, error, and empty states in the UI\nValidate end-to-end data round-trips\nTest edge cases and API failure scenarios",
                        List.of(
                                "Integrate authentication and session management",
                                "Wire all data-fetching calls to live API",
                                "Handle loading, error, and empty states",
                                "Validate end-to-end data round-trips",
                                "Test API failure and edge-case scenarios"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "QA & Cross-Browser Testing",
                        "Execute functional, regression, accessibility, and cross-browser/device test passes. Triage and resolve defects before release.",
                        "Zero P0 bugs outstanding; all acceptance criteria verified across the target device and browser matrix.",
                        "Execute functional test suite against all user flows\nRun regression tests after each bug fix\nTest on target browser and device matrix\nConduct accessibility audit (axe or Lighthouse)\nTriage and resolve all P0 and P1 defects",
                        List.of(
                                "Execute functional test suite against all user flows",
                                "Run regression tests after each bug fix",
                                "Test on target browser and device matrix",
                                "Conduct accessibility audit (axe or Lighthouse)",
                                "Triage and resolve all P0 and P1 defects"
                        )
                ),
                new PhaseTemplate(
                        5,
                        "Production Deployment & Handover",
                        "Deploy the application to CDN/hosting, configure DNS and TLS, run smoke tests in production, and establish monitoring and alerting.",
                        "A live, publicly accessible URL with uptime monitoring, error alerting, and a documented runbook in place.",
                        "Configure production hosting and CDN\nSet up DNS records and TLS certificate\nRun smoke tests against production environment\nEnable uptime and error-rate monitoring\nDocument runbook and hand over to operations team",
                        List.of(
                                "Configure production hosting and CDN",
                                "Set up DNS records and TLS certificate",
                                "Run smoke tests against production environment",
                                "Enable uptime and error-rate monitoring",
                                "Document runbook and hand over to operations team"
                        )
                )
        ));

        // ── APP_DEVELOPMENT ──────────────────────────────────────────────────
        // Mobile-first: platform constraints, store rules, and device fragmentation shape every phase.
        map.put("APP_DEVELOPMENT", List.of(
                new PhaseTemplate(
                        0,
                        "Product & Platform Definition",
                        "Define the target platform(s) (iOS, Android, cross-platform), user personas, core UX flows, and platform-specific constraints before design begins.",
                        "A platform decision document, user stories, and a prioritised backlog that accounts for OS-specific guidelines.",
                        "Choose target platform(s) and justify decision\nDocument user personas and core UX flows\nIdentify platform-specific constraints and guidelines\nPrioritise feature backlog\nGet stakeholder sign-off on scope",
                        List.of(
                                "Choose target platform(s) and justify decision",
                                "Document user personas and core UX flows",
                                "Identify platform-specific constraints and guidelines",
                                "Prioritise feature backlog",
                                "Get stakeholder sign-off on scope"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "UI/UX Design & Prototyping",
                        "Design mobile-first interfaces that respect platform conventions (Apple HIG for iOS, Material Design for Android). Prototype key navigation flows.",
                        "An approved interactive prototype covering all core flows, with a component library aligned to the target platform's design language.",
                        "Design wireframes for all primary screens\nAlign component library with platform design language\nPrototype all core navigation flows\nConduct usability review on prototype\nObtain stakeholder approval before development",
                        List.of(
                                "Design wireframes for all primary screens",
                                "Align component library with platform design language",
                                "Prototype all core navigation flows",
                                "Conduct usability review on prototype",
                                "Obtain stakeholder approval before development"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "Architecture & State Management",
                        "Define the app's component hierarchy, choose a state management approach, plan navigation structure, and establish an offline/sync strategy.",
                        "An Architecture Decision Record (ADR) committed to the repo that the entire team aligns on before feature development starts.",
                        "Choose and document state management approach\nDefine navigation structure and deep-link strategy\nPlan offline storage and sync strategy\nDocument component hierarchy\nCommit Architecture Decision Record to repository",
                        List.of(
                                "Choose and document state management approach",
                                "Define navigation structure and deep-link strategy",
                                "Plan offline storage and sync strategy",
                                "Document component hierarchy",
                                "Commit Architecture Decision Record to repository"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Feature Development",
                        "Build all screens, implement business logic, integrate local storage, consume backend APIs, and write unit tests per feature.",
                        "All user stories implemented, code-reviewed, and passing unit tests, ready for device QA.",
                        "Implement all screens per approved designs\nWrite business logic with unit test coverage\nIntegrate local storage (caching, offline support)\nConsume all required backend API endpoints\nComplete code review for every feature branch",
                        List.of(
                                "Implement all screens per approved designs",
                                "Write business logic with unit test coverage",
                                "Integrate local storage (caching, offline support)",
                                "Consume all required backend API endpoints",
                                "Complete code review for every feature branch"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "Device Testing & QA",
                        "Test on a matrix of real devices across OS versions. Address crashes, layout regressions, permission edge cases, and performance bottlenecks.",
                        "A stable release candidate passing on the defined device matrix, with no P0/P1 crashes or regressions.",
                        "Test on defined device and OS version matrix\nVerify permission flows (camera, location, notifications)\nProfile and resolve performance bottlenecks\nFix all P0 and P1 crashes and regressions\nConduct accessibility audit on all screens",
                        List.of(
                                "Test on defined device and OS version matrix",
                                "Verify permission flows (camera, location, notifications)",
                                "Profile and resolve performance bottlenecks",
                                "Fix all P0 and P1 crashes and regressions",
                                "Conduct accessibility audit on all screens"
                        )
                ),
                new PhaseTemplate(
                        5,
                        "Store Submission & Release",
                        "Prepare store metadata, screenshots, and privacy disclosures. Submit for review, respond to reviewer feedback, and execute a staged rollout.",
                        "The app live on the target app store(s) with a confirmed staged rollout and crash-rate monitoring active.",
                        "Prepare app store listing (metadata, screenshots, description)\nComplete privacy disclosure and data-use questionnaire\nSubmit binary for store review\nAddress any reviewer rejection feedback\nExecute staged rollout and monitor crash rate",
                        List.of(
                                "Prepare app store listing (metadata, screenshots, description)",
                                "Complete privacy disclosure and data-use questionnaire",
                                "Submit binary for store review",
                                "Address any reviewer rejection feedback",
                                "Execute staged rollout and monitor crash rate"
                        )
                )
        ));

        // ── BACKEND ──────────────────────────────────────────────────────────
        // API-contract-first discipline: schema and contract are defined before a line of impl code.
        map.put("BACKEND", List.of(
                new PhaseTemplate(
                        0,
                        "Requirements & Domain Modelling",
                        "Identify bounded contexts, core entities, business rules, non-functional requirements (latency, throughput, availability SLAs), and integration points.",
                        "A domain model diagram and a documented list of functional and non-functional requirements signed off by stakeholders.",
                        "Identify all bounded contexts and core entities\nDocument business rules and invariants\nCapture non-functional requirements (latency, SLA, throughput)\nMap integration points and external dependencies\nGet stakeholder sign-off on domain model",
                        List.of(
                                "Identify all bounded contexts and core entities",
                                "Document business rules and invariants",
                                "Capture non-functional requirements (latency, SLA, throughput)",
                                "Map integration points and external dependencies",
                                "Get stakeholder sign-off on domain model"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "API Contract Design",
                        "Define REST or gRPC contracts, establish error codes and response shapes, decide on versioning strategy, and design the authentication and authorisation model.",
                        "A reviewed and signed-off OpenAPI spec or proto file that frontend/consumer teams can begin working against immediately.",
                        "Define all resource endpoints and HTTP methods\nSpecify request/response schemas and error codes\nDocument authentication and authorisation model\nDecide and document API versioning strategy\nGet contract reviewed and signed off by consuming teams",
                        List.of(
                                "Define all resource endpoints and HTTP methods",
                                "Specify request/response schemas and error codes",
                                "Document authentication and authorisation model",
                                "Decide and document API versioning strategy",
                                "Get contract reviewed and signed off by consuming teams"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "Data Modelling & Migrations",
                        "Design a normalised database schema with appropriate indexes and constraints. Write and test versioned migration scripts. Document data access patterns.",
                        "A reviewed ERD and a suite of tested, idempotent migration scripts ready to run against staging and production.",
                        "Identify entities and define relationships\nDesign normalised schema with appropriate indexes\nAdd constraints (PK, FK, unique, not-null)\nWrite versioned, idempotent migration scripts\nValidate schema against documented data access patterns",
                        List.of(
                                "Identify entities and define relationships",
                                "Design normalised schema with appropriate indexes",
                                "Add constraints (PK, FK, unique, not-null)",
                                "Write versioned, idempotent migration scripts",
                                "Validate schema against data access patterns"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Core Implementation",
                        "Implement services, repositories, and business logic strictly against the agreed API contract. Maintain separation of concerns and write integration tests per endpoint.",
                        "All contracted endpoints implemented, documented, and passing integration tests with meaningful coverage of happy paths and error cases.",
                        "Implement all contracted API endpoints\nWrite service and repository layer with separation of concerns\nCover happy path and error cases with integration tests\nEnsure request validation and consistent error responses\nComplete code review for all service modules",
                        List.of(
                                "Implement all contracted API endpoints",
                                "Write service and repository layer",
                                "Cover happy path and error cases with integration tests",
                                "Ensure request validation and consistent error responses",
                                "Complete code review for all service modules"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "Security, Performance & Testing",
                        "Conduct auth/authz hardening, input validation, rate limiting, and load testing. Cover edge cases, concurrency scenarios, and failure modes.",
                        "Security audit passed with no critical findings; P95 response latency meets the documented SLA under simulated peak load.",
                        "Harden authentication and authorisation checks\nValidate and sanitise all user inputs\nImplement rate limiting and throttling\nRun load test and verify P95 latency against SLA\nAddress all critical and high security findings",
                        List.of(
                                "Harden authentication and authorisation checks",
                                "Validate and sanitise all user inputs",
                                "Implement rate limiting and throttling",
                                "Run load test and verify P95 latency against SLA",
                                "Address all critical and high security findings"
                        )
                ),
                new PhaseTemplate(
                        5,
                        "Deployment & Observability",
                        "Set up CI/CD pipelines, containerisation, infrastructure-as-code, structured logging, distributed tracing, and alerting dashboards.",
                        "Zero-downtime deployment to production with live dashboards, alerting thresholds configured, and a validated rollback procedure.",
                        "Containerise application and write infrastructure-as-code\nConfigure CI/CD pipeline with automated tests\nEnable structured logging and distributed tracing\nSet up alerting dashboards with defined thresholds\nValidate zero-downtime deployment and rollback procedure",
                        List.of(
                                "Containerise application and write infrastructure-as-code",
                                "Configure CI/CD pipeline with automated tests",
                                "Enable structured logging and distributed tracing",
                                "Set up alerting dashboards with defined thresholds",
                                "Validate zero-downtime deployment and rollback procedure"
                        )
                )
        ));

        // ── FULL_STACK ────────────────────────────────────────────────────────
        // Coordination-aware: API contract locks before parallel frontend/backend streams begin.
        map.put("FULL_STACK", List.of(
                new PhaseTemplate(
                        0,
                        "Product Definition & System Design",
                        "Agree on the full system architecture, tech stack choices, team responsibilities, and integration boundaries before any parallel work begins.",
                        "An architecture document with ADRs, a team responsibility matrix, and a sprint-ready backlog covering both frontend and backend work.",
                        "Agree on system architecture and tech stack\nDocument Architecture Decision Records (ADRs)\nDefine team responsibility matrix (frontend vs backend)\nEstablish integration boundaries and API strategy\nProduce sprint-ready backlog for both streams",
                        List.of(
                                "Agree on system architecture and tech stack",
                                "Document Architecture Decision Records (ADRs)",
                                "Define team responsibility matrix",
                                "Establish integration boundaries and API strategy",
                                "Produce sprint-ready backlog for both streams"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "UI/UX Design",
                        "Design end-to-end user flows covering all surfaces. Produce a component inventory that can inform both the frontend implementation and the API shape.",
                        "Approved designs with a documented component inventory and annotated interaction states that serve as the source of truth for both streams.",
                        "Map all end-to-end user flows\nProduce wireframes and high-fidelity screens\nDocument component inventory with interaction states\nAnnotate designs with API data requirements\nObtain stakeholder approval for all surfaces",
                        List.of(
                                "Map all end-to-end user flows",
                                "Produce wireframes and high-fidelity screens",
                                "Document component inventory with interaction states",
                                "Annotate designs with API data requirements",
                                "Obtain stakeholder approval for all surfaces"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "API Contract & Data Modelling",
                        "Lock the shared API surface (OpenAPI spec) and database schema before parallel development streams begin. This is the coordination gate for the entire project.",
                        "A frozen OpenAPI spec and reviewed ERD that both the frontend (via mocks) and backend (via implementation) can work against independently.",
                        "Define all API endpoints and request/response schemas\nReview and freeze the OpenAPI specification\nDesign and review the database ERD\nSet up API mocks for frontend development\nGet cross-team sign-off before parallel streams begin",
                        List.of(
                                "Define all API endpoints and request/response schemas",
                                "Review and freeze the OpenAPI specification",
                                "Design and review the database ERD",
                                "Set up API mocks for frontend development",
                                "Get cross-team sign-off before parallel streams begin"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Backend Development",
                        "Implement and document all API endpoints against the locked contract. Write integration tests. Keep the spec as the source of truth — divergence is a bug.",
                        "A fully functional API with 80%+ integration test coverage, deployed to a staging environment for frontend consumption.",
                        "Implement all endpoints defined in the OpenAPI spec\nWrite integration tests for all happy paths and error cases\nDeploy API to staging environment\nVerify spec compliance — no undocumented divergence\nAchieve 80%+ integration test coverage",
                        List.of(
                                "Implement all endpoints defined in the OpenAPI spec",
                                "Write integration tests for happy paths and error cases",
                                "Deploy API to staging environment",
                                "Verify spec compliance — no undocumented divergence",
                                "Achieve 80%+ integration test coverage"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "Frontend Development",
                        "Build the UI consuming the live staging API (or contract mocks where endpoints are incomplete). Maintain strict alignment with the approved designs.",
                        "A complete, accessible frontend fully integrated with the backend API, with no outstanding design deviations.",
                        "Implement all screens against approved designs\nIntegrate with live staging API (or mocks)\nHandle all loading, error, and empty states\nPass WCAG 2.1 AA accessibility audit\nResolve all design deviation review comments",
                        List.of(
                                "Implement all screens against approved designs",
                                "Integrate with live staging API (or mocks)",
                                "Handle all loading, error, and empty states",
                                "Pass WCAG 2.1 AA accessibility audit",
                                "Resolve all design deviation review comments"
                        )
                ),
                new PhaseTemplate(
                        5,
                        "Integration, E2E Testing & QA",
                        "Run end-to-end tests covering the full request lifecycle from browser to database. Conduct load tests and resolve all P0/P1 bugs found across both surfaces.",
                        "The E2E test suite green in CI; no P0 or P1 bugs; performance benchmarks met.",
                        "Write and execute E2E tests covering all critical user flows\nRun load test and validate performance benchmarks\nConduct cross-browser and device testing\nTriage and resolve all P0 and P1 bugs\nConfirm E2E suite is green in CI pipeline",
                        List.of(
                                "Write and execute E2E tests for all critical user flows",
                                "Run load test and validate performance benchmarks",
                                "Conduct cross-browser and device testing",
                                "Triage and resolve all P0 and P1 bugs",
                                "Confirm E2E suite is green in CI pipeline"
                        )
                ),
                new PhaseTemplate(
                        6,
                        "Deployment & Release Management",
                        "Ship both surfaces with a coordinated CI/CD pipeline. Use feature flags for risk mitigation. Establish monitoring across the full stack with a documented rollback plan.",
                        "A coordinated live release with end-to-end observability, feature flags operational, and a validated rollback procedure covering both frontend and backend.",
                        "Configure coordinated CI/CD pipeline for both surfaces\nImplement and configure feature flags\nSet up full-stack monitoring and alerting\nExecute coordinated production deployment\nValidate rollback procedure for both frontend and backend",
                        List.of(
                                "Configure coordinated CI/CD pipeline for both surfaces",
                                "Implement and configure feature flags",
                                "Set up full-stack monitoring and alerting",
                                "Execute coordinated production deployment",
                                "Validate rollback procedure for both surfaces"
                        )
                )
        ));

        // ── AI_ML ─────────────────────────────────────────────────────────────
        // Research-loop aware: hypothesis → data → experiment → production handoff.
        map.put("AI_ML", List.of(
                new PhaseTemplate(
                        0,
                        "Problem Framing & Success Criteria",
                        "Define the ML problem type (classification, regression, generation, etc.), establish the primary business metric, and agree on the minimum performance threshold that justifies production deployment.",
                        "A clear problem statement, a defined evaluation metric (e.g. F1 ≥ 0.85, BLEU ≥ 30), and documented baseline performance from heuristics or existing systems.",
                        "Define the ML problem type (classification, regression, etc.)\nChoose and document the primary evaluation metric\nEstablish minimum performance threshold for production\nMeasure baseline performance from heuristics or existing system\nGet stakeholder sign-off on success criteria",
                        List.of(
                                "Define the ML problem type and scope",
                                "Choose and document the primary evaluation metric",
                                "Establish minimum performance threshold for production",
                                "Measure baseline performance from heuristics",
                                "Get stakeholder sign-off on success criteria"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "Data Acquisition & Governance",
                        "Identify, source, and licence training, validation, and test data. Assess class balance, coverage gaps, and potential bias vectors. Establish a data lineage record.",
                        "A clean, documented, and legally compliant dataset with a data card describing provenance, splits, known biases, and any exclusions.",
                        "Identify and source all required datasets\nVerify licensing and legal compliance\nAssess class balance and coverage gaps\nDocument potential bias vectors\nWrite data card with provenance, splits, and known exclusions",
                        List.of(
                                "Identify and source all required datasets",
                                "Verify licensing and legal compliance",
                                "Assess class balance and coverage gaps",
                                "Document potential bias vectors",
                                "Write data card with provenance, splits, and exclusions"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "Exploratory Data Analysis",
                        "Profile feature distributions, identify potential data leakage between splits, surface correlations and outliers, and generate feature engineering hypotheses.",
                        "An EDA report with visualisations, a documented list of actionable feature engineering hypotheses, and a confirmed absence of train/test leakage.",
                        "Profile all feature distributions\nCheck for train/test/validation data leakage\nSurface outliers and anomalous values\nDocument correlations and key patterns\nGenerate and record feature engineering hypotheses",
                        List.of(
                                "Profile all feature distributions",
                                "Check for train/test/validation data leakage",
                                "Surface outliers and anomalous values",
                                "Document correlations and key patterns",
                                "Generate and record feature engineering hypotheses"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Feature Engineering & Preprocessing",
                        "Build a reproducible, versioned transformation pipeline. Handle missing values, encoding, normalisation, and any domain-specific feature construction.",
                        "A versioned preprocessing pipeline (or feature store entry) that can deterministically reproduce the feature matrix for any dataset split.",
                        "Handle missing values with documented imputation strategy\nApply encoding for categorical features\nNormalise or standardise numerical features\nImplement domain-specific feature construction\nVersion and test preprocessing pipeline for reproducibility",
                        List.of(
                                "Handle missing values with documented imputation strategy",
                                "Apply encoding for categorical features",
                                "Normalise or standardise numerical features",
                                "Implement domain-specific feature construction",
                                "Version and test preprocessing pipeline for reproducibility"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "Model Development & Experimentation",
                        "Train a simple baseline first, then iterate on candidate architectures or algorithms. Track all experiments with a tool like MLflow. Avoid overfitting to the validation set.",
                        "A reproducible experiment log with a clear champion model identified, documented hyperparameters, and evidence of generalisation on held-out data.",
                        "Train and evaluate a simple baseline model\nIterate on candidate architectures or algorithms\nTrack all experiments with hyperparameters and metrics\nSelect champion model based on validation performance\nVerify generalisation on held-out data",
                        List.of(
                                "Train and evaluate a simple baseline model",
                                "Iterate on candidate architectures or algorithms",
                                "Track all experiments with hyperparameters and metrics",
                                "Select champion model based on validation performance",
                                "Verify generalisation on held-out data"
                        )
                ),
                new PhaseTemplate(
                        5,
                        "Evaluation, Bias & Safety Review",
                        "Evaluate the champion model on the held-out test set. Conduct bias audits across demographic slices. Identify and document failure modes and safety risks.",
                        "A model card with test-set evaluation results, bias audit findings, known failure modes, and a go/no-go recommendation for production.",
                        "Evaluate champion model on held-out test set\nConduct bias audit across defined demographic slices\nDocument all known failure modes and edge cases\nAssess safety risks and mitigation strategies\nProduce model card with go/no-go recommendation",
                        List.of(
                                "Evaluate champion model on held-out test set",
                                "Conduct bias audit across defined demographic slices",
                                "Document all known failure modes and edge cases",
                                "Assess safety risks and mitigation strategies",
                                "Produce model card with go/no-go recommendation"
                        )
                ),
                new PhaseTemplate(
                        6,
                        "Model Deployment & Monitoring",
                        "Serve the model via an API or batch pipeline. Implement data drift and prediction drift detection. Define retraining triggers and a model lifecycle policy.",
                        "A production endpoint (or batch job) with live performance monitoring, drift alerting, and a documented retraining and rollback procedure.",
                        "Deploy model as API endpoint or batch pipeline\nImplement data drift detection\nImplement prediction drift and performance monitoring\nDefine and document retraining trigger thresholds\nValidate rollback procedure for model versions",
                        List.of(
                                "Deploy model as API endpoint or batch pipeline",
                                "Implement data drift detection",
                                "Implement prediction drift and performance monitoring",
                                "Define and document retraining trigger thresholds",
                                "Validate rollback procedure for model versions"
                        )
                )
        ));

        // ── DATA_SCIENCE ─────────────────────────────────────────────────────
        // Insight-delivery focused: the output is a decision or report, not production software.
        map.put("DATA_SCIENCE", List.of(
                new PhaseTemplate(
                        0,
                        "Question Framing & Stakeholder Alignment",
                        "Translate the business question into a precise, answerable analytical question. Agree with stakeholders on the deliverable format, timeline, and decision it will inform.",
                        "A signed-off analytical brief that defines the question, methodology constraints, success criteria, and the business decision that hinges on the output.",
                        "Translate business question into an answerable analytical question\nDefine methodology constraints and non-negotiables\nAgree on deliverable format and timeline\nDocument the business decision the analysis will inform\nObtain stakeholder sign-off on analytical brief",
                        List.of(
                                "Translate business question into an answerable analytical question",
                                "Define methodology constraints and non-negotiables",
                                "Agree on deliverable format and timeline",
                                "Document the business decision the analysis will inform",
                                "Obtain stakeholder sign-off on analytical brief"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "Data Discovery & Access",
                        "Identify all relevant data sources, negotiate access and understand data lineage, document schemas, and assess data freshness and completeness.",
                        "A documented data dictionary with confirmed access credentials, lineage notes, and an honest assessment of data quality and coverage gaps.",
                        "Identify all relevant data sources\nNegotiate and confirm data access credentials\nDocument data schemas and lineage\nAssess data freshness and completeness\nProduce data dictionary with coverage gap assessment",
                        List.of(
                                "Identify all relevant data sources",
                                "Negotiate and confirm data access credentials",
                                "Document data schemas and lineage",
                                "Assess data freshness and completeness",
                                "Produce data dictionary with coverage gap assessment"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "Data Cleaning & Validation",
                        "Handle nulls, duplicates, type mismatches, and outliers. Validate data against known business rules. Document every transformation and its rationale.",
                        "A clean, validated dataset accompanied by a data quality report that quantifies the issues found and the transformations applied.",
                        "Handle null values with documented strategy\nRemove or flag duplicates\nFix type mismatches and format inconsistencies\nValidate data against known business rules\nDocument all transformations and produce data quality report",
                        List.of(
                                "Handle null values with documented strategy",
                                "Remove or flag duplicates",
                                "Fix type mismatches and format inconsistencies",
                                "Validate data against known business rules",
                                "Document all transformations and produce data quality report"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Exploratory Data Analysis",
                        "Perform deep univariate and bivariate analysis. Surface patterns, anomalies, and unexpected correlations. Generate and document analytical hypotheses.",
                        "An EDA notebook with annotated key findings, visualisations, and a prioritised set of analytical hypotheses to test in the next phase.",
                        "Perform univariate analysis on all key variables\nConduct bivariate analysis to identify correlations\nSurface and investigate anomalies\nGenerate and document analytical hypotheses\nProduce annotated EDA notebook with visualisations",
                        List.of(
                                "Perform univariate analysis on all key variables",
                                "Conduct bivariate analysis to identify correlations",
                                "Surface and investigate anomalies",
                                "Generate and document analytical hypotheses",
                                "Produce annotated EDA notebook with visualisations"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "Analysis & Statistical Modelling",
                        "Apply appropriate statistical or predictive techniques to answer the core analytical question. Validate assumptions, quantify uncertainty, and test all hypotheses.",
                        "Analytical findings with documented statistical methods, confidence intervals or p-values, and a clear answer (or qualified non-answer) to the original question.",
                        "Select and justify statistical or modelling technique\nValidate method assumptions\nTest all hypotheses with appropriate significance tests\nQuantify uncertainty with confidence intervals or p-values\nDocument findings and a clear answer to the analytical question",
                        List.of(
                                "Select and justify statistical or modelling technique",
                                "Validate method assumptions",
                                "Test all hypotheses with appropriate significance tests",
                                "Quantify uncertainty with confidence intervals or p-values",
                                "Document findings and a clear answer to the analytical question"
                        )
                ),
                new PhaseTemplate(
                        5,
                        "Visualisation & Storytelling",
                        "Build clear, accurate, and non-misleading charts and a narrative that makes the findings accessible and actionable for non-technical stakeholders.",
                        "A polished dashboard or presentation deck that communicates the key findings, their implications, and recommended actions to a non-technical audience.",
                        "Choose appropriate chart types for each finding\nBuild charts that are accurate and non-misleading\nWrite a clear narrative linking data to business implications\nCreate polished dashboard or presentation deck\nValidate comprehension with a non-technical reviewer",
                        List.of(
                                "Choose appropriate chart types for each finding",
                                "Build charts that are accurate and non-misleading",
                                "Write a clear narrative linking data to business implications",
                                "Create polished dashboard or presentation deck",
                                "Validate comprehension with a non-technical reviewer"
                        )
                ),
                new PhaseTemplate(
                        6,
                        "Reporting & Recommendations",
                        "Deliver the final written report with executive summary, methodology, findings, limitations, and concrete, prioritised recommendations with supporting data.",
                        "A published report with actionable next-step recommendations, documented caveats and limitations, and a handover to the team responsible for acting on the findings.",
                        "Write executive summary with key findings\nDocument methodology and analytical choices\nState limitations and caveats clearly\nProvide prioritised, actionable recommendations\nPublish report and hand over to responsible team",
                        List.of(
                                "Write executive summary with key findings",
                                "Document methodology and analytical choices",
                                "State limitations and caveats clearly",
                                "Provide prioritised, actionable recommendations",
                                "Publish report and hand over to responsible team"
                        )
                )
        ));

        // ── OTHER ─────────────────────────────────────────────────────────────
        // Domain-agnostic fallback: a lean five-phase foundation applicable to any project type.
        map.put("OTHER", List.of(
                new PhaseTemplate(
                        0,
                        "Discovery & Requirements",
                        "Understand the problem space, identify stakeholders, and capture concrete, testable requirements before committing to a solution approach.",
                        "Documented requirements and acceptance criteria agreed upon by all stakeholders.",
                        "Identify all stakeholders and their goals\nConduct discovery sessions or interviews\nDocument functional requirements\nDefine acceptance criteria for each requirement\nGet written stakeholder sign-off",
                        List.of(
                                "Identify all stakeholders and their goals",
                                "Conduct discovery sessions or interviews",
                                "Document functional requirements",
                                "Define acceptance criteria for each requirement",
                                "Get written stakeholder sign-off"
                        )
                ),
                new PhaseTemplate(
                        1,
                        "Planning & Architecture",
                        "Break work into milestones, choose tools and approaches, make key design decisions, and produce a plan the team can execute against.",
                        "A project plan with architecture or design decisions documented, and work broken into actionable milestones.",
                        "Choose tools, frameworks, and approach\nDocument key architectural or design decisions\nBreak work into milestones with owners and timelines\nIdentify risks and define mitigations\nGet team alignment on the plan before execution",
                        List.of(
                                "Choose tools, frameworks, and approach",
                                "Document key architectural or design decisions",
                                "Break work into milestones with owners and timelines",
                                "Identify risks and define mitigations",
                                "Get team alignment on the plan before execution"
                        )
                ),
                new PhaseTemplate(
                        2,
                        "Implementation",
                        "Build the primary deliverable iteratively, maintaining alignment with the requirements and architecture decisions made in earlier phases.",
                        "A working implementation that meets the agreed requirements, code-reviewed and passing any applicable tests.",
                        "Implement deliverable in iterative increments\nMaintain alignment with documented requirements\nConduct code or work-product reviews at each increment\nWrite applicable tests or validation checks\nDocument implementation decisions and deviations",
                        List.of(
                                "Implement deliverable in iterative increments",
                                "Maintain alignment with documented requirements",
                                "Conduct code or work-product reviews at each increment",
                                "Write applicable tests or validation checks",
                                "Document implementation decisions and deviations"
                        )
                ),
                new PhaseTemplate(
                        3,
                        "Testing & Validation",
                        "Verify the implementation's correctness, completeness, and robustness against the documented requirements and acceptance criteria.",
                        "A validated deliverable with test evidence and stakeholder sign-off on acceptance criteria.",
                        "Test against every documented acceptance criterion\nConduct edge-case and error-path testing\nFix all defects found before sign-off\nDocument test results and evidence\nObtain stakeholder sign-off on validated deliverable",
                        List.of(
                                "Test against every documented acceptance criterion",
                                "Conduct edge-case and error-path testing",
                                "Fix all defects found before sign-off",
                                "Document test results and evidence",
                                "Obtain stakeholder sign-off on validated deliverable"
                        )
                ),
                new PhaseTemplate(
                        4,
                        "Delivery & Retrospective",
                        "Deliver the final output to stakeholders, conduct a retrospective to capture lessons learned, and document any follow-up work or known limitations.",
                        "Delivered artefact with stakeholder acknowledgement, a retrospective summary, and documented next steps or known gaps.",
                        "Deliver final artefact to stakeholders\nObtain formal acknowledgement of delivery\nConduct team retrospective (what went well / what didn't)\nDocument known limitations and follow-up items\nArchive project artefacts and close out",
                        List.of(
                                "Deliver final artefact to stakeholders",
                                "Obtain formal acknowledgement of delivery",
                                "Conduct team retrospective (what went well / what didn't)",
                                "Document known limitations and follow-up items",
                                "Archive project artefacts and close out"
                        )
                )
        ));

        DOMAIN_TEMPLATES = Collections.unmodifiableMap(map);
    }

    // ── Lookup API ────────────────────────────────────────────────────────────

    /**
     * Returns the ordered list of {@link PhaseTemplate}s for the given domain key.
     *
     * <p>Falls back to the {@code "OTHER"} template if {@code domain} is {@code null},
     * blank, or does not match any registered key. This is the <em>single</em> place
     * where fallback logic lives — callers should not implement their own fallback.
     *
     * @param domain the {@code Project.domain} string (case-sensitive, typically upper-snake-case)
     * @return an unmodifiable, deterministically ordered list of phase blueprints; never {@code null}
     */
    public static List<PhaseTemplate> getTemplates(String domain) {
        if (domain == null || domain.isBlank()) {
            return DOMAIN_TEMPLATES.get("OTHER");
        }
        List<PhaseTemplate> templates = DOMAIN_TEMPLATES.get(domain);
        return templates != null ? templates : DOMAIN_TEMPLATES.get("OTHER");
    }

    private DomainTemplateConfig() {
        // Utility class — prevent instantiation
    }
}