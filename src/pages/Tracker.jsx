import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const T = {
  bg: "#14110F", panel: "#1D1916", panel2: "#26211D", line: "#332C26",
  ember: "#FF6B2C", gold: "#E8B14E", txt: "#F2ECE4", mut: "#9C9187",
  dim: "#5E564E", green: "#7BC47F", red: "#E06C5A",
};
const FONT_HEAD = "'Space Grotesk','Inter',system-ui,sans-serif";
const FONT_BODY = "'Inter',system-ui,sans-serif";

// ─── DAILY DRILLS (fixed, every single day of all 252) ──────
const DRILLS = [
  { id: "d1", min: 10, label: "Teardown — 1 app, 3 written lines", how: "Open one app (rotate Cred/Swiggy/PhonePe/Notion). Write: metric this screen optimizes, tradeoff the PM made, what you'd A/B test." },
  { id: "d2", min: 5, label: "Metric drill — 1 written answer", how: "Pick any product. Write its north-star metric and why NOT the obvious alternative. 5 lines max." },
  { id: "d3", min: 5, label: "AI rep — 1 real task, logged", how: "Do one real task with an AI tool (draft, analyze, prototype). Log: what worked, what failed. This log = interview material." },
];

// ─── THE 10 PHASES (36 weeks) — Reforge-equivalent, outcome-equivalent curriculum ──
const PHASES = [
  { phase: 1, name: "Product Foundations", folder: "01-product-brief", weeksRange: [1,4],
    coach: "Outcomes over output. Every artifact from here on lives in your RoofSpark folder — this is the baseline your thinking gets measured against for 36 weeks." },
  { phase: 2, name: "Product Sense & Customer Feedback", folder: "02-research", weeksRange: [5,7],
    coach: "Discovery is a weekly habit, not a project. Product sense is trained by critiquing real products daily, not just reading about frameworks." },
  { phase: 3, name: "Managing Product Work & Decisions", folder: "03-strategy", weeksRange: [8,10],
    coach: "Dashboards, roadmaps, and OKRs are decision tools, not reporting theatre. If an artifact doesn't change a decision, it's not done yet." },
  { phase: 4, name: "Product Strategy", folder: "03-strategy", weeksRange: [11,14],
    coach: "Strategy is diagnosis + a coherent set of choices, not a wishlist. Explicit non-goals matter as much as the goals." },
  { phase: 5, name: "Metrics & Product Analytics", folder: "04-metrics", weeksRange: [15,17],
    coach: "A metric tree only matters if it changes a decision. Start every analysis from the decision, never from a chart." },
  { phase: 6, name: "Experimentation", folder: "05-experiments", weeksRange: [18,20],
    coach: "An experiment is only good science if the analysis plan existed before you saw the results. A failed hypothesis is data, not a failure." },
  { phase: 7, name: "Growth, Retention, PLG & Monetization", folder: "06-growth", weeksRange: [21,27],
    coach: "The longest phase for a reason — this is where most of the $ in a 20L+ role lives. Loops compound, funnels don't. Find the constraint, not more features." },
  { phase: 8, name: "Marketplace Thinking", folder: "08-marketplace", weeksRange: [28,30],
    coach: "You're testing whether RoofSpark could be a marketplace — not committing to it. Evidence decides, not enthusiasm for the idea." },
  { phase: 9, name: "AI Products", folder: "09-ai", weeksRange: [31,35],
    coach: "This phase alone is worth more in 2026 hiring than anything else in this curriculum. Evals and risk registers are what separate an AI-PM pretender from the real thing." },
  { phase: 10, name: "Integration & Leadership", folder: "10-final", weeksRange: [36,36],
    coach: "One week. Everything comes together. The final decision on RoofSpark's model must come from evidence collected over 35 weeks — not from whichever phase was most fun." },
];

