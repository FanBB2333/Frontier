// In-browser stand-in for the backend: every `api()` call is answered here when VITE_API_MOCK
// is not "false". The data is synthetic (an LLM-response review task) and lives in
// localStorage, so edits survive a reload. Demo accounts use their username as password.
// `?as=<username>` in the URL signs that account in, for embedding a populated demo.

import { APP_ID } from "@/lib/app"
import {
  countChanges,
  countIssues,
  completenessError,
  initialState,
} from "@/lib/annotation"
import {
  ApiError,
  type Annotation,
  type ApiInit,
  type CheckDef,
  type EditState,
  type Overview,
  type Role,
  type SampleResponse,
  type SampleView,
  type SaveResponse,
  type TaskItem,
  type TaskStatus,
  type User,
  type UserStats,
} from "@/lib/api"

const DB_KEY = `${APP_ID}:mock-db`
const SESSION_KEY = `${APP_ID}:mock-session`
const DB_VERSION = 1

interface Db {
  version: number
  users: (User & { password: string })[]
  samples: SampleView[]
  assignments: Record<string, number>
  annotations: Record<string, Annotation>
}

// ---------- sample content ----------

const CHECKS: CheckDef[] = [
  {
    id: "accuracy",
    label: "事实准确",
    hint: "回复中的事实、数字与推理是否正确",
    options: [
      { value: "ok", label: "准确" },
      { value: "wrong", label: "有误" },
      { value: "unsure", label: "无法判断" },
    ],
    issues: ["wrong"],
  },
  {
    id: "instruction",
    label: "遵循指令",
    hint: "是否完成了用户要求的格式、字数与范围",
    options: [
      { value: "full", label: "完全" },
      { value: "partial", label: "部分" },
      { value: "none", label: "未遵循" },
    ],
    issues: ["partial", "none"],
  },
  {
    id: "safety",
    label: "安全性",
    options: [
      { value: "safe", label: "安全" },
      { value: "risky", label: "有风险" },
    ],
    issues: ["risky"],
  },
  {
    id: "style",
    label: "表达",
    hint: "语气、结构与长度是否合适",
    options: [
      { value: "good", label: "合适" },
      { value: "fix", label: "需调整" },
    ],
    issues: ["fix"],
  },
]

const INTENTS = ["知识问答", "代码", "写作", "数学", "翻译", "生活建议", "摘要"]

interface Seed {
  category: string
  q: string
  a: string
  summary: string
  /** A corrected reply some annotators already wrote, and which check it fails. */
  fix?: { a: string; check: string; answer: string; note: string }
}

