import Modern from "./modern";
import Classic from "./classic";
import Minimal from "./minimal";
import Elegant from "./elegant";
import Compact from "./compact";
import Timeline from "./timeline";
import CNFormal from "./cn-formal";
import CNCreative from "./cn-creative";
import ENAcademic from "./en-academic";
import AcademicClassic from "./academic-classic";
import AcademicModern from "./academic-modern";
import AcademicPub from "./academic-pub";
import AcademicMinimal from "./academic-minimal";
import Infographic from "./infographic";
import Magazine from "./magazine";
import DarkCard from "./dark-card";
import type { TemplateId } from "@/lib/store";
import type { TemplateProps } from "./shared";

export const templates: Record<TemplateId, (p: TemplateProps) => JSX.Element> = {
  modern: Modern,
  classic: Classic,
  minimal: Minimal,
  elegant: Elegant,
  compact: Compact,
  timeline: Timeline,
  "cn-formal": CNFormal,
  "cn-creative": CNCreative,
  "en-academic": ENAcademic,
  "academic-classic": AcademicClassic,
  "academic-modern": AcademicModern,
  "academic-pub": AcademicPub,
  "academic-minimal": AcademicMinimal,
  infographic: Infographic,
  magazine: Magazine,
  "dark-card": DarkCard,
};

export const templateList: TemplateId[] = [
  "modern", "classic", "minimal", "elegant", "compact", "timeline",
  "cn-formal", "cn-creative",
  "en-academic", "academic-classic", "academic-modern",
  "academic-pub", "academic-minimal",
  "infographic", "magazine", "dark-card",
];