// ─── THE 36 WEEKS — learn / resources / output pulled directly from the curriculum ──
const WEEKS = [
{ w:1, phase:1, title:"Product work starts with outcomes", folder:"01-product-brief",
  learn:["PM vs project/delivery management","Output vs outcome vs business impact","The 4 risks: value, usability, feasibility, viability","Customer-backward thinking"],
  resources:["Real-World PM I — opening modules (Coursera)","SVPG Product Operating Model intro (free, svpg.com)"],
  output:["One-page brief: Problem → User → Solution → Why now → Outcome","Assumptions list split by risk type (value/usability/feasibility/viability)","A clear statement of what RoofSpark will NOT do"],
  reviewFocus:"Clear user problem & evidence quality" },
{ w:2, phase:1, title:"User, problem, and market", folder:"01-product-brief",
  learn:["Personas vs evidence-backed segments","Jobs, pains, current alternatives, switching behavior","Interview design","TAM/SAM/SOM & competitive alternatives"],
  resources:["Real-World PM I — personas/interviews/journeys/market sizing","Product Talk — discovery basics (free)"],
  output:["Interview guide","Recruitment plan for 10 small roofing-business owners","Current-state journey: 'referrals slow down' → 'try to find new leads'","Market & alternatives map"],
  reviewFocus:"Evidence quality" },
{ w:3, phase:1, title:"Opportunity validation", folder:"01-product-brief",
  learn:["Separate demand/usability/feasibility/viability assumptions","Identify the riskiest assumption","Choose the right test: interview, smoke test, concierge, landing page, prototype","Evidence vs enthusiasm"],
  resources:["UVA Hypothesis-Driven Development — persona/JTBD & demand hypotheses","Product Talk — Opportunity Solution Tree (free)"],
  output:["Opportunity solution tree","Assumption map","3 validation tests ranked by learning-value ÷ time & cost"],
  reviewFocus:"Strategic logic" },
{ w:4, phase:1, title:"Feature design, delivery, launch, iteration", folder:"01-product-brief", phaseEnd:true,
  learn:["Turn an opportunity into a coherent feature/service","Write requirements without prescribing every detail","MVP scope","Align product/design/ops/sales/support","Launch with a measurement + iteration plan"],
  resources:["Real-World PM I — PRD/PRFAQ, MVP, roadmap/backlog","SVPG — 'How To Write a Good PRD' (free PDF)","UVA — prototype & usability testing"],
  output:["PRD or service-specification document","Prototype or service blueprint","Pre-launch checklist","30-day post-launch learning plan"],
  reviewFocus:"Communication & usability of the artifact" },

{ w:5, phase:2, title:"Continuous discovery", folder:"02-research",
  learn:["Connect a business outcome to customer opportunities and solutions","Interview for specific stories, not opinions","Discover weekly instead of running occasional research projects"],
  resources:["Continuous Discovery Habits — Teresa Torres (book) / Product Talk (free)","UVA — interview & design-sprint modules"],
  output:["5 completed interview snapshots","Updated opportunity solution tree","Evidence log: what changed in your thinking"],
  reviewFocus:"Evidence quality" },
{ w:6, phase:2, title:"Product sense", folder:"02-research",
  learn:["Identify user, need, context, alternative, expected behavior","Critique onboarding, value delivery, failure states","Make tradeoffs instead of listing features"],
  resources:["Practice set: critique 5 products — 1 B2B SaaS, 1 consumer app, 1 marketplace, 1 AI product, RoofSpark"],
  output:["5 product critiques: user? progress they want? what blocks them? the product's bet? metric that should move? what would you remove?","1 'improve RoofSpark' proposal with 3 alternatives + your chosen direction"],
  reviewFocus:"Strategic logic" },
{ w:7, phase:2, title:"Product-market fit and innovation", folder:"02-research", phaseEnd:true,
  learn:["Value proposition & differentiated promise","Problem-solution fit vs product-market fit","Leading vs lagging PMF evidence","When to iterate, reposition, or stop"],
  resources:["UMD product-market-fit material (if accessible)","UVA — demand experiments","Real-World PM I — market & MVP modules"],
  output:["PMF hypothesis","Segment-specific value propositions","PMF evidence scorecard","Kill / continue / expand criteria"],
  reviewFocus:"Strategic logic + evidence" },

{ w:8, phase:3, title:"Lever dashboard and feedback system", folder:"03-strategy",
  learn:["Connect a business result to controllable product levers","Combine behavioral data + customer feedback + sales/support signals + strategic context","Avoid dashboard theatre"],
  resources:["UVA Product Analytics and AI — customer analytics & journeys","Amplitude — product analytics guides","Real-World PM II — KPIs/OKRs/North Stars"],
  output:["Outcome → levers → behaviors → events metric tree","Feedback repository: source, segment, evidence quality, frequency, decision impact"],
  reviewFocus:"Metrics & causal reasoning" },
{ w:9, phase:3, title:"Roadmaps and empowering product specs", folder:"03-strategy",
  learn:["Roadmap outcomes and bets, not a feature calendar","Distinguish strategy vs roadmap vs discovery backlog vs delivery plan","Write context that helps a team decide"],
  resources:["Microsoft — Product Strategy and Roadmapping (Coursera)","Real-World PM I — roadmap/backlog material","SVPG — PRD guide"],
  output:["Now/Next/Later outcome roadmap","1 product spec: context, outcome, users, constraints, risks, success metrics, open questions"],
  reviewFocus:"Communication & usability" },
{ w:10, phase:3, title:"OKR loops and decision architecture", folder:"03-strategy", phaseEnd:true,
  learn:["Make OKRs part of a learn-decide-act loop","Distinguish reversible vs irreversible decisions","Set decision rights and escalation rules","Record assumptions and revisit them"],
  resources:["Real-World PM II — OKRs & metrics","Microsoft — stakeholder & roadmap communication material"],
  output:["1 quarterly objective with 3 measurable key results","Weekly operating review format","Decision log: owner, date, evidence, options, tradeoff, choice, confidence, revisit trigger","Decision-rights map"],
  reviewFocus:"Risks & tradeoffs" },

{ w:11, phase:4, title:"Leading a product strategy", folder:"03-strategy",
  learn:["Diagnosis, choices, and coherent actions","How strategy connects company goals, user value, and an advantage","Focus and explicit non-goals"],
  resources:["SVPG — strategy overview, focus, insights, actions (free)","Microsoft — Product Strategy"],
  output:["2-page strategy memo: diagnosis, target segment, winning choice, advantage, actions, non-goals, risks"],
  reviewFocus:"Strategic logic" },
{ w:12, phase:4, title:"Feature strategy", folder:"03-strategy",
  learn:["Evaluate adoption, retention, satisfaction, strategic fit, cost, risk","Improve vs maintain vs retire vs expand a feature","Find the constraint rather than adding more functionality"],
  resources:["Apply W11's frameworks directly"],
  output:["Feature/service portfolio","Adoption-retention-satisfaction assessment","1 invest, 1 maintain, 1 retire decision"],
  reviewFocus:"Strategic logic" },
{ w:13, phase:4, title:"Growth strategy and PMF expansion", folder:"03-strategy",
  learn:["Distinguish core-product improvement from growth work","Expand by segment, use case, geography, channel, or product","Test whether adjacency value and distribution are real"],
  resources:["Reforge — public Product Strategy outcomes/syllabus","Growth Product Manager's Handbook — market/strategy/value modules","UVA — demand testing"],
  output:["3 PMF expansion options","Attractiveness × right-to-win × cost/risk scoring","Expansion thesis + validation plan for the selected option"],
  reviewFocus:"Strategic logic + evidence" },
{ w:14, phase:4, title:"Scaling and product workplan", folder:"03-strategy", phaseEnd:true,
  learn:["Balance feature, growth, innovation, PMF-expansion, scaling investments","Identify infrastructure & operational constraints","Communicate resource tradeoffs"],
  resources:["Synthesis week — no new named course"],
  output:["12-month portfolio allocation","Product workplan","Dependency map","5-slide strategy narrative for stakeholder buy-in"],
  reviewFocus:"Communication & usability" },

{ w:15, phase:5, title:"North Star and metric system", folder:"04-metrics",
  learn:["Define a North Star representing delivered user value","Input, output, outcome, quality, health, guardrail metrics","Avoid vanity metrics and metric gaming"],
  resources:["Real-World PM II","UVA Product Analytics","Amplitude — analytics resources"],
  output:["North Star candidate comparison","Final North Star + input/quality/monetization/guardrail metrics","Metric dictionary: definition, grain, owner, refresh cadence"],
  reviewFocus:"Metrics & causal reasoning" },
{ w:16, phase:5, title:"Instrumentation, funnels, and cohorts", folder:"04-metrics",
  learn:["Events, properties, identities, taxonomy","Conversion funnels and time-to-value","Acquisition & behavioral cohorts","Retention curves & segment comparisons"],
  resources:["UVA Product Analytics and AI","Amplitude Academy + Customer Retention 101"],
  output:["Event taxonomy","Owner onboarding funnel","Homeowner lead funnel","Weekly retention/cohort design","Data-quality checklist"],
  reviewFocus:"Metrics & causal reasoning" },
{ w:17, phase:5, title:"Analysis that changes a decision", folder:"04-metrics", phaseEnd:true,
  learn:["Begin with a decision, not a chart","Observation → possible explanation → test","Account for selection effects, confounding, small samples"],
  resources:["Apply analytics skills from W15–16 directly"],
  output:["Dashboard mockup or working dashboard","1-page analysis memo: decision, evidence, limitations, interpretation, action, next test","Weekly product-health review agenda"],
  reviewFocus:"Metrics & causal reasoning" },

{ w:18, phase:6, title:"Hypotheses and an experiment portfolio", folder:"05-experiments",
  learn:["Turn beliefs into falsifiable hypotheses","Choose discovery, fake-door, concierge, prototype, usability, pricing, or controlled tests","Balance quick wins, optimizations, strategic bets"],
  resources:["UVA Hypothesis-Driven Development","Reforge — public experimentation-system essay"],
  output:["20-item experiment backlog","Impact × uncertainty × cost prioritization","Portfolio split: core optimization / growth / strategic exploration"],
  reviewFocus:"Experiment quality" },
{ w:19, phase:6, title:"Controlled experiment design", folder:"05-experiments",
  learn:["Randomization and control","Primary, secondary, guardrail metrics","Sample size, minimum detectable effect, statistical vs practical significance","Novelty, instrumentation, peeking, multiple-comparison risks"],
  resources:["Udacity — A/B Testing","Real-World PM II — A/B/n material","UVA Product Analytics"],
  output:["Complete A/B test design","Power/sample-size assumptions","Analysis plan written BEFORE seeing results","Simulated results + final recommendation"],
  reviewFocus:"Experiment quality" },
{ w:20, phase:6, title:"An experimentation system", folder:"05-experiments", phaseEnd:true,
  learn:["Idea intake → quality review → prioritization → execution → analysis → documentation → reuse","A single test vs a system that compounds learning","Treat failed hypotheses as information"],
  resources:["Synthesis week — no new named course"],
  output:["Experimentation operating system","Experiment review checklist","Learning repository","Monthly portfolio review format"],
  reviewFocus:"Experiment quality + learning value" },

{ w:21, phase:7, title:"Retention and engagement", folder:"06-growth",
  learn:["Activation and 'aha' behavior","Frequency, depth, breadth, quality of engagement","Logo/user/revenue retention","Churn, resurrection, lifecycle intervention"],
  resources:["Growth Product Manager's Handbook — retention modules","Amplitude — Customer Retention 101","Real-World PM II — cohorts & retention"],
  output:["Activation definition for roofing owners","Retention curve hypotheses","Churn taxonomy","3 lifecycle interventions"],
  reviewFocus:"Metrics & causal reasoning" },
{ w:22, phase:7, title:"Acquisition and growth loops", folder:"06-growth",
  learn:["Why funnels describe conversion but loops explain compounding","Acquisition, engagement, monetization loops","Loop input, action, output, reinvestment, cycle time","Paid, content, sales, referral, marketplace loops"],
  resources:["Reforge — public growth collection","Growth Handbook — acquisition & AARRR material"],
  output:["Current funnel","3 possible growth loops","Selected loop with equation, actors, cycle time, friction, failure modes"],
  reviewFocus:"Strategic logic" },
{ w:23, phase:7, title:"Qualitative and quantitative growth models", folder:"06-growth",
  learn:["Map how users enter, get value, retain, invite, monetize","Translate the map into a simple model","Identify the binding constraint & highest-leverage variable"],
  resources:["Synthesis of all prior growth material"],
  output:["Qualitative growth model","12-month spreadsheet: acquisition, activation, retention, referral, revenue, cost assumptions","Sensitivity analysis","Constraint memo"],
  reviewFocus:"Economics & tradeoffs" },
{ w:24, phase:7, title:"Product-led growth", folder:"06-growth",
  learn:["When self-serve PLG fits vs sales/service assistance","Free trial vs freemium","Activation, product-qualified leads, conversion, expansion","Product tiers and value metrics"],
  resources:["ProductLed Fundamentals","Amplitude — PLG Challenge","Reforge — public Mastering PLG outcome"],
  output:["PLG suitability decision","Proposed self-serve path","PQL definition","Free/paid tier boundaries","Assisted-sales handoff"],
  reviewFocus:"Strategic logic" },
{ w:25, phase:7, title:"Pricing economics and costs", folder:"07-pricing",
  learn:["Fixed and variable cost","Contribution margin","Price floor","Price elasticity & common pricing errors"],
  resources:["UVA/BCG Pricing Strategy — Economics and Costs"],
  output:["Service unit economics","Acquisition & fulfillment cost model","Margin by package & segment"],
  reviewFocus:"Economics & tradeoffs" },
{ w:26, phase:7, title:"Customer value and competition", folder:"07-pricing",
  learn:["Estimate economic and perceived value","Willingness-to-pay research","Segmentation and competitive reference points"],
  resources:["UVA/BCG Pricing Strategy — Customer Value and Market Competition"],
  output:["WTP interview guide","Value model for a small roofing business","Competitive price/value map"],
  reviewFocus:"Evidence quality" },
{ w:27, phase:7, title:"Packaging, monetization, and expansion", folder:"07-pricing", phaseEnd:true,
  learn:["Value metric, packaging, good-better-best tiers, add-ons, discounting, expansion","ARPU, LTV, CAC payback, gross margin, revenue retention"],
  resources:["UVA/BCG — integrated pricing strategy","Growth Handbook — pricing & expansion modules","Real-World PM II — monetization material"],
  output:["3-package design","Pricing page","Monetization model","Pricing decision memo with risks & test plan"],
  reviewFocus:"Economics & tradeoffs" },

{ w:28, phase:8, title:"Marketplace model and cold start", folder:"08-marketplace",
  learn:["Supply and demand roles","Single-player value vs interaction value","Local vs global liquidity","Why a marketplace often must constrain initial geography/category","Supply-first, demand-first, managed-marketplace launch options"],
  resources:["Sharetribe — 10-step guide + initial-supply guide","Reforge — marketplace supply strategy (public)"],
  output:["Compare managed-service / lead-marketplace / managed-marketplace models","Choose 1 city + 1 job type for the exercise","Supply & demand personas","Cold-start sequence"],
  reviewFocus:"Strategic logic" },
{ w:29, phase:8, title:"Liquidity and marketplace health", folder:"08-marketplace",
  learn:["Match rate, fill rate, search-to-contact, time to match, utilization, take rate, repeat rate, leakage","Quality, trust, safety, disintermediation","Balance aggregate growth with local market health"],
  resources:["Sharetribe — launch & scale material","Reforge — public marketplace essays"],
  output:["Marketplace metric tree","Liquidity dashboard","Trust & quality system","Intervention playbook: excess supply / excess demand"],
  reviewFocus:"Metrics & causal reasoning" },
{ w:30, phase:8, title:"Network effects and scaling", folder:"08-marketplace", phaseEnd:true,
  learn:["Same-side, cross-side, data, marketplace, other network effects","Critical mass, density, directionality, clustering, multi-tenanting, negative effects","Distinguish a growth loop from a defensible network effect"],
  resources:["NFX — Network Effects Bible","Sharetribe — scaling guide"],
  output:["Network map","Network-strength scorecard","City expansion sequence","Defensibility memo: what actually improves as the network grows"],
  reviewFocus:"Strategic logic + risks" },

{ w:31, phase:9, title:"AI capabilities, limitations, and opportunities", folder:"09-ai",
  learn:["Generative AI & foundation-model basics","Probabilistic behavior, hallucination, context limits, latency, cost, privacy","Prediction, generation, classification, extraction, recommendation, agentic work","When AI is unnecessary"],
  resources:["DeepLearning.AI — Generative AI for Everyone (free)","Duke — ML Foundations for Product Managers (Coursera)"],
  output:["15 AI opportunities across acquisition, onboarding, campaign ops, lead handling, owner support","Value × feasibility × risk ranking","A 'do not use AI' list"],
  reviewFocus:"Strategic logic + risk" },
{ w:32, phase:9, title:"Knowledge, reasoning, memory, and tools", folder:"09-ai",
  learn:["Prompt-only systems vs RAG","Embeddings, retrieval, vector databases, grounding, citations","Reasoning patterns","Short vs long-term memory","Tool use and orchestration"],
  resources:["DeepLearning.AI — RAG + agent-memory courses (free)","Duke — Managing ML Projects"],
  output:["Architecture for a roofing-business marketing copilot","Data-source inventory & permissions","Model/RAG/tool/memory decisions with tradeoffs","Fallback & human-escalation paths"],
  reviewFocus:"Risk & failure modes" },
{ w:33, phase:9, title:"AI product and business strategy", folder:"09-ai",
  learn:["Where AI changes customer value, cost, speed, experience, defensibility","Model build/buy/partner choices","Price AI functionality","Data, distribution, workflow, learning-loop advantages"],
  resources:["IBM — Building AI-Powered Products (Coursera)","Reforge — public AI Strategy syllabus","SVPG — strategy logic"],
  output:["AI market landscape","AI opportunity portfolio","Selected wedge & right-to-win","Build/buy/partner memo","ROI & commercialization model"],
  reviewFocus:"Strategic logic + economics" },
{ w:34, phase:9, title:"AI prototyping", folder:"09-ai",
  learn:["Prototype the uncertain part of the experience","Separate UX simulation from technical proof","Test desirability before investing in production architecture","Record prompts, tools, versions, cost, latency, failures"],
  resources:["DeepLearning.AI — practical prototyping course","Reforge — public AI Prototyping outcome"],
  output:["Working prototype: a lead-qualification assistant OR owner marketing copilot (this is your AI Audit Tool)","5 user tests","Observed behaviors, failure modes, iteration decision"],
  reviewFocus:"Communication & usability" },
{ w:35, phase:9, title:"Evals, feedback, safety, and agents", folder:"09-ai", phaseEnd:true,
  learn:["Define task success before selecting a model","Golden datasets, rubrics, code-based checks, model judges, human review","Component vs end-to-end evaluation","Error taxonomy, release thresholds, monitoring, regression tests","Agent goals, planning, execution, reflection, safeguards, multi-agent coordination"],
  resources:["DeepLearning.AI — Evaluating AI Agents, Advanced RAG evaluation, Improving Accuracy of LLM Applications, Multi-Agent Systems with CrewAI","Duke — Human Factors in AI"],
  output:["30–50 case golden dataset","Quality rubric and baseline","Error taxonomy","Latency, cost, safety, quality guardrails","Single vs multi-agent decision","Risk register & human-review policy"],
  reviewFocus:"Risk, ethics, failure modes" },

{ w:36, phase:10, title:"Product leadership capstone", folder:"10-final", phaseEnd:true, finalCapstone:true,
  learn:["Connect strategy, discovery, metrics, experiments, growth, economics, marketplace, AI","Communicate a decision while exposing uncertainty and tradeoffs","Define team structure, operating cadence, decision rights"],
  resources:["Synthesis — no new course, this is the capstone week"],
  output:["Assemble the FULL portfolio: brief, research/OST, spec, strategy+workplan, roadmap/OKRs/decisions, metric tree+dashboard+memo, experimentation system, growth loops+model, retention/PLG/pricing/economics, marketplace analysis, AI strategy+prototype+evals+risk register","10-slide executive narrative","FINAL DECISION: keep RoofSpark as managed service, SaaS, marketplace, or hybrid — from evidence, not preference"],
  reviewFocus:"ALL 7 dimensions — full 100-point rubric" },
];