const SEEDS: Seed[] = [
  {
    category: "代码",
    q: "用 Python 写一个函数，判断字符串是否为回文，忽略大小写和标点。",
    a: '可以先过滤出字母和数字，再统一小写后与反转结果比较：\n\ndef is_palindrome(s):\n    t = [c.lower() for c in s if c.isalnum()]\n    return t == t[::-1]\n\n例如 is_palindrome("A man, a plan, a canal: Panama") 返回 True。',
    summary: "过滤非字母数字后比较正反序列",
  },
  {
    category: "知识问答",
    q: "光合作用的光反应和暗反应分别发生在叶绿体的什么部位？",
    a: "光反应发生在叶绿体的类囊体薄膜上，产生 ATP、NADPH 和氧气；暗反应（卡尔文循环）发生在叶绿体基质中，利用光反应的产物固定二氧化碳。",
    summary: "光反应在类囊体薄膜，暗反应在基质",
  },
  {
    category: "写作",
    q: "帮我写一段 80 字左右的产品更新公告，主题是新增深色模式。",
    a: "【更新公告】应大家呼声，我们上线了深色模式！在「设置 → 外观」中即可切换，也可以跟随系统自动变化。深色界面在夜间更护眼，也更省电。欢迎体验并告诉我们你的感受。",
    summary: "新增深色模式的更新公告",
  },
  {
    category: "数学",
    q: "一个水池单开进水管 6 小时注满，单开出水管 9 小时放空。两管同时打开，多久能注满？",
    a: "进水效率为每小时 1/6，出水效率为每小时 1/9。同时打开时每小时净注入 1/6 − 1/9 = 1/18，所以需要 18 小时注满。",
    summary: "净效率 1/18，需 18 小时",
  },
  {
    category: "知识问答",
    q: "长城在太空中用肉眼能看到吗？",
    a: "能。长城是唯一能在太空中用肉眼看到的人造建筑。",
    summary: "回答长城能否从太空看到",
    fix: {
      a: "通常不能。长城虽然很长，但宽度只有几米、颜色与周围地表接近，宇航员在近地轨道上一般无法用肉眼分辨。所谓「唯一可见的人造建筑」是流传很广的误解。",
      check: "accuracy",
      answer: "wrong",
      note: "原回复复述了常见误解，已改写为正确结论。",
    },
  },
  {
    category: "代码",
    q: "解释一下 JavaScript 中 == 和 === 的区别。",
    a: '== 会在比较前做类型转换，例如 0 == "0" 为 true；=== 不做类型转换，类型不同直接返回 false。日常开发中建议优先使用 ===，避免隐式转换带来的意外结果。',
    summary: "== 会做类型转换，=== 不会",
  },
  {
    category: "生活建议",
    q: "第一次跑半程马拉松，赛前一周应该怎么安排训练？",
    a: "赛前一周以减量为主：前几天安排 2～3 次 5～8 公里的轻松跑，中间穿插一次短距离配速跑找感觉；赛前两天休息或慢跑 3 公里。同时保证睡眠，适当增加碳水摄入，不要尝试新的装备和补给。",
    summary: "赛前一周减量、保证休息与补给",
  },
  {
    category: "数学",
    q: "求 1 到 100 中所有 3 的倍数之和。",
    a: "3 的倍数为 3, 6, …, 99，共 33 个。和为 3 × (1 + 2 + … + 33) = 3 × 561 = 1683。",
    summary: "33 项等差数列求和得 1683",
  },
  {
    category: "翻译",
    q: "把 “The quick brown fox jumps over the lazy dog” 翻译成中文，并说明这句话常用来做什么。",
    a: "敏捷的棕色狐狸跳过了那只懒狗。",
    summary: "翻译全字母句并说明用途",
    fix: {
      a: "译文：敏捷的棕色狐狸跳过了那只懒狗。\n用途：这句话包含全部 26 个英文字母，常用于展示字体效果、测试键盘和打字练习。",
      check: "instruction",
      answer: "partial",
      note: "原回复漏掉了用途说明。",
    },
  },
  {
    category: "写作",
    q: "给一家社区咖啡店起 3 个店名，风格要简洁。",
    a: "1. 拐角\n2. 慢半拍\n3. 日常豆",
    summary: "三个简洁的咖啡店名",
  },
  {
    category: "摘要",
    q: "用一句话概括：城市更新不再只是拆旧建新，而是更注重保留街区肌理、改善公共空间，并让原住居民参与决策。",
    a: "城市更新正从大拆大建转向保留街区特色、改善公共空间和居民共同参与。",
    summary: "城市更新转向保护与共建",
  },
  {
    category: "知识问答",
    q: "怎么查看自己电脑的 IP 地址？",
    a: "Windows：打开命令提示符输入 ipconfig，查看「IPv4 地址」。macOS：打开「系统设置 → 网络」，选择当前连接即可看到；也可以在终端输入 ipconfig getifaddr en0。",
    summary: "分系统说明查看本机 IP 的方法",
  },
  {
    category: "代码",
    q: "SQL 里 WHERE 和 HAVING 有什么区别？",
    a: "WHERE 在分组前过滤行，不能使用聚合函数；HAVING 在 GROUP BY 之后过滤分组，可以使用聚合函数，例如 HAVING COUNT(*) > 5。",
    summary: "WHERE 过滤行，HAVING 过滤分组",
  },
  {
    category: "写作",
    q: "写一句适合放在读书会海报上的标语，不超过 15 个字。",
    a: "每月一本书，和一群愿意慢下来的人，一起在周末的午后聊聊那些打动过我们的句子。",
    summary: "读书会海报标语",
    fix: {
      a: "一本书，一群人，一个下午。",
      check: "instruction",
      answer: "none",
      note: "原句远超 15 字，已压缩。",
    },
  },
]

const USERS: { username: string; role: Role }[] = [
  { username: "admin", role: "admin" },
  { username: "alice", role: "annotator" },
  { username: "bob", role: "annotator" },
  { username: "carol", role: "annotator" },
]

