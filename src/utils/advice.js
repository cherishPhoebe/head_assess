// 分程度定制建议库 + 权威参考（AAP 体位性斜头指南要点）
// 输入：{ level, shapeType, ageMonths, seeDoctor, redFlags }
// 输出结构化建议：{ ageNote, sleep, tummy, medical, aapRef }

import { ageBand } from '../config.js'

// 按头型分类的睡眠/体位调整建议
const SLEEP_BY_SHAPE = {
  brachy: [
    '仰卧入睡（安全睡眠前提下），清醒时多趴卧，减少后枕持续受压',
    '用毛巾卷/定型垫在监护下辅助头部侧转，避免长期同一侧受压',
    '变换婴儿床朝向，让声光玩具分布在不同侧，引导宝宝主动转头'
  ],
  plagio: [
    '仰卧睡眠时交替宝宝头部朝向（今天朝左、明天朝右）',
    '避免长期同一侧躺卧，喂奶与抱姿左右交替',
    '用发声/镜像玩具引导宝宝转向偏头一侧的对侧'
  ],
  scapho: [
    '仰卧为主，监护下可适当左右侧卧交替，分散头顶前后压力',
    '减少长时间固定在汽车座椅、摇篮、推车中（避免头颅前后挤压）'
  ],
  trigono: [
    '前额形态异常需优先排查骨缝早闭，建议尽早就诊评估',
    '在就医前维持安全仰卧，不做过度居家矫形'
  ],
  normal: [
    '维持仰卧安全睡眠，清醒时多趴卧',
    '定期变换头位与朝向，预防体位性偏头'
  ]
}

// 按年龄分档的清醒趴卧（tummy time）建议
function tummyByAge(age) {
  if (age < 3) {
    return [
      '每日清醒趴卧累计 20–30 分钟，分多次进行（每次数分钟）',
      '在家长视线与监护下进行，宝宝哭闹即停止',
      '可用俯卧撑胸、与宝宝平视互动增加接受度'
    ]
  }
  if (age <= 6) {
    return [
      '每日清醒趴卧累计 60 分钟以上，分多次进行',
      '逐渐增加俯卧时间与游戏，锻炼颈肩与头部对称',
      '俯卧位玩具引导，鼓励抬头与双侧转头'
    ]
  }
  if (age <= 12) {
    return [
      '鼓励 crawl（爬行）与自由活动，自然减少头部局部受压',
      '继续提供趴卧游戏与双侧活动机会',
      '观察偏头是否随活动增加而改善'
    ]
  }
  return [
    '大运动发育期以爬行、独站等活动为主，头型多已稳定',
    '若仍有明显偏头/扁头，建议儿保随访评估'
  ]
}

const AAP_POINTS = [
  '美国儿科学会（AAP）强调：始终让婴儿仰卧睡眠以预防婴儿猝死综合征（SIDS）；头型调整应在清醒趴卧与监护下体位变换中进行，不可为改善头型而改变睡眠姿势。',
  '体位性斜头多在 2–6 月龄显现，多数通过体位调整与清醒趴卧在数月内改善。',
  '若 6 月龄后中重度偏头/扁头无明显改善，或伴面部/眼眶明显不对称，应就诊儿童保健科或小儿神经外科。'
]

export function generateAdvice({ level = 'normal', shapeType = 'normal', ageMonths = 0, seeDoctor = false, redFlags = {} } = {}) {
  const age = Number(ageMonths) || 0
  const band = ageBand(age)

  const ageNote =
    age < 3
      ? `${band}：新生儿头型较圆，偏头/扁头尚未明显，以预防为主。`
      : age <= 6
        ? `${band}：偏头/扁头易显现期，体位调整与趴卧最关键。`
        : age <= 12
          ? `${band}：头型渐趋稳定，持续活动多可改善轻中度。`
          : `${band}：头型基本定型，明显异常建议专业评估。`

  // 睡眠/体位建议
  const sleep = [...(SLEEP_BY_SHAPE[shapeType] || SLEEP_BY_SHAPE.normal)]
  if (redFlags?.suspectedSynostosis) {
    sleep.unshift('⚠️ 疑似颅缝早闭征象，应优先就医评估，居家调整不能替代诊断。')
  }

  // 清醒趴卧
  const tummy = tummyByAge(age)

  // 就医/随访
  const medical = []
  if (seeDoctor || redFlags?.suspectedSynostosis) {
    medical.push('建议尽快就诊小儿神经外科或儿童保健科，排查骨缝早闭等需医疗干预的情况。')
    if (redFlags?.signs?.length) {
      medical.push('可疑征象：' + redFlags.signs.join('；') + '。')
    }
  } else if (level === 'severe') {
    medical.push('重度异常，建议尽快就诊儿童保健科/小儿神经外科评估。')
  } else if (level === 'moderate') {
    medical.push('中度异常，建议 1–2 个月内儿童保健科随访，观察居家调整效果。')
  } else if (level === 'mild') {
    medical.push('轻度异常，以居家体位调整为主，建议下次儿保体检时复查。')
  } else {
    medical.push('暂无明显异常，维持日常护理，常规儿保随访即可。')
  }

  return {
    ageNote,
    sleep,
    tummy,
    medical,
    aapRef: AAP_POINTS
  }
}