// ─── Templates & rubric (static reference content, from the curriculum doc) ──
const TEMPLATES = [
  { name: "Product Decision Memo", items: ["Decision to make","Why the decision is needed now","User and business outcome","Evidence and its quality","Options considered","Tradeoffs and risks","Decision and confidence","Success and guardrail metrics","Revisit trigger"] },
  { name: "Strategy Memo", items: ["Diagnosis","Target user/segment","Strategic choice","Why this choice can win","Coherent actions and portfolio allocation","Explicit non-goals","Metrics","Risks, assumptions, invalidation conditions"] },
  { name: "Experiment Card", items: ["Decision the experiment informs","Hypothesis","Riskiest assumption","Test and control/comparison","Audience and sample","Primary, secondary, guardrail metrics","Expected effect and stopping rule","Known validity risks","Possible result → action table","Result and reusable learning"] },
  { name: "AI Evaluation Card", items: ["User task","Definition of a good answer/action","Test-set composition","Quality rubric","Automated, model-based, human checks","Safety, latency, cost thresholds","Baseline","Failure taxonomy","Release decision","Monitoring and regression plan"] },
];
const RUBRIC = [
  { dim: "Clear user problem and quality of evidence", pts: 20 },
  { dim: "Strategic logic and explicit choices", pts: 20 },
  { dim: "Metrics and causal reasoning", pts: 15 },
  { dim: "Experiment quality and learning value", pts: 15 },
  { dim: "Economics, constraints, and tradeoffs", pts: 10 },
  { dim: "Risks, ethics, and failure modes", pts: 10 },
  { dim: "Communication and usability of the artifact", pts: 10 },
];
const BUY_LIST = ["Coursera subscription — only while actively completing the named courses","Continuous Discovery Habits — Teresa Torres","Trustworthy Online Controlled Experiments — Kohavi, Tang, Xu","The Cold Start Problem — Andrew Chen","(Optional) ProductLed MBA — only if you need live PLG feedback"];
const AVOID_LIST = ["Completing overlapping beginner certificates","Buying 10 short courses that repeat personas/roadmaps/Agile/prompting","Collecting certificates without producing the assignments","Treating AI prompting as AI product management","Calling referrals a 'network effect' without measuring whether the product improves as participation grows"];

