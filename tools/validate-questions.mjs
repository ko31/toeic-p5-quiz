import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultPath = path.resolve(__dirname, "../app/data/questions.json");
const targetPath = path.resolve(process.argv[2] ?? defaultPath);

const NEAR_DUPLICATE_MIN_COUNT = 2;
const CHOICE_PATTERN_WARN_RATE = 0.15;
const TEMPLATE_REUSE_WINDOW = 100;
const PERSON_REUSE_WINDOW = 200;
const COMPANY_LOCATION_REUSE_WINDOW = 150;
const VALID_CATEGORIES = new Set([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "vocabulary",
  "pronoun",
  "other",
]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const EXPECTED_CHOICE_IDS = ["A", "B", "C", "D"];

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeToken(value) {
  return value.toLowerCase().replace(/[^a-z]+/g, "");
}

function countBlankPlaceholders(prompt) {
  return (prompt.match(/_____+/g) ?? []).length;
}

function buildChoiceSetKey(choices) {
  return choices
    .map((choice) => normalizeWhitespace(choice.label.toLowerCase()))
    .sort()
    .join("||");
}

function extractPromptFingerprint(prompt) {
  const lowered = prompt.toLowerCase();
  const withoutQuotedNames = lowered
    .replace(/\b(mr|ms|mrs|dr)\.\s+[a-z-]+\b/g, " person ")
    .replace(/\b[a-z]+(?:works|logistics|retail|systems|foods|media|energy|finance|medical|travel|manufacturing|telecom|supply|motors|design|hotels|insurance|air|security|markets|health|printing|bank|learning)\b/g, " company ")
    .replace(/\b(tokyo|sydney|bangkok|madrid|sapporo|london|seattle|auckland|singapore|taipei|dublin|nagoya|berlin|chicago|manila|seoul|dubai|denver|osaka|toronto|jakarta|fukuoka|paris|austin)\b/g, " location ")
    .replace(/\b(branch|office|headquarters|center|centre|hub|desk|department|room|lab|studio|counter|booth|lounge)\b/g, " place ")
    .replace(/'s\b/g, "")
    .replace(/_____+/g, " blank ");

  return normalizeWhitespace(withoutQuotedNames.replace(/[^a-z ]+/g, " "));
}

function inferChoicePattern(choices) {
  return choices
    .map((choice) => {
      const label = choice.label.toLowerCase().trim();
      if (label.startsWith("more ")) {
        return "more";
      }
      if (label.startsWith("most ")) {
        return "most";
      }
      if (label.endsWith("ly")) {
        return "adverb";
      }
      if (label.endsWith("ness") || label.endsWith("tion") || label.endsWith("sion") || label.endsWith("ity")) {
        return "noun";
      }
      if (label.endsWith("ing")) {
        return "ing";
      }
      if (label.endsWith("ed")) {
        return "past-participle";
      }
      if (label.endsWith("ive") || label.endsWith("al") || label.endsWith("ous") || label.endsWith("ful")) {
        return "adjective";
      }
      return "base";
    })
    .join("/");
}

function inferTemplateKey(prompt) {
  const fingerprint = extractPromptFingerprint(prompt);

  if (fingerprint.includes("asked the") && fingerprint.includes("to handle")) {
    return "asked_to_handle";
  }
  if (fingerprint.includes("worked blank than before")) {
    return "worked_than_before";
  }
  if (fingerprint.includes("be blank to")) {
    return "be_adjective_to";
  }

  return fingerprint
    .split(" ")
    .filter(Boolean)
    .slice(0, 8)
    .join("_");
}

function extractEntities(prompt) {
  const personMatches = [...prompt.matchAll(/\b(Mr|Ms|Mrs|Dr)\.\s+([A-Z][a-zA-Z-]+)/g)].map((match) => match[0]);
  const companyMatches = [...prompt.matchAll(/\b([A-Z][a-zA-Z]+(?:Works|Logistics|Retail|Systems|Foods|Media|Energy|Finance|Medical|Travel|Manufacturing|Telecom|Supply|Motors|Design|Hotels|Insurance|Air|Security|Markets|Health|Printing|Bank|Learning))\b/g)].map((match) => match[1]);
  const locationMatches = [...prompt.matchAll(/\b(Tokyo|Sydney|Bangkok|Madrid|Sapporo|London|Seattle|Auckland|Singapore|Taipei|Dublin|Nagoya|Berlin|Chicago|Manila|Seoul|Dubai|Denver|Osaka|Toronto|Jakarta|Fukuoka|Paris|Austin)\b/g)].map((match) => match[1]);

  return {
    people: personMatches,
    companies: companyMatches,
    locations: locationMatches,
  };
}

function pushIssue(issues, severity, message, relatedIds = []) {
  issues.push({ severity, message, relatedIds });
}

function validateQuestion(question, issues) {
  if (!question || typeof question !== "object") {
    pushIssue(issues, "error", "問題データにオブジェクトではない要素があります。");
    return null;
  }

  const requiredFields = ["id", "prompt", "choices", "correctChoiceId", "explanation", "translationJa"];
  for (const field of requiredFields) {
    if (!(field in question)) {
      pushIssue(issues, "error", `必須フィールドが不足しています: ${field}`, [question.id].filter(Boolean));
    }
  }

  if (!Array.isArray(question.choices) || question.choices.length !== 4) {
    pushIssue(issues, "error", "choices は4件必要です。", [question.id].filter(Boolean));
    return null;
  }

  if (!VALID_CATEGORIES.has(question.category)) {
    pushIssue(issues, "error", `category が不正です: ${question.category}`, [question.id].filter(Boolean));
  }

  if (!VALID_DIFFICULTIES.has(question.difficulty)) {
    pushIssue(issues, "error", `difficulty が不正です: ${question.difficulty}`, [question.id].filter(Boolean));
  }

  if (typeof question.prompt === "string" && countBlankPlaceholders(question.prompt) !== 1) {
    pushIssue(issues, "error", "prompt には空欄プレースホルダーがちょうど1つ必要です。", [question.id]);
  }

  const choiceIdSet = new Set();
  const choiceLabelSet = new Set();
  for (const [index, choice] of question.choices.entries()) {
    if (choiceIdSet.has(choice.id)) {
      pushIssue(issues, "error", `choice id が重複しています: ${choice.id}`, [question.id]);
    }
    choiceIdSet.add(choice.id);

    if (choice.id !== EXPECTED_CHOICE_IDS[index]) {
      pushIssue(issues, "error", "choices の id は A, B, C, D の順である必要があります。", [question.id]);
    }

    const normalizedLabel = normalizeToken(choice.label);
    if (choiceLabelSet.has(normalizedLabel)) {
      pushIssue(issues, "error", `choice label が重複しています: ${choice.label}`, [question.id]);
    }
    choiceLabelSet.add(normalizedLabel);
  }

  if (typeof question.translationJa === "string" && /に関する文脈です|想定した設問/.test(question.translationJa)) {
    pushIssue(issues, "warning", "translationJa にメタ説明が含まれています。", [question.id]);
  }

  return {
    id: question.id,
    category: question.category ?? "unknown",
    prompt: question.prompt ?? "",
    promptFingerprint: extractPromptFingerprint(question.prompt ?? ""),
    templateKey: inferTemplateKey(question.prompt ?? ""),
    choicePattern: inferChoicePattern(question.choices),
    entities: extractEntities(question.prompt ?? ""),
  };
}

function inspectTemplateReuse(annotatedQuestions, issues) {
  const templateHistory = new Map();
  const personHistory = new Map();
  const companyLocationHistory = new Map();

  annotatedQuestions.forEach((question, index) => {
    const previousTemplateIndex = templateHistory.get(question.templateKey);
    if (previousTemplateIndex !== undefined && index - previousTemplateIndex <= TEMPLATE_REUSE_WINDOW) {
      pushIssue(
        issues,
        "warning",
        `templateKey "${question.templateKey}" が短距離で再利用されています。`,
        [annotatedQuestions[previousTemplateIndex].id, question.id],
      );
    }
    templateHistory.set(question.templateKey, index);

    question.entities.people.forEach((person) => {
      const previousIndex = personHistory.get(person);
      if (previousIndex !== undefined && index - previousIndex <= PERSON_REUSE_WINDOW) {
        pushIssue(
          issues,
          "warning",
          `人名 "${person}" が短距離で再利用されています。`,
          [annotatedQuestions[previousIndex].id, question.id],
        );
      }
      personHistory.set(person, index);
    });

    const companies = question.entities.companies.length > 0 ? question.entities.companies : ["<none>"];
    const locations = question.entities.locations.length > 0 ? question.entities.locations : ["<none>"];
    companies.forEach((company) => {
      locations.forEach((location) => {
        const key = `${company}@@${location}`;
        const previousIndex = companyLocationHistory.get(key);
        if (previousIndex !== undefined && index - previousIndex <= COMPANY_LOCATION_REUSE_WINDOW) {
          pushIssue(
            issues,
            "warning",
            `会社名と拠点名の組み合わせ "${company} / ${location}" が短距離で再利用されています。`,
            [annotatedQuestions[previousIndex].id, question.id],
          );
        }
        companyLocationHistory.set(key, index);
      });
    });
  });
}

function inspectPromptDuplicates(annotatedQuestions, issues) {
  const exactGroups = new Map();
  const groups = new Map();

  annotatedQuestions.forEach((question) => {
    const key = question.promptFingerprint;
    const list = groups.get(key) ?? [];
    list.push(question.id);
    groups.set(key, list);

    const exactKey = normalizeWhitespace(question.prompt ?? "");
    const exactList = exactGroups.get(exactKey) ?? [];
    exactList.push(question.id);
    exactGroups.set(exactKey, exactList);
  });

  for (const [prompt, ids] of exactGroups.entries()) {
    if (ids.length >= 2) {
      pushIssue(
        issues,
        "error",
        `完全一致の prompt が重複しています: "${prompt}"`,
        ids,
      );
    }
  }

  for (const [fingerprint, ids] of groups.entries()) {
    if (ids.length >= NEAR_DUPLICATE_MIN_COUNT) {
      pushIssue(
        issues,
        "warning",
        `正規化後の prompt が重複しています: "${fingerprint}"`,
        ids,
      );
    }
  }
}

function inspectChoicePatterns(annotatedQuestions, issues) {
  const perCategory = new Map();

  annotatedQuestions.forEach((question) => {
    const categoryMap = perCategory.get(question.category) ?? new Map();
    const ids = categoryMap.get(question.choicePattern) ?? [];
    ids.push(question.id);
    categoryMap.set(question.choicePattern, ids);
    perCategory.set(question.category, categoryMap);
  });

  for (const [category, patternMap] of perCategory.entries()) {
    const total = [...patternMap.values()].reduce((sum, ids) => sum + ids.length, 0);
    for (const [pattern, ids] of patternMap.entries()) {
      const rate = ids.length / total;
      if (rate > CHOICE_PATTERN_WARN_RATE) {
        pushIssue(
          issues,
          "warning",
          `category "${category}" で choicePattern "${pattern}" が ${(rate * 100).toFixed(1)}% を占めています。`,
          ids.slice(0, 10),
        );
      }
    }
  }
}

function inspectChoiceSetDuplicates(questions, issues) {
  const groups = new Map();

  questions.forEach((question) => {
    if (!Array.isArray(question?.choices) || question.choices.length !== 4) {
      return;
    }
    const key = buildChoiceSetKey(question.choices);
    const ids = groups.get(key) ?? [];
    ids.push(question.id);
    groups.set(key, ids);
  });

  for (const [key, ids] of groups.entries()) {
    if (ids.length >= 2) {
      pushIssue(
        issues,
        "error",
        `完全一致の choice-set が重複しています: "${key}"`,
        ids,
      );
    }
  }
}

function formatIssue(issue) {
  const ids = issue.relatedIds.length > 0 ? ` [${issue.relatedIds.join(", ")}]` : "";
  return `${issue.severity.toUpperCase()}: ${issue.message}${ids}`;
}

function summarizeIssues(issues) {
  const summaryMap = new Map();

  issues.forEach((issue) => {
    const key = `${issue.severity}@@${issue.message}`;
    const current = summaryMap.get(key) ?? {
      severity: issue.severity,
      message: issue.message,
      count: 0,
      sampleIds: [],
    };

    current.count += 1;
    issue.relatedIds.forEach((id) => {
      if (id && current.sampleIds.length < 8 && !current.sampleIds.includes(id)) {
        current.sampleIds.push(id);
      }
    });

    summaryMap.set(key, current);
  });

  return [...summaryMap.values()].sort((left, right) => right.count - left.count);
}

async function main() {
  const raw = await fs.readFile(targetPath, "utf8");
  const questions = JSON.parse(raw);

  if (!Array.isArray(questions)) {
    throw new Error("questions.json のルート要素は配列である必要があります。");
  }

  const issues = [];
  const annotatedQuestions = [];

  questions.forEach((question) => {
    const annotated = validateQuestion(question, issues);
    if (annotated) {
      annotatedQuestions.push(annotated);
    }
  });

  inspectChoiceSetDuplicates(questions, issues);
  inspectPromptDuplicates(annotatedQuestions, issues);
  inspectTemplateReuse(annotatedQuestions, issues);
  inspectChoicePatterns(annotatedQuestions, issues);

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  console.log(`Validated ${questions.length} questions from ${targetPath}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);

  const summaries = summarizeIssues(issues);
  summaries.slice(0, 20).forEach((summary) => {
    const ids = summary.sampleIds.length > 0 ? ` [${summary.sampleIds.join(", ")}]` : "";
    console.log(`${summary.severity.toUpperCase()}: ${summary.message} x${summary.count}${ids}`);
  });

  if (summaries.length > 20) {
    console.log(`... ${summaries.length - 20} more summary row(s) omitted`);
  }

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
