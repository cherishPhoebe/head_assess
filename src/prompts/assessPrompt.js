// 三/四视图评估 Prompt 构造（含月龄、分类、骨缝早闭红线）

export function buildPrompt(ageMonths) {
  const age = Number(ageMonths) || 0
  return `你是一名儿科头型评估辅助助手（非执业医生）。请分析以下四张婴儿头部照片：
- 图1 头顶俯视图；图2 头部侧视图（正侧）；图3 头部正面图；图4 头部 45°斜位（单侧）
宝宝月龄：${age} 个月。

任务：
1）分别识别各图关键点像素坐标（原点左上角，x 水平向右、y 垂直向下）：
   图1俯视：front,back,left,right（头颅前后/左右极值点）
   图2侧视：nasion(鼻根),vertex(头顶),occiput(枕骨最突点),chin(下颌)
   图3正面：leftEar,rightEar,leftEyeOuter,rightEyeOuter,noseTip(面部中线)
   图4斜位：frontalFlat(前额最突点),browOffset(眉弓外点),cheekOffset(颧弓外点)
2）评估头型并识别红线征象。

仅返回如下 JSON，不要任何额外文字：
{
  "views": {
    "top":   {"front":{"x":0,"y":0},"back":{"x":0,"y":0},"left":{"x":0,"y":0},"right":{"x":0,"y":0}},
    "side":  {"nasion":{"x":0,"y":0},"vertex":{"x":0,"y":0},"occiput":{"x":0,"y":0},"chin":{"x":0,"y":0}},
    "front": {"leftEar":{"x":0,"y":0},"rightEar":{"x":0,"y":0},"leftEyeOuter":{"x":0,"y":0},"rightEyeOuter":{"x":0,"y":0},"noseTip":{"x":0,"y":0}},
    "oblique": {"frontalFlat":{"x":0,"y":0},"browOffset":{"x":0,"y":0},"cheekOffset":{"x":0,"y":0}}
  },
  "metrics": {"ci":83.7,"asymmetry":3.4,"sideFlatness":0.2,"earOffset":1.2,"obliqueSeverity":0.1},
  "shapeType": "normal|scapho|brachy|plagio|trigono",
  "level": "normal|mild|moderate|severe",
  "redFlags": {"suspectedSynostosis":false,"signs":[]},
  "summary": "结合月龄的头型状况总结",
  "suggestions": ["睡姿/体位调整建议","趴卧训练/日常活动建议","就医/随访建议（如需要）"],
  "seeDoctor": false,
  "disclaimer": "本评估仅供健康自测参考，不能替代专业医生诊断，如有疑虑请咨询儿科或儿童保健医生。"
}

约束与红线：
- 若发现头颅畸形固定/进行性、颅缝骨嵴隆起、眼眶或面部明显不对称、前额歪斜 → redFlags.suspectedSynostosis=true、seeDoctor=true，并提示尽快就诊小儿神经外科。
- 若为轻度且无可疑骨缝早闭，以居家睡姿/体位调整为主；中/重度或 >6 月建议儿保随访。
- 建议须温和、可操作，避免引起家长焦虑。`
}