// ─── DAY GENERATOR — 7 days/week, fixed Predict→Learn→Apply→Critique→Teach-back rhythm ──
function buildAllDays() {
  const days = [];
  let d = 0;
  for (const wk of WEEKS) {
    const L = wk.learn, R = wk.resources, O = wk.output;
    d++;
    days.push({ d, w: wk.w, phase: wk.phase, stage: "PREDICT + LEARN",
      rm: 30, bm: 40,
      read: R[0] || "Revisit last week's core resource",
      readHow: `PREDICT first (5 min, before touching the resource): write 5 lines on how you currently think "${wk.title}" works. Don't skip this — it's what makes the learning stick.\n\nThen LEARN: ${R[0] || "review notes"}. Focus on: ${L.slice(0,2).join("; ")}.`,
      build: "Notes: 3 models/decisions/examples you'll reuse",
      buildHow: `Write 3 concrete things from today's resource you'll actually reuse — a model, a decision rule, or a worked example. Not a summary of everything; only what's decision-useful.` });
    d++;
    days.push({ d, w: wk.w, phase: wk.phase, stage: "LEARN",
      rm: 30, bm: 40,
      read: R[1] || R[0] || "Finish yesterday's resource",
      readHow: `Finish the resource. Focus on: ${L.slice(2,4).join("; ") || L.slice(0,2).join("; ")}.`,
      build: "Consolidate notes + list open questions",
      buildHow: `Merge today + yesterday's notes into one page. List 2-3 open questions you still can't answer — these become tomorrow's build questions.` });
    d++;
    days.push({ d, w: wk.w, phase: wk.phase, stage: "APPLY",
      rm: 0, bm: 70, read: "—", readHow: "",
      build: `Start: ${O[0] || "the week's output"}`,
      buildHow: `Begin building "${O[0] || ""}" for RoofSpark. Use this week's concepts directly — don't theorize, produce the actual artifact, even rough.` });
    d++;
    days.push({ d, w: wk.w, phase: wk.phase, stage: "APPLY",
      rm: 0, bm: 70, read: "—", readHow: "",
      build: O[1] ? `Continue: ${O[1]}` : `Continue/deepen: ${O[0] || "yesterday's artifact"}`,
      buildHow: O[1] ? `Build "${O[1]}" — same rigor as yesterday.` : `Push yesterday's artifact further — add the detail you skipped to just get something down.` });
    d++;
    days.push({ d, w: wk.w, phase: wk.phase, stage: "APPLY / POLISH",
      rm: 0, bm: 70, read: "—", readHow: "",
      build: O[2] ? `Build: ${O[2]}` : `Polish: make this week's outputs genuinely usable`,
      buildHow: O[2] ? `Build "${O[2]}".` : `A week isn't complete until its artifact is usable — not just drafted. Tighten wording, fix gaps, make it something you'd actually hand to someone.` });
    d++;
    days.push({ d, w: wk.w, phase: wk.phase, stage: "CRITIQUE + REVISE",
      rm: 0, bm: 70, read: "—", readHow: "",
      build: "Critique your own work, then revise it",
      buildHow: `CRITIQUE (30 min): on "${O[0] || "this week's main artifact"}" — what's the weakest evidence? What alternative did you not consider? What's the strongest objection someone could raise against it?\n\nREVISE (40 min): fix the artifact based on what you just found. Don't skip straight to revising — the critique has to happen first, in writing.` });
    d++;
    const isEnd = !!wk.phaseEnd;
    days.push({ d, w: wk.w, phase: wk.phase, stage: isEnd ? "TEACH-BACK + PHASE REVIEW" : "TEACH-BACK + REVIEW",
      rm: 0, bm: 60, read: "—", readHow: "",
      build: isEnd ? `TEACH-BACK + score + PHASE ${wk.phase} COMPLETE` : "Teach-back + score this week",
      buildHow: `TEACH-BACK (5 min, out loud): explain "${wk.title}" from memory, using a NEW example — not RoofSpark. If you can't do this cold, you don't actually know it yet — reread before moving on.\n\nSCORE (against the 100-pt rubric, target 75+, this week's focus: ${wk.reviewFocus}). File everything into your RoofSpark folder: ${wk.folder}.` + (isEnd ? `\n\nThis closes Phase ${wk.phase} — ${PHASES.find(p=>p.phase===wk.phase)?.name}.` : ""),
      phaseEnd: isEnd });
  }
  return days;
}
const ALL_DAYS = buildAllDays();
const TOTAL_DAYS = ALL_DAYS.length; // 252
const dayTotalMin = (x) => 20 + (x.rm || 0) + (x.bm || 0);

