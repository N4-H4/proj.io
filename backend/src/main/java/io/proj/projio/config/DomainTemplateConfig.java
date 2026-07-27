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
                        "A signed-off scope document and prioritised feature list agreed upon by all stakeholders."
                ),
                new PhaseTemplate(
                        1,
                        "UI/UX Design & Prototyping",
                        "Create wireframes, establish the design system and component library, and produce a clickable high-fidelity prototype for stakeholder validation.",
                        "An approved hi-fi prototype with a documented design system, ready for developer hand-off."
                ),
                new PhaseTemplate(
                        2,
                        "Frontend Development",
                        "Build a responsive, accessible, and component-driven UI that faithfully implements the approved designs across target browsers and viewports.",
                        "A pixel-accurate, fully interactive frontend that passes accessibility checks and matches the approved designs."
                ),
                new PhaseTemplate(
                        3,
                        "Backend & API Integration",
                        "Connect the frontend to backend APIs, implement authentication flows, handle async data loading, and wire up all client-server interactions.",
                        "A fully integrated application with working data round-trips, auth, and error handling across all user flows."
                ),
                new PhaseTemplate(
                        4,
                        "QA & Cross-Browser Testing",
                        "Execute functional, regression, accessibility, and cross-browser/device test passes. Triage and resolve defects before release.",
                        "Zero P0 bugs outstanding; all acceptance criteria verified across the target device and browser matrix."
                ),
                new PhaseTemplate(
                        5,
                        "Production Deployment & Handover",
                        "Deploy the application to CDN/hosting, configure DNS and TLS, run smoke tests in production, and establish monitoring and alerting.",
                        "A live, publicly accessible URL with uptime monitoring, error alerting, and a documented runbook in place."
                )
        ));

        // ── APP_DEVELOPMENT ──────────────────────────────────────────────────
        // Mobile-first: platform constraints, store rules, and device fragmentation shape every phase.
        map.put("APP_DEVELOPMENT", List.of(
                new PhaseTemplate(
                        0,
                        "Product & Platform Definition",
                        "Define the target platform(s) (iOS, Android, cross-platform), user personas, core UX flows, and platform-specific constraints before design begins.",
                        "A platform decision document, user stories, and a prioritised backlog that accounts for OS-specific guidelines."
                ),
                new PhaseTemplate(
                        1,
                        "UI/UX Design & Prototyping",
                        "Design mobile-first interfaces that respect platform conventions (Apple HIG for iOS, Material Design for Android). Prototype key navigation flows.",
                        "An approved interactive prototype covering all core flows, with a component library aligned to the target platform's design language."
                ),
                new PhaseTemplate(
                        2,
                        "Architecture & State Management",
                        "Define the app's component hierarchy, choose a state management approach, plan navigation structure, and establish an offline/sync strategy.",
                        "An Architecture Decision Record (ADR) committed to the repo that the entire team aligns on before feature development starts."
                ),
                new PhaseTemplate(
                        3,
                        "Feature Development",
                        "Build all screens, implement business logic, integrate local storage, consume backend APIs, and write unit tests per feature.",
                        "All user stories implemented, code-reviewed, and passing unit tests, ready for device QA."
                ),
                new PhaseTemplate(
                        4,
                        "Device Testing & QA",
                        "Test on a matrix of real devices across OS versions. Address crashes, layout regressions, permission edge cases, and performance bottlenecks.",
                        "A stable release candidate passing on the defined device matrix, with no P0/P1 crashes or regressions."
                ),
                new PhaseTemplate(
                        5,
                        "Store Submission & Release",
                        "Prepare store metadata, screenshots, and privacy disclosures. Submit for review, respond to reviewer feedback, and execute a staged rollout.",
                        "The app live on the target app store(s) with a confirmed staged rollout and crash-rate monitoring active."
                )
        ));

        // ── BACKEND ──────────────────────────────────────────────────────────
        // API-contract-first discipline: schema and contract are defined before a line of impl code.
        map.put("BACKEND", List.of(
                new PhaseTemplate(
                        0,
                        "Requirements & Domain Modelling",
                        "Identify bounded contexts, core entities, business rules, non-functional requirements (latency, throughput, availability SLAs), and integration points.",
                        "A domain model diagram and a documented list of functional and non-functional requirements signed off by stakeholders."
                ),
                new PhaseTemplate(
                        1,
                        "API Contract Design",
                        "Define REST or gRPC contracts, establish error codes and response shapes, decide on versioning strategy, and design the authentication and authorisation model.",
                        "A reviewed and signed-off OpenAPI spec or proto file that frontend/consumer teams can begin working against immediately."
                ),
                new PhaseTemplate(
                        2,
                        "Data Modelling & Migrations",
                        "Design a normalised database schema with appropriate indexes and constraints. Write and test versioned migration scripts. Document data access patterns.",
                        "A reviewed ERD and a suite of tested, idempotent migration scripts ready to run against staging and production."
                ),
                new PhaseTemplate(
                        3,
                        "Core Implementation",
                        "Implement services, repositories, and business logic strictly against the agreed API contract. Maintain separation of concerns and write integration tests per endpoint.",
                        "All contracted endpoints implemented, documented, and passing integration tests with meaningful coverage of happy paths and error cases."
                ),
                new PhaseTemplate(
                        4,
                        "Security, Performance & Testing",
                        "Conduct auth/authz hardening, input validation, rate limiting, and load testing. Cover edge cases, concurrency scenarios, and failure modes.",
                        "Security audit passed with no critical findings; P95 response latency meets the documented SLA under simulated peak load."
                ),
                new PhaseTemplate(
                        5,
                        "Deployment & Observability",
                        "Set up CI/CD pipelines, containerisation, infrastructure-as-code, structured logging, distributed tracing, and alerting dashboards.",
                        "Zero-downtime deployment to production with live dashboards, alerting thresholds configured, and a validated rollback procedure."
                )
        ));

        // ── FULL_STACK ────────────────────────────────────────────────────────
        // Coordination-aware: API contract locks before parallel frontend/backend streams begin.
        map.put("FULL_STACK", List.of(
                new PhaseTemplate(
                        0,
                        "Product Definition & System Design",
                        "Agree on the full system architecture, tech stack choices, team responsibilities, and integration boundaries before any parallel work begins.",
                        "An architecture document with ADRs, a team responsibility matrix, and a sprint-ready backlog covering both frontend and backend work."
                ),
                new PhaseTemplate(
                        1,
                        "UI/UX Design",
                        "Design end-to-end user flows covering all surfaces. Produce a component inventory that can inform both the frontend implementation and the API shape.",
                        "Approved designs with a documented component inventory and annotated interaction states that serve as the source of truth for both streams."
                ),
                new PhaseTemplate(
                        2,
                        "API Contract & Data Modelling",
                        "Lock the shared API surface (OpenAPI spec) and database schema before parallel development streams begin. This is the coordination gate for the entire project.",
                        "A frozen OpenAPI spec and reviewed ERD that both the frontend (via mocks) and backend (via implementation) can work against independently."
                ),
                new PhaseTemplate(
                        3,
                        "Backend Development",
                        "Implement and document all API endpoints against the locked contract. Write integration tests. Keep the spec as the source of truth — divergence is a bug.",
                        "A fully functional API with 80%+ integration test coverage, deployed to a staging environment for frontend consumption."
                ),
                new PhaseTemplate(
                        4,
                        "Frontend Development",
                        "Build the UI consuming the live staging API (or contract mocks where endpoints are incomplete). Maintain strict alignment with the approved designs.",
                        "A complete, accessible frontend fully integrated with the backend API, with no outstanding design deviations."
                ),
                new PhaseTemplate(
                        5,
                        "Integration, E2E Testing & QA",
                        "Run end-to-end tests covering the full request lifecycle from browser to database. Conduct load tests and resolve all P0/P1 bugs found across both surfaces.",
                        "The E2E test suite green in CI; no P0 or P1 bugs; performance benchmarks met."
                ),
                new PhaseTemplate(
                        6,
                        "Deployment & Release Management",
                        "Ship both surfaces with a coordinated CI/CD pipeline. Use feature flags for risk mitigation. Establish monitoring across the full stack with a documented rollback plan.",
                        "A coordinated live release with end-to-end observability, feature flags operational, and a validated rollback procedure covering both frontend and backend."
                )
        ));

        // ── AI_ML ─────────────────────────────────────────────────────────────
        // Research-loop aware: hypothesis → data → experiment → production handoff.
        map.put("AI_ML", List.of(
                new PhaseTemplate(
                        0,
                        "Problem Framing & Success Criteria",
                        "Define the ML problem type (classification, regression, generation, etc.), establish the primary business metric, and agree on the minimum performance threshold that justifies production deployment.",
                        "A clear problem statement, a defined evaluation metric (e.g. F1 ≥ 0.85, BLEU ≥ 30), and documented baseline performance from heuristics or existing systems."
                ),
                new PhaseTemplate(
                        1,
                        "Data Acquisition & Governance",
                        "Identify, source, and licence training, validation, and test data. Assess class balance, coverage gaps, and potential bias vectors. Establish a data lineage record.",
                        "A clean, documented, and legally compliant dataset with a data card describing provenance, splits, known biases, and any exclusions."
                ),
                new PhaseTemplate(
                        2,
                        "Exploratory Data Analysis",
                        "Profile feature distributions, identify potential data leakage between splits, surface correlations and outliers, and generate feature engineering hypotheses.",
                        "An EDA report with visualisations, a documented list of actionable feature engineering hypotheses, and a confirmed absence of train/test leakage."
                ),
                new PhaseTemplate(
                        3,
                        "Feature Engineering & Preprocessing",
                        "Build a reproducible, versioned transformation pipeline. Handle missing values, encoding, normalisation, and any domain-specific feature construction.",
                        "A versioned preprocessing pipeline (or feature store entry) that can deterministically reproduce the feature matrix for any dataset split."
                ),
                new PhaseTemplate(
                        4,
                        "Model Development & Experimentation",
                        "Train a simple baseline first, then iterate on candidate architectures or algorithms. Track all experiments with a tool like MLflow. Avoid overfitting to the validation set.",
                        "A reproducible experiment log with a clear champion model identified, documented hyperparameters, and evidence of generalisation on held-out data."
                ),
                new PhaseTemplate(
                        5,
                        "Evaluation, Bias & Safety Review",
                        "Evaluate the champion model on the held-out test set. Conduct bias audits across demographic slices. Identify and document failure modes and safety risks.",
                        "A model card with test-set evaluation results, bias audit findings, known failure modes, and a go/no-go recommendation for production."
                ),
                new PhaseTemplate(
                        6,
                        "Model Deployment & Monitoring",
                        "Serve the model via an API or batch pipeline. Implement data drift and prediction drift detection. Define retraining triggers and a model lifecycle policy.",
                        "A production endpoint (or batch job) with live performance monitoring, drift alerting, and a documented retraining and rollback procedure."
                )
        ));

        // ── DATA_SCIENCE ─────────────────────────────────────────────────────
        // Insight-delivery focused: the output is a decision or report, not production software.
        map.put("DATA_SCIENCE", List.of(
                new PhaseTemplate(
                        0,
                        "Question Framing & Stakeholder Alignment",
                        "Translate the business question into a precise, answerable analytical question. Agree with stakeholders on the deliverable format, timeline, and decision it will inform.",
                        "A signed-off analytical brief that defines the question, methodology constraints, success criteria, and the business decision that hinges on the output."
                ),
                new PhaseTemplate(
                        1,
                        "Data Discovery & Access",
                        "Identify all relevant data sources, negotiate access and understand data lineage, document schemas, and assess data freshness and completeness.",
                        "A documented data dictionary with confirmed access credentials, lineage notes, and an honest assessment of data quality and coverage gaps."
                ),
                new PhaseTemplate(
                        2,
                        "Data Cleaning & Validation",
                        "Handle nulls, duplicates, type mismatches, and outliers. Validate data against known business rules. Document every transformation and its rationale.",
                        "A clean, validated dataset accompanied by a data quality report that quantifies the issues found and the transformations applied."
                ),
                new PhaseTemplate(
                        3,
                        "Exploratory Data Analysis",
                        "Perform deep univariate and bivariate analysis. Surface patterns, anomalies, and unexpected correlations. Generate and document analytical hypotheses.",
                        "An EDA notebook with annotated key findings, visualisations, and a prioritised set of analytical hypotheses to test in the next phase."
                ),
                new PhaseTemplate(
                        4,
                        "Analysis & Statistical Modelling",
                        "Apply appropriate statistical or predictive techniques to answer the core analytical question. Validate assumptions, quantify uncertainty, and test all hypotheses.",
                        "Analytical findings with documented statistical methods, confidence intervals or p-values, and a clear answer (or qualified non-answer) to the original question."
                ),
                new PhaseTemplate(
                        5,
                        "Visualisation & Storytelling",
                        "Build clear, accurate, and non-misleading charts and a narrative that makes the findings accessible and actionable for non-technical stakeholders.",
                        "A polished dashboard or presentation deck that communicates the key findings, their implications, and recommended actions to a non-technical audience."
                ),
                new PhaseTemplate(
                        6,
                        "Reporting & Recommendations",
                        "Deliver the final written report with executive summary, methodology, findings, limitations, and concrete, prioritised recommendations with supporting data.",
                        "A published report with actionable next-step recommendations, documented caveats and limitations, and a handover to the team responsible for acting on the findings."
                )
        ));

        // ── OTHER ─────────────────────────────────────────────────────────────
        // Domain-agnostic fallback: a lean five-phase foundation applicable to any project type.
        map.put("OTHER", List.of(
                new PhaseTemplate(
                        0,
                        "Discovery & Requirements",
                        "Understand the problem space, identify stakeholders, and capture concrete, testable requirements before committing to a solution approach.",
                        "Documented requirements and acceptance criteria agreed upon by all stakeholders."
                ),
                new PhaseTemplate(
                        1,
                        "Planning & Architecture",
                        "Break work into milestones, choose tools and approaches, make key design decisions, and produce a plan the team can execute against.",
                        "A project plan with architecture or design decisions documented, and work broken into actionable milestones."
                ),
                new PhaseTemplate(
                        2,
                        "Implementation",
                        "Build the primary deliverable iteratively, maintaining alignment with the requirements and architecture decisions made in earlier phases.",
                        "A working implementation that meets the agreed requirements, code-reviewed and passing any applicable tests."
                ),
                new PhaseTemplate(
                        3,
                        "Testing & Validation",
                        "Verify the implementation's correctness, completeness, and robustness against the documented requirements and acceptance criteria.",
                        "A validated deliverable with test evidence and stakeholder sign-off on acceptance criteria."
                ),
                new PhaseTemplate(
                        4,
                        "Delivery & Retrospective",
                        "Deliver the final output to stakeholders, conduct a retrospective to capture lessons learned, and document any follow-up work or known limitations.",
                        "Delivered artefact with stakeholder acknowledgement, a retrospective summary, and documented next steps or known gaps."
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