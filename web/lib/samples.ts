import type { Resume } from "./schema";

export const sampleEN: Resume = {
  basics: {
    name: "Alex Chen",
    label: "Full-Stack Software Engineer",
    email: "alex.chen@example.com",
    phone: "+1 555 123 4567",
    location: "San Francisco, CA",
    website: "https://alexchen.dev",
    summary:
      "Full-stack engineer with 5+ years building reliable web platforms. Passionate about developer experience, distributed systems, and mentoring.",
  },
  work: [
    {
      id: "w1", company: "Acme Corp", position: "Senior Software Engineer",
      location: "San Francisco, CA", startDate: "2023-02", endDate: "Present",
      highlights: [
        "Led a team of 4 to redesign the billing pipeline, cutting p99 latency by 62%.",
        "Introduced contract tests, reducing cross-service regressions by 40%.",
        "Mentored 3 junior engineers through promotion.",
      ],
    },
    {
      id: "w2", company: "Globex", position: "Software Engineer",
      location: "Remote", startDate: "2020-06", endDate: "2023-01",
      highlights: [
        "Owned the React design system adopted by 14 internal products.",
        "Shipped the CI caching layer, saving ~$80k/yr in build minutes.",
      ],
    },
  ],
  education: [
    { id: "e1", institution: "University of California, Berkeley", area: "Computer Science",
      studyType: "B.S.", startDate: "2016-09", endDate: "2020-05", score: "GPA 3.8/4.0",
      courses: ["Distributed Systems", "Operating Systems", "Compilers"] },
  ],
  projects: [
    { id: "p1", name: "open-resume", description: "Open-source resume builder with 8k+ stars.",
      url: "https://github.com/xitanggg/open-resume", startDate: "2022-01", endDate: "Present",
      highlights: ["Built live-preview pipeline", "Implemented PDF parser"], keywords: ["React", "TypeScript"] },
  ],
  skills: [
    { id: "s1", name: "Languages", level: "Expert", keywords: ["TypeScript", "Go", "Python", "Rust"] },
    { id: "s2", name: "Frontend", level: "Expert", keywords: ["React", "Next.js", "Tailwind"] },
    { id: "s3", name: "Infra", level: "Advanced", keywords: ["Kubernetes", "Terraform", "AWS"] },
  ],
  awards: [
    { id: "a1", title: "Hackathon 1st place", date: "2021-10", awarder: "Globex internal",
      summary: "Won 1st of 40 teams with a real-time observability tool." },
  ],
  languages: [
    { id: "l1", language: "English", fluency: "Native" },
    { id: "l2", language: "Mandarin", fluency: "Native" },
  ],
};

export const sampleZH: Resume = {
  basics: {
    name: "陈思远",
    label: "全栈软件工程师",
    email: "siyuan.chen@example.com",
    phone: "138 0000 0000",
    location: "上海",
    website: "https://siyuan.dev",
    summary:
      "5 年以上互联网后端与前端经验，专注于高可用系统与开发者体验，善于带新人、推进跨团队协作。",
  },
  work: [
    { id: "w1", company: "某互联网大厂", position: "高级软件工程师",
      location: "上海", startDate: "2023-02", endDate: "至今",
      highlights: [
        "主导计费链路重构，P99 延迟下降 62%。",
        "引入契约测试，跨服务回归 bug 减少 40%。",
        "带教 3 位同学顺利晋升。",
      ],
    },
    { id: "w2", company: "某云厂商", position: "软件工程师",
      location: "远程", startDate: "2020-06", endDate: "2023-01",
      highlights: [
        "负责前端设计系统，被 14 个内部产品采用。",
        "实现 CI 缓存层，每年节省约 50 万元构建费用。",
      ],
    },
  ],
  education: [
    { id: "e1", institution: "华南农业大学", area: "计算机科学与技术",
      studyType: "本科", startDate: "2016-09", endDate: "2020-06",
      score: "GPA 3.8 / 4.0（专业前 5%）",
      courses: ["分布式系统", "操作系统", "编译原理"] },
  ],
  projects: [
    { id: "p1", name: "resume-aggregator", description: "聚合 GitHub 简历模板并在线可编辑，500+ 模板。",
      url: "https://github.com/Toby-Qian/resume-aggregator", startDate: "2026-04", endDate: "至今",
      highlights: ["实现实时预览与主题切换", "支持 JSON Resume 导入导出"], keywords: ["Next.js", "TypeScript"] },
  ],
  skills: [
    { id: "s1", name: "语言", level: "精通", keywords: ["TypeScript", "Go", "Python", "Rust"] },
    { id: "s2", name: "前端", level: "精通", keywords: ["React", "Next.js", "Tailwind"] },
    { id: "s3", name: "基础设施", level: "熟练", keywords: ["Kubernetes", "Terraform", "阿里云"] },
  ],
  awards: [
    { id: "a1", title: "内部黑客松一等奖", date: "2021-10", awarder: "公司内部",
      summary: "40 支队伍中夺冠，作品为实时观测工具。" },
  ],
  languages: [
    { id: "l1", language: "中文", fluency: "母语" },
    { id: "l2", language: "English", fluency: "CET-6 / 工作流利" },
  ],
};
