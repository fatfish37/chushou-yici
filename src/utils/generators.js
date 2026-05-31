function clean(value) {
  return String(value || "").trim();
}

function sentence(value, fallback) {
  const text = clean(value || fallback);
  if (!text) return fallback;
  return /[。！？?!]$/.test(text) ? text : `${text}。`;
}

function question(value, fallback) {
  const text = clean(value || fallback);
  if (!text) return fallback;
  return /[。！？?!]$/.test(text) ? text : `${text}？`;
}

export function generateCard(mode, form) {
  if (mode === "person") {
    return generatePersonCard(form);
  }

  if (mode === "publish") {
    return generatePublishCard(form);
  }

  return generateOfflineCard(form);
}

export function generateDowngradedAction(mode, form) {
  if (mode === "person") {
    return downgradePerson(form);
  }

  if (mode === "publish") {
    return downgradePublish(form);
  }

  return downgradeOffline(form);
}

function generatePersonCard(form) {
  const idea = sentence(form.currentIdea, "这个想法");
  const request = normalizePersonRequest(form.minimumRequest);

  return [
    {
      label: "极短版",
      text: `我有个很早期的想法想请你判断一句：${idea}这事你第一反应值得继续吗？`,
    },
    {
      label: "正常版",
      text: `我最近在想一个小方案：${idea}还没准备做完整版本，想先请你帮我判断一句：${request}不合适也可以直接说。`,
    },
    {
      label: "更礼貌版",
      text: `想请你帮我看一个很早期的想法：${idea}暂时不用完整反馈，只想请你从你的角度判断一下：${request}`,
    },
  ];
}

function normalizePersonRequest(value) {
  const request = clean(value);

  if (!request || request.includes("值得继续")) {
    return "这事你第一反应值得继续吗？";
  }
  if (request.includes("看一页")) {
    return "你愿不愿意看一页简版思路？";
  }
  if (request.includes("约")) {
    return "你是否方便约 20 分钟聊一下？";
  }
  if (request.includes("推荐")) {
    return "你能不能推荐一个更合适的人？";
  }
  if (request.includes("反馈")) {
    return "你第一反应是什么？";
  }
  if (request.includes("试用")) {
    return "你愿不愿意试用一次？";
  }
  if (request.includes("不靠谱")) {
    return "你觉得哪里最不靠谱？";
  }
  if (request.includes("报价") || request.includes("条件")) {
    return "大概报价或条件是什么？";
  }
  if (request.includes("兴趣")) {
    return "你有没有兴趣进入下一步？";
  }

  return question(request, "这事你第一反应值得继续吗？");
}

function generatePublishCard(form) {
  const idea = sentence(form.currentIdea, "我要发布一个不完整版本");
  const scene = clean(form.targetActionScene) || "公开/提交";
  const minimum = clean(form.minimumPublishVersion) || "只发一个短版";

  return [
    {
      label: "标准版",
      text: `我先完成一次${scene}：${idea}这次不追求完整，只做到「${minimum}」。让真实反馈决定下一步。`,
    },
    {
      label: "短版",
      text: `先${scene}：${idea}不再等完整版。`,
    },
    {
      label: "轻量版",
      text: `今天只做一件事：${minimum}没有现实发生，就不算进展。`,
    },
  ];
}

function generateOfflineCard(form) {
  const idea = sentence(form.currentIdea, "完成一次现实动作");
  const scene = clean(form.targetActionScene) || "完成第一步现实动作";
  const minimum = clean(form.minimumOfflineVersion) || "只完成第一步";
  const coreQuestion =
    scene.includes("询价") || idea.includes("供应商")
      ? "这个产品最小起订量和样品价是多少？"
      : "现在能完成的最小一步是什么？";

  return [
    {
      label: "一句话动作说明",
      text: `我要完成一次现实动作：${idea}`,
    },
    {
      label: "最低现实动作",
      text: sentence(minimum, "只完成第一步"),
    },
    {
      label: "立即执行版",
      text: `现在就${scene}，只问一句：${coreQuestion}`,
    },
    {
      label: "更轻版本",
      text: "先只找到一个联系人、入口、地址或链接，并保存下来。",
    },
    {
      label: "最低到不能再低版本",
      text: "现在打开通讯录、网页或地图，搜索一个相关名称，不做任何判断。",
    },
  ];
}

function downgradePerson(form) {
  const request = clean(form.minimumRequest);
  if (request.includes("约")) {
    return "我先发你一页简版想法，你方便时帮我判断一句这个方向值不值得继续就行。";
  }
  if (request.includes("试用")) {
    return "你不用完整试用，只要帮我看一下这个东西第一眼是否能看懂。";
  }
  if (request.includes("推荐")) {
    return "你不用介绍我认识对方，只要告诉我一个可能更合适的人名就行。";
  }
  if (request.includes("报价") || request.includes("条件")) {
    return "不用完整报价，只告诉我一个大概范围或判断标准就行。";
  }
  return "把请求降成一句判断：你第一反应觉得这件事值得继续吗？";
}

function downgradePublish(form) {
  const scene = clean(form.targetActionScene);
  if (scene.includes("小红书")) {
    return "先发一条朋友圈，测试这句话有没有人有共鸣。";
  }
  if (scene.includes("方案")) {
    return "先提交一页简版，问对方是否值得继续展开。";
  }
  if (scene.includes("简历")) {
    return "先只投 1 个岗位，不再调整整份简历。";
  }
  if (scene.includes("测试版")) {
    return "先发给 1 个朋友试用，不公开发布。";
  }
  return "先发一个只包含一句话的版本，不配图，不排版，不解释。";
}

function downgradeOffline(form) {
  const scene = clean(form.targetActionScene);
  if (scene.includes("电话")) {
    return "先把电话号码找出来并保存，不要求现在打通。";
  }
  if (scene.includes("询价")) {
    return "先只问一个问题：最小起订量和样品价是多少？";
  }
  if (scene.includes("样品")) {
    return "先把样品链接加入购物车，不要求立刻付款。";
  }
  if (scene.includes("现场") || scene.includes("实地")) {
    return "先查清地址和营业时间，不要求现在出发。";
  }
  return "只完成第一步：找到一个联系人、地址或入口，并保存下来。";
}