const SAMPLES_PER_ROUND = SEEDS.length
const ROUNDS = 3
// [username, first idx, last idx, how many done, in progress, discarded]
const PLAN: [string, number, number, number, number, number][] = [
  ["admin", 1, 12, 4, 2, 0],
  ["alice", 13, 24, 9, 2, 0],
  ["bob", 25, 36, 6, 2, 1],
  ["carol", 37, 39, 1, 0, 0],
]

const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString()

function buildSample(idx: number): SampleView {
  const seed = SEEDS[(idx - 1) % SAMPLES_PER_ROUND]
  const round = Math.floor((idx - 1) / SAMPLES_PER_ROUND)
  const model = ["model-a", "model-b", "model-c"][round % 3]
  return {
    id: `s-${String(idx).padStart(4, "0")}`,
    idx,
    title: seed.q,
    category: seed.category,
    badges: [model, round === 0 ? "单轮" : "复核"],
    facts: [
      { label: "来源", value: `synthetic-v${round + 1}` },
      { label: "模型", value: model },
      { label: "语言", value: "zh-CN" },
      { label: "回复字数", value: String(seed.a.length) },
    ],
    conversation: [
      { role: "user", text: seed.q },
      { role: "assistant", text: seed.a },
    ],
    fields: [
      {
        key: "reply",
        label: "参考回复",
        value: seed.a,
        multiline: true,
        hint: "修改为你认为合格的回复；未改动则视为原回复合格",
      },
      {
        key: "intent",
        label: "意图分类",
        value: seed.category,
        options: INTENTS,
      },
      { key: "summary", label: "一句话摘要", value: seed.summary },
    ],
    checks: CHECKS,
  }
}

function seededAnswers(seed: Seed, done: boolean): EditState["checks"] {
  if (!done) return { accuracy: "ok" }
  const answers: EditState["checks"] = {
    accuracy: "ok",
    instruction: "full",
    safety: "safe",
    style: "good",
  }
  if (seed.fix) answers[seed.fix.check] = seed.fix.answer
  return answers
}

function seedDb(): Db {
  const users = USERS.map((u, i) => ({
    id: i + 1,
    username: u.username,
    password: u.username,
    role: u.role,
    disabled: false,
    created_at: minutesAgo(60 * 24 * 30),
    last_seen_at: minutesAgo(10 + i * 37),
  }))
  const samples = Array.from({ length: SAMPLES_PER_ROUND * ROUNDS }, (_, i) =>
    buildSample(i + 1)
  )
  const assignments: Db["assignments"] = {}
  const annotations: Db["annotations"] = {}
  let minute = 8
  for (const [username, first, last, done, progress, discarded] of PLAN) {
    const user = users.find((u) => u.username === username)!
    for (let idx = first; idx <= last; idx++) {
      const sample = samples[idx - 1]
      assignments[sample.id] = user.id
      const k = idx - first
      if (k >= done + progress + discarded) continue
      const seed = SEEDS[(idx - 1) % SAMPLES_PER_ROUND]
      const isDone = k < done
      const isDiscarded = k >= done + progress
      const state = initialState(sample)
      state.checks = seededAnswers(seed, isDone)
      if (isDone && seed.fix) {
        state.fields.reply = seed.fix.a
        state.note = seed.fix.note
      }
      minute += 160 + ((idx * 97) % 560)
      annotations[sample.id] = {
        sample_id: sample.id,
        user_id: user.id,
        status: isDone ? "done" : "in_progress",
        discarded: isDiscarded,
        discard_reason: isDiscarded ? "问题本身含糊，无法判断期望回复" : "",
        state,
        changes: countChanges(sample, state),
        issues: countIssues(sample, state),
        version: 1,
        updated_at: minutesAgo(minute),
      }
    }
  }
  return { version: DB_VERSION, users, samples, assignments, annotations }
}

// ---------- storage ----------

let memory: Db | null = null

function load(): Db {
  if (memory) return memory
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(DB_KEY) ?? "null"
    ) as Db | null
    if (saved?.version === DB_VERSION) return (memory = saved)
  } catch {
    // Unreadable or blocked storage: start from fresh sample data.
  }
  return (memory = seedDb())
}

function persist(db: Db) {
  memory = db
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // Kept in memory for this page only.
  }
}

/** Throws away all edits and restores the sample data. */
export function resetMockData() {
  memory = null
  try {
    window.localStorage.removeItem(DB_KEY)
  } catch {
    // Nothing persisted.
  }
}

let memorySession: number | null = null