// ─── STORAGE ─────────────────────────────────────────────────
const TRACKER_API = "/api/tracker";
const LOCAL_FALLBACK_KEY = "pm-tracker-36wk-v1";
const emptyState = { days: {}, resources: [], notes: {}, time: {} };
async function loadState() {
  try {
    const response = await fetch(TRACKER_API);
    if (!response.ok) throw new Error("Could not load tracker progress.");
    const data = await response.json();
    return { ...emptyState, ...(data.state || {}) };
  } catch (err) {
    const local = window.localStorage.getItem(LOCAL_FALLBACK_KEY);
    if (local) return { ...emptyState, ...JSON.parse(local) };
    throw err;
  }
}
async function saveState(s) {
  window.localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(s));
  const response = await fetch(TRACKER_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: s })
  });
  if (!response.ok) throw new Error("Could not save tracker progress.");
}

// ─── APP ─────────────────────────────────────────────────────
export default function Tracker() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("today");
  const [openWeek, setOpenWeek] = useState(1);
  const [openPhase, setOpenPhase] = useState(1);
  const [expand, setExpand] = useState({});
  const [resForm, setResForm] = useState({ title: "", url: "", tag: "General" });
  const [timer, setTimer] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const saveTimer = useRef(null);
  const tick = useRef(null);
  const latestState = useRef(null);

  useEffect(() => {
    loadState()
      .then((loaded) => {
        latestState.current = loaded;
        setState(loaded);
      })
      .catch(() => {
        const fallback = { ...emptyState };
        latestState.current = fallback;
        setState(fallback);
      });
  }, []);

  useEffect(() => {
    const flush = () => {
      if (!saveTimer.current || !latestState.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      saveState(latestState.current).catch(() => {});
    };
    const flushWhenHidden = () => {
      if (document.hidden) flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flushWhenHidden);
    };
  }, []);

  useEffect(() => {
    if (timer?.running) {
      tick.current = setInterval(() => setTimer(t => t ? { ...t, elapsed: t.elapsed + 1 } : t), 1000);
      return () => clearInterval(tick.current);
    }
  }, [timer?.running]);

  const scheduleSave = (next) => {
    latestState.current = next;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveState(next);
        saveTimer.current = null;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(s => s === "saved" ? "idle" : s), 1800);
      } catch {
        setSaveStatus("error");
      }
    }, 150);
  };

  const persist = (nextOrUpdater) => {
    setState((prev) => {
      const base = prev || { ...emptyState };
      const next = typeof nextOrUpdater === "function" ? nextOrUpdater(base) : nextOrUpdater;
      scheduleSave(next);
      return next;
    });
  };

  if (!state) return <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.mut, fontFamily: FONT_BODY }}>Loading your journey…</div>;

  const dayState = (d) => state.days[d] || {};
  const isDayDone = (d) => !!dayState(d).done;
  const doneCount = ALL_DAYS.filter(x => isDayDone(x.d)).length;
  const currentDay = ALL_DAYS.find(x => !isDayDone(x.d))?.d ?? TOTAL_DAYS;
  const pct = Math.round((doneCount / TOTAL_DAYS) * 100);
  const totalMinLogged = Object.values(state.time).reduce((a, day) => a + Object.values(day).reduce((b, m) => b + m, 0), 0);
  const hoursLogged = (totalMinLogged / 60).toFixed(1);

  const toggleTask = (d, taskId) => {
    persist((prev) => {
      const ds = { ...(prev.days[d] || {}) };
      const tasks = { ...(ds.tasks || {}) };
      tasks[taskId] = !tasks[taskId];
      return { ...prev, days: { ...prev.days, [d]: { ...ds, tasks } } };
    });
  };
  const setDone = (d, val) => persist((prev) => ({ ...prev, days: { ...prev.days, [d]: { ...(prev.days[d] || {}), done: val } } }));
  const setNote = (d, txt) => persist((prev) => ({ ...prev, notes: { ...prev.notes, [d]: txt } }));
  const logTime = (d, taskId, mins) => {
    if (mins < 1) return;
    persist((prev) => {
      const dayTime = { ...(prev.time[d] || {}) };
      dayTime[taskId] = (dayTime[taskId] || 0) + mins;
      return { ...prev, time: { ...prev.time, [d]: dayTime } };
    });
  };
  const startTimer = (day, taskId, label, targetMin) => {
    if (timer && timer.elapsed >= 60) logTime(timer.day, timer.taskId, Math.round(timer.elapsed / 60));
    setTimer({ day, taskId, label, target: targetMin * 60, elapsed: 0, running: true });
  };
  const stopTimer = (save = true) => {
    if (timer && save && timer.elapsed >= 60) logTime(timer.day, timer.taskId, Math.round(timer.elapsed / 60));
    setTimer(null);
  };
  const addResource = () => {
    if (!resForm.title.trim()) return;
    persist((prev) => ({ ...prev, resources: [{ id: Date.now(), ...resForm }, ...prev.resources] }));
    setResForm({ title: "", url: "", tag: "General" });
  };
  const delResource = (id) => persist((prev) => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));

  const dayObj = ALL_DAYS.find(x => x.d === currentDay);
  const weekObj = WEEKS.find(w => w.w === dayObj.w);
  const phaseObj = PHASES.find(p => p.phase === dayObj.phase);
  const timeToday = state.time[currentDay] ? Object.values(state.time[currentDay]).reduce((a, b) => a + b, 0) : 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const weekDoneFrac = (w) => {
    const wd = ALL_DAYS.filter(x => x.w === w.w);
    return wd.filter(x => isDayDone(x.d)).length / wd.length;
  };
  const phasePct = (p) => {
    const pd = ALL_DAYS.filter(x => x.phase === p.phase);
    return pd.length ? Math.round(pd.filter(x => isDayDone(x.d)).length / pd.length * 100) : 0;
  };

  const Check = ({ on, onClick, accent = T.ember }) => (
    <button onClick={onClick} aria-label={on ? "mark not done" : "mark done"} style={{
      width: 22, height: 22, minWidth: 22, borderRadius: 6, cursor: "pointer",
      border: `2px solid ${on ? accent : T.dim}`, background: on ? accent : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", marginTop: 2,
    }}>
      {on && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5L4.8 9 10 3.5" stroke={T.bg} strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>}
    </button>
  );

  const TimerBtn = ({ day, taskId, label, min }) => {
    const active = timer && timer.day === day && timer.taskId === taskId;
    const logged = state.time[day]?.[taskId] || 0;
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0 }}>
        <span style={{ fontSize: 11, color: T.dim, whiteSpace: "nowrap" }}>{logged > 0 ? `${logged}m done · ` : ""}{min}m</span>
        <button onClick={() => active ? stopTimer(true) : startTimer(day, taskId, label, min)} style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
          border: `1px solid ${active ? T.red : T.ember}55`, background: active ? `${T.red}22` : `${T.ember}18`,
          color: active ? T.red : T.ember, whiteSpace: "nowrap",
        }}>{active ? "■ stop" : "▶ start"}</button>
      </div>
    );
  };

  const TaskRow = ({ day, id, label, how, min, showTimer = true }) => {
    const on = !!dayState(day).tasks?.[id];
    const key = `${day}-${id}`;
    return (
      <div style={{ padding: "8px 0", borderBottom: `1px solid ${T.line}44` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Check on={on} onClick={() => toggleTask(day, id)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <button onClick={() => setExpand(e => ({ ...e, [key]: !e[key] }))} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%" }}>
              <span style={{ fontSize: 14, lineHeight: 1.45, color: on ? T.dim : T.txt, textDecoration: on ? "line-through" : "none" }}>
                {label} <span style={{ color: T.dim, fontSize: 12 }}>{expand[key] ? "▾" : "▸ how"}</span>
              </span>
            </button>
            {expand[key] && how && (
              <div style={{ fontSize: 12.5, color: T.mut, lineHeight: 1.55, marginTop: 5, paddingLeft: 10, borderLeft: `2px solid ${T.ember}44`, whiteSpace: "pre-line" }}>{how}</div>
            )}
          </div>
          {showTimer && <TimerBtn day={day} taskId={id} label={label} min={min} />}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "today", label: "Today" }, { id: "journey", label: "Journey" },
    { id: "skills", label: "Phases" }, { id: "reference", label: "Reference" }, { id: "resources", label: "Yours" },
  ];

  return (
    <div className="tracker-app" style={{ minHeight: "100vh", background: T.bg, color: T.txt, fontFamily: FONT_BODY, paddingBottom: timer ? 150 : 90 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input, textarea, select { font-family: ${FONT_BODY}; }
        ::placeholder { color: ${T.dim}; }
        .tracker-app {
          position: relative;
          isolation: isolate;
          overflow-x: hidden;
        }
        .tracker-app::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(255,107,44,.06), transparent 32%),
            radial-gradient(620px 420px at 86% -80px, rgba(232,177,78,.14), transparent 72%),
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
          background-size: auto, auto, 44px 44px, 44px 44px;
        }
        .tracker-topbar {
          box-shadow: 0 18px 50px rgba(0,0,0,.2);
        }
        .tracker-frame {
          width: min(1680px, calc(100vw - 48px));
          margin: 0 auto;
        }
        .tracker-content {
          padding: 24px 0 108px;
        }
        .tracker-tabs button {
          min-height: 46px;
        }
        @media (min-width: 980px) {
          .tracker-content {
            padding-left: 156px;
            padding-right: 12px;
          }
          .tracker-tabs {
            top: 116px !important;
            bottom: auto !important;
            left: 24px !important;
            right: auto !important;
            width: 116px !important;
            background: rgba(20,17,15,.78) !important;
            border: 1px solid ${T.line} !important;
            border-radius: 16px !important;
            box-shadow: 0 18px 44px rgba(0,0,0,.28);
            overflow: hidden;
          }
          .tracker-tabs > div {
            max-width: none !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .tracker-tabs button {
            padding: 15px 8px !important;
            border-top: none !important;
            border-left-width: 2px !important;
            border-left-style: solid !important;
          }
        }
        @media (max-width: 760px) {
          .tracker-frame {
            width: calc(100vw - 28px);
          }
          .tracker-content {
            padding-top: 18px;
          }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      <div className="tracker-topbar" style={{ padding: "18px 0 12px", borderBottom: `1px solid ${T.line}`, background: `${T.bg}F4`, backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="tracker-frame">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>PM<span style={{ color: T.ember }}>·</span>36<span style={{ color: T.dim, fontWeight: 400, fontSize: 12 }}> wk</span></div>
            <div style={{ fontSize: 11.5, color: T.mut, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>Day <span style={{ color: T.ember, fontWeight: 600 }}>{currentDay}</span>/{TOTAL_DAYS} · Wk {dayObj.w}/36 · {pct}% · <span style={{ color: T.gold }}>{hoursLogged}h</span></span>
              <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap",
                background: saveStatus === "saving" ? `${T.gold}22` : saveStatus === "saved" ? `${T.green}22` : saveStatus === "error" ? `${T.red}22` : "transparent",
                color: saveStatus === "saving" ? T.gold : saveStatus === "saved" ? T.green : saveStatus === "error" ? T.red : T.dim,
                border: saveStatus === "idle" ? "none" : `1px solid ${saveStatus === "saving" ? T.gold : saveStatus === "saved" ? T.green : T.red}44` }}>
                {saveStatus === "saving" ? "● saving…" : saveStatus === "saved" ? "✓ saved" : saveStatus === "error" ? "save failed — local copy kept" : ""}
              </span>
            </div>
          </div>
          {/* 36-week wall, fractional fill per week */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
            {WEEKS.map(w => {
              const frac = weekDoneFrac(w);
              const isCurW = w.w === dayObj.w;
              return (
                <div key={w.w} title={`Week ${w.w}: ${w.title}`} style={{
                  aspectRatio: "1.6", borderRadius: 3, position: "relative", overflow: "hidden",
                  background: T.panel, border: isCurW ? `1.5px solid ${T.ember}` : w.phaseEnd ? `1px solid ${T.gold}55` : `1px solid ${T.line}`,
                }}>
                  <div style={{ position: "absolute", inset: 0, width: `${frac*100}%`, background: frac === 1 ? (w.phaseEnd ? T.gold : T.ember) : T.ember, opacity: frac === 1 ? 1 : 0.55 }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tracker-frame tracker-content">

        {tab === "today" && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: T.mut, textTransform: "uppercase", marginBottom: 6 }}>
              Phase {dayObj.phase} · Week {dayObj.w} — {weekObj.title} <span style={{ color: T.ember }}>· {dayObj.stage}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
              <h1 style={{ fontFamily: FONT_HEAD, fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Day {currentDay}</h1>
              <span style={{ fontSize: 12.5, color: T.mut }}>~{dayTotalMin(dayObj)} min · {timeToday}m logged today</span>
            </div>
            <div style={{ margin: "10px 0 16px", padding: "10px 12px", borderRadius: 10, background: `${T.ember}0D`, border: `1px solid ${T.ember}2A`, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
              <span style={{ color: T.ember, fontWeight: 600 }}>Coach ({phaseObj.name}): </span>{phaseObj.coach}
            </div>

            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: "6px 14px 8px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", color: T.ember, textTransform: "uppercase", fontWeight: 600, padding: "8px 0 4px" }}>Daily drills · 20 min · every day, all 36 weeks</div>
              {DRILLS.map(dr => <TaskRow key={dr.id} day={currentDay} id={dr.id} label={dr.label} how={dr.how} min={dr.min} />)}
            </div>

            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: "6px 14px 8px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", color: T.ember, textTransform: "uppercase", fontWeight: 600, padding: "8px 0 4px" }}>{dayObj.stage} · {(dayObj.rm||0)+(dayObj.bm||0)} min</div>
              {dayObj.rm > 0
                ? <TaskRow day={currentDay} id="read" label={`READ · ${dayObj.read}`} how={dayObj.readHow} min={dayObj.rm} />
                : <div style={{ fontSize: 12.5, color: T.dim, fontStyle: "italic", padding: "8px 0" }}>No new reading today — full slot is build/critique/review.</div>}
              <TaskRow day={currentDay} id="build" label={`${dayObj.read !== "—" ? "BUILD" : "DO"} · ${dayObj.build}`} how={dayObj.buildHow} min={dayObj.bm} />
            </div>

            <textarea value={state.notes[currentDay] || ""} onChange={e => setNote(currentDay, e.target.value)}
              placeholder="Today's log — predictions, notes, artifact drafts, critique findings. Be specific: this becomes your portfolio + interview material."
              rows={3} style={{ width: "100%", background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 12, color: T.txt, fontSize: 14, resize: "vertical", marginBottom: 6 }} />
            <p style={{ fontSize: 11.5, color: T.dim, margin: "0 0 14px" }}>Accountability rule: the log can't be empty on a completed day.</p>

            <button onClick={() => {
              if (!(state.notes[currentDay] || "").trim()) { alert("Write one line in the log first — what did you actually do today?"); return; }
              stopTimer(true); setDone(currentDay, true);
            }} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: dayObj.phaseEnd ? T.gold : T.ember, color: "#1A0E06", fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 16 }}>
              {dayObj.phaseEnd ? `Complete Day ${currentDay} — Phase ${dayObj.phase} finishes today →` : `Complete Day ${currentDay} →`}
            </button>
            <p style={{ fontSize: 12, color: T.dim, textAlign: "center", marginTop: 8 }}>Partial day? Log it honestly, complete anyway. Momentum beats perfection.</p>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: `${T.gold}0F`, border: `1px solid ${T.gold}33`, fontSize: 13, color: T.gold }}>
              Folder: <b>{weekObj.folder}</b> · Review focus: {weekObj.reviewFocus}
            </div>
          </div>
        )}

        {tab === "journey" && (
          <div>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>The 36 weeks</h2>
            <p style={{ color: T.mut, fontSize: 13, margin: "0 0 16px" }}>Grouped by phase. Open any week for the full day-by-day breakdown.</p>
            {PHASES.map(p => {
              const weeksInPhase = WEEKS.filter(w => w.phase === p.phase);
              const pOpen = openPhase === p.phase;
              return (
                <div key={p.phase} style={{ marginBottom: 14 }}>
                  <button onClick={() => setOpenPhase(pOpen ? null : p.phase)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 0", textAlign: "left" }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ember, fontWeight: 600 }}>Phase {p.phase} — {p.name}</span>
                    <span style={{ fontSize: 11, color: T.mut }}>· {phasePct(p)}%</span>
                    <span style={{ marginLeft: "auto", color: T.dim, transform: pOpen ? "rotate(90deg)" : "none" }}>›</span>
                  </button>
                  {pOpen && weeksInPhase.map(w => {
                    const wd = ALL_DAYS.filter(x => x.w === w.w);
                    const dDone = wd.filter(x => isDayDone(x.d)).length;
                    const open = openWeek === w.w;
                    return (
                      <div key={w.w} style={{ background: T.panel, border: `1px solid ${open ? T.ember + "55" : T.line}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
                        <button onClick={() => setOpenWeek(open ? null : w.w)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", color: T.txt, textAlign: "left" }}>
                          <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 14, color: w.phaseEnd ? T.gold : T.txt }}>W{w.w}</span>
                          <span style={{ fontSize: 14, flex: 1 }}>{w.title}</span>
                          <span style={{ fontSize: 12, color: dDone === 7 ? T.green : T.mut }}>{dDone}/7</span>
                          <span style={{ color: T.dim, transform: open ? "rotate(90deg)" : "none" }}>›</span>
                        </button>
                        {open && (
                          <div style={{ borderTop: `1px solid ${T.line}`, padding: "2px 14px 12px" }}>
                            <div style={{ fontSize: 12, color: T.mut, padding: "8px 0" }}>
                              <b style={{ color: T.ember }}>Resources: </b>{w.resources.join(" · ")}
                            </div>
                            {wd.map(x => {
                              const key = `j-${x.d}`;
                              const logged = state.time[x.d] ? Object.values(state.time[x.d]).reduce((a, b) => a + b, 0) : 0;
                              return (
                                <div key={x.d} style={{ padding: "9px 0", borderBottom: `1px solid ${T.line}55` }}>
                                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <Check on={isDayDone(x.d)} onClick={() => setDone(x.d, !isDayDone(x.d))} accent={T.green} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <button onClick={() => setExpand(e => ({ ...e, [key]: !e[key] }))} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%" }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: isDayDone(x.d) ? T.dim : T.txt }}>
                                          Day {x.d} <span style={{ color: T.ember, fontWeight: 500 }}>· {x.stage}</span> <span style={{ color: T.dim, fontWeight: 400, fontSize: 11.5 }}>· ~{dayTotalMin(x)}m{logged ? ` · ${logged}m logged` : ""} {expand[key] ? "▾" : "▸"}</span>
                                        </div>
                                      </button>
                                      {x.read !== "—" && <div style={{ fontSize: 12.5, color: T.mut, marginTop: 2 }}>📖 {x.read}</div>}
                                      <div style={{ fontSize: 12.5, color: T.mut, marginTop: 2 }}>🔨 {x.build}</div>
                                      {expand[key] && (
                                        <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: `2px solid ${T.ember}44` }}>
                                          {x.readHow && <div style={{ fontSize: 12.5, color: T.mut, lineHeight: 1.55, marginBottom: 4, whiteSpace: "pre-line" }}><span style={{ color: T.ember }}>Read: </span>{x.readHow}</div>}
                                          <div style={{ fontSize: 12.5, color: T.mut, lineHeight: 1.55, whiteSpace: "pre-line" }}><span style={{ color: T.ember }}>Do: </span>{x.buildHow}</div>
                                        </div>
                                      )}
                                      {state.notes[x.d] && <div style={{ fontSize: 12, color: T.gold, marginTop: 3, fontStyle: "italic" }}>✎ {state.notes[x.d]}</div>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div style={{ fontSize: 12.5, color: T.gold, paddingTop: 10 }}>Review focus: {w.reviewFocus} · Folder: {w.folder}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {tab === "skills" && (
          <div>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>The 10 phases</h2>
            <p style={{ color: T.mut, fontSize: 13, margin: "0 0 16px" }}>Each phase is a real competency area. Fills as you complete its weeks.</p>
            {PHASES.map(p => {
              const pct2 = phasePct(p);
              return (
                <div key={p.phase} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 14.5 }}>{p.phase}. {p.name}</span>
                    <span style={{ fontSize: 13, color: pct2 === 100 ? T.green : pct2 > 0 ? T.ember : T.dim, fontWeight: 600 }}>{pct2}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: T.panel2, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${pct2}%`, background: pct2 === 100 ? T.green : T.ember, borderRadius: 3, transition: "width .3s" }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>{p.coach}</div>
                  <div style={{ fontSize: 11.5, color: T.dim, marginTop: 5 }}>Weeks {p.weeksRange[0]}–{p.weeksRange[1]} · Folder: {p.folder}</div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "reference" && (
          <div>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Reference</h2>
            <p style={{ color: T.mut, fontSize: 13, margin: "0 0 16px" }}>The 4 required templates, the review rubric, and what to buy vs avoid. Static — always here when you need it.</p>

            <h3 style={{ fontFamily: FONT_HEAD, fontSize: 15, margin: "0 0 8px" }}>Templates</h3>
            {TEMPLATES.map(t => (
              <div key={t.name} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8, color: T.ember }}>{t.name}</div>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.mut, lineHeight: 1.7 }}>
                  {t.items.map((it, i) => <li key={i}>{it}</li>)}
                </ol>
              </div>
            ))}

            <h3 style={{ fontFamily: FONT_HEAD, fontSize: 15, margin: "20px 0 8px" }}>Review Standard — score every phase /100, pass ≥75</h3>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {RUBRIC.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderBottom: i < RUBRIC.length-1 ? `1px solid ${T.line}55` : "none", fontSize: 12.5 }}>
                  <span style={{ color: T.txt }}>{r.dim}</span>
                  <span style={{ color: T.gold, fontWeight: 700 }}>{r.pts}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: FONT_HEAD, fontSize: 15, margin: "20px 0 8px" }}>Buy</h3>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 16px", marginBottom: 16 }}>
              {BUY_LIST.map((b,i) => <div key={i} style={{ fontSize: 12.5, color: T.mut, padding: "5px 0" }}>· {b}</div>)}
            </div>

            <h3 style={{ fontFamily: FONT_HEAD, fontSize: 15, margin: "20px 0 8px" }}>Avoid</h3>
            <div style={{ background: `${T.red}0D`, border: `1px solid ${T.red}33`, borderRadius: 12, padding: "10px 16px" }}>
              {AVOID_LIST.map((a,i) => <div key={i} style={{ fontSize: 12.5, color: T.mut, padding: "5px 0" }}>· {a}</div>)}
            </div>
          </div>
        )}

        {tab === "resources" && (
          <div>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Your resources</h2>
            <p style={{ color: T.mut, fontSize: 13, margin: "0 0 14px" }}>Found something great? Park it here with a tag so the plan grows with you.</p>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <input value={resForm.title} onChange={e => setResForm({ ...resForm, title: e.target.value })} placeholder="Title"
                style={{ width: "100%", background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px", color: T.txt, fontSize: 14, marginBottom: 8 }} />
              <input value={resForm.url} onChange={e => setResForm({ ...resForm, url: e.target.value })} placeholder="Link (optional)"
                style={{ width: "100%", background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px", color: T.txt, fontSize: 14, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <select value={resForm.tag} onChange={e => setResForm({ ...resForm, tag: e.target.value })}
                  style={{ flex: 1, background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px", color: T.txt, fontSize: 14 }}>
                  {["General","Foundations","Discovery","Strategy","Metrics","Experiments","Growth","Pricing","Marketplace","AI PM","Leadership"].map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={addResource} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: T.ember, color: "#1A0E06", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Add</button>
              </div>
            </div>
            {state.resources.length === 0 && <div style={{ textAlign: "center", color: T.dim, fontSize: 13, padding: "26px 0" }}>Nothing saved yet. First good find goes here.</div>}
            {state.resources.map(r => (
              <div key={r.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: T.txt, textDecoration: "none", borderBottom: `1px dotted ${T.ember}` }}>{r.title}</a> : r.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.ember, marginTop: 2 }}>{r.tag}</div>
                </div>
                <button onClick={() => delResource(r.id)} aria-label="delete" style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {timer && (
        <div style={{ position: "fixed", bottom: 54, left: 0, right: 0, zIndex: 25 }}>
          <div className="tracker-frame">
            <div style={{ background: T.panel2, border: `1px solid ${timer.elapsed >= timer.target ? T.green : T.ember}66`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
              <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 22, color: timer.elapsed >= timer.target ? T.green : T.ember, minWidth: 64 }}>{fmt(timer.elapsed)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{timer.label}</div>
                <div style={{ height: 4, borderRadius: 2, background: T.panel, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, timer.elapsed / timer.target * 100)}%`, background: timer.elapsed >= timer.target ? T.green : T.ember, transition: "width 1s linear" }} />
                </div>
              </div>
              <button onClick={() => setTimer(t => ({ ...t, running: !t.running }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.line}`, background: "transparent", color: T.txt, cursor: "pointer", fontSize: 12 }}>{timer.running ? "Pause" : "Resume"}</button>
              <button onClick={() => stopTimer(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: T.ember, color: "#1A0E06", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Log it</button>
            </div>
          </div>
        </div>
      )}

      <div className="tracker-tabs" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${T.bg}F2`, backdropFilter: "blur(10px)", borderTop: `1px solid ${T.line}`, zIndex: 20 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 0 14px", background: "none", border: "none", cursor: "pointer", fontFamily: FONT_HEAD, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.ember : T.mut, borderTop: `2px solid ${tab === t.id ? T.ember : "transparent"}`, borderLeftColor: tab === t.id ? T.ember : "transparent" }}>{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