function sessionUser(db: Db) {
  let id = memorySession
  try {
    id = Number(window.localStorage.getItem(SESSION_KEY)) || null
  } catch {
    // Storage blocked: the session only lives in memory.
  }
  return db.users.find((u) => u.id === id && !u.disabled) ?? null
}

function setSession(id: number | null) {
  memorySession = id
  try {
    if (id === null) window.localStorage.removeItem(SESSION_KEY)
    else window.localStorage.setItem(SESSION_KEY, String(id))
  } catch {
    // Session lasts until reload.
  }
}

// Sign in the account named by `?as=` once, then drop the parameter from the address bar.
;(() => {
  const params = new URLSearchParams(window.location.search)
  const as = params.get("as")
  if (!as) return
  const user = load().users.find((u) => u.username === as && !u.disabled)
  if (user) setSession(user.id)
  params.delete("as")
  const query = params.toString()
  window.history.replaceState(
    null,
    "",
    window.location.pathname + (query ? `?${query}` : "") + window.location.hash
  )
})()

// ---------- handlers ----------

const publicUser = (u: Db["users"][number]): User => ({
  id: u.id,
  username: u.username,
  role: u.role,
  disabled: u.disabled,
  created_at: u.created_at,
  last_seen_at: u.last_seen_at,
})

function taskOf(db: Db, sample: SampleView, userId?: number): TaskItem {
  const assignee = db.assignments[sample.id]
  const a = db.annotations[sample.id]
  const own =
    a && (userId === undefined || a.user_id === userId) ? a : undefined
  let status: TaskItem["status"] = assignee ? "todo" : "unassigned"
  if (own) status = own.discarded ? "discarded" : own.status
  return {
    id: sample.id,
    idx: sample.idx,
    title: sample.title,
    category: sample.category,
    status,
    changes: own?.changes ?? 0,
    issues: own?.issues ?? 0,
    updated_at: own?.updated_at ?? null,
    assignee_id: assignee,
  }
}

function statusOf(db: Db, sampleId: string): TaskStatus {
  const a = db.annotations[sampleId]
  if (!a) return "todo"
  return a.discarded ? "discarded" : a.status
}

function userStats(db: Db, user: Db["users"][number]): UserStats {
  const ids = Object.keys(db.assignments).filter(
    (id) => db.assignments[id] === user.id
  )
  const count = (s: TaskStatus) =>
    ids.filter((id) => statusOf(db, id) === s).length
  const anns = ids.map((id) => db.annotations[id]).filter(Boolean)
  return {
    ...publicUser(user),
    assigned: ids.length,
    todo: count("todo"),
    in_progress: count("in_progress"),
    done: count("done"),
    discarded: count("discarded"),
    modified: anns.filter((a) => !a.discarded && a.changes > 0).length,
    issues: anns.filter((a) => !a.discarded && a.issues > 0).length,
    last_update:
      anns
        .map((a) => a.updated_at)
        .sort()
        .at(-1) ?? null,
  }
}

function overview(db: Db): Overview {
  const assignedIds = Object.keys(db.assignments)
  const status_counts: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    done: 0,
    discarded: 0,
  }
  for (const id of assignedIds) status_counts[statusOf(db, id)]++
  const anns = Object.values(db.annotations)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daily = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(today.getTime() - (13 - i) * 86_400_000)
    const next = day.getTime() + 86_400_000
    const done = anns.filter(
      (a) =>
        a.status === "done" &&
        !a.discarded &&
        +new Date(a.updated_at) >= +day &&
        +new Date(a.updated_at) < next
    ).length
    return { date: day.toISOString().slice(0, 10), done }
  })
  return {
    total: db.samples.length,
    assigned: assignedIds.length,
    unassigned: db.samples.length - assignedIds.length,
    status_counts,
    modified: anns.filter((a) => !a.discarded && a.changes > 0).length,
    issues: anns.filter((a) => !a.discarded && a.issues > 0).length,
    users: db.users.map((u) => userStats(db, u)),
    daily,
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const fail = (status: number, error: string, extra: object = {}): never => {
  throw new ApiError(status, error, { error, ...extra })
}

type Body = Record<string, unknown>

export async function mockApi<T>(path: string, init: ApiInit = {}): Promise<T> {
  await sleep(120 + Math.random() * 160)
  const method = (init.method ?? "GET").toUpperCase()
  const body = (init.json ?? {}) as Body
  const db = load()
  const route = `${method} ${path.split("?")[0]}`
  const me = sessionUser(db)

  if (route === "POST login") {
    const user = db.users.find((u) => u.username === body.username)
    if (!user || user.password !== body.password) fail(401, "用户名或密码错误")
    if (user!.disabled) fail(403, "该账号已停用")
    user!.last_seen_at = new Date().toISOString()
    persist(db)
    setSession(user!.id)
    return publicUser(user!) as T
  }
  if (route === "POST logout") {
    setSession(null)
    return null as T
  }
  if (!me) return fail(401, "请先登录")

  if (route === "GET me") return publicUser(me) as T

  if (route === "POST me/password") {
    if (body.old_password !== me.password) fail(400, "当前密码不正确")
    if (String(body.new_password ?? "").length < 8) fail(400, "新密码至少 8 位")
    me.password = String(body.new_password)
    persist(db)
    return null as T
  }

  if (route === "GET tasks") {
    const items = db.samples
      .filter((s) => db.assignments[s.id] === me.id)
      .map((s) => taskOf(db, s, me.id))
    return { items } as T
  }

  let m = path.match(/^samples\/([^/?]+)(\/annotation)?$/)
  if (m) {
    const sample = db.samples.find((s) => s.id === decodeURIComponent(m![1]))
    if (!sample) return fail(404, "样本不存在")
    const assigneeId = db.assignments[sample.id]
    const assignee = db.users.find((u) => u.id === assigneeId)
    const mine = assigneeId === me.id
    if (!mine && me.role !== "admin") fail(403, "没有权限查看该样本")

    if (method === "GET" && !m[2]) {
      const resp: SampleResponse = {
        sample,
        annotation: db.annotations[sample.id] ?? null,
        assignee: assignee
          ? { id: assignee.id, username: assignee.username }
          : null,
        readonly: !mine,
      }
      return resp as T
    }
    if (method === "PUT" && m[2]) {
      if (!mine) fail(403, "只能修改分配给自己的样本")
      const current = db.annotations[sample.id]
      if ((current?.version ?? 0) !== body.base_version) {
        fail(409, "该样本已在其他页面更新，已载入最新内容", {
          annotation: current ?? null,
        })
      }
      const state = body.state as EditState
      const status = body.status === "done" ? "done" : "in_progress"
      if (status === "done" && !body.discarded) {
        const err = completenessError(sample, state)
        if (err) fail(422, err)
      }
      const annotation: Annotation = {
        sample_id: sample.id,
        user_id: me.id,
        status,
        discarded: Boolean(body.discarded),
        discard_reason: String(body.discard_reason ?? ""),
        state,
        changes: countChanges(sample, state),
        issues: countIssues(sample, state),
        version: (current?.version ?? 0) + 1,
        updated_at: new Date().toISOString(),
      }
      db.annotations[sample.id] = annotation
      persist(db)
      return {
        annotation,
        task: taskOf(db, sample, me.id),
      } satisfies SaveResponse as T
    }
  }

  if (me.role !== "admin") return fail(403, "需要管理员权限")

  if (route === "GET admin/overview") return overview(db) as T

  if (route === "POST admin/users") {
    const username = String(body.username ?? "").trim()
    if (!/^[a-z0-9_.-]{2,32}$/i.test(username))
      fail(400, "用户名需为 2–32 位字母、数字或 _ . -")
    if (db.users.some((u) => u.username === username)) fail(409, "用户名已存在")
    if (String(body.password ?? "").length < 8) fail(400, "初始密码至少 8 位")
    const user = {
      id: Math.max(...db.users.map((u) => u.id)) + 1,
      username,
      password: String(body.password),
      role: body.role === "admin" ? ("admin" as const) : ("annotator" as const),
      disabled: false,
      created_at: new Date().toISOString(),
      last_seen_at: null,
    }
    db.users.push(user)
    persist(db)
    return publicUser(user) as T
  }

  m = path.match(/^admin\/users\/(\d+)$/)
  if (m && method === "PATCH") {
    const user = db.users.find((u) => u.id === Number(m![1]))
    if (!user) return fail(404, "用户不存在")
    if (
      user.id === me.id &&
      (body.disabled === true || body.role === "annotator")
    )
      fail(400, "不能停用或降级自己的账号")
    if (typeof body.disabled === "boolean") user.disabled = body.disabled
    if (body.role === "admin" || body.role === "annotator")
      user.role = body.role
    persist(db)
    return publicUser(user) as T
  }

  return fail(404, `未知接口：${route}`)
}
