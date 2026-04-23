import Modern from "./modern";
import Classic from "./classic";
import Minimal from "./minimal";
import CNFormal from "./cn-formal";
import CNCreative from "./cn-creative";
import ENAcademic from "./en-academic";
import type { TemplateId } from "@/lib/store";
import type { TemplateProps } from "./shared";

export const templates: Record<TemplateId, (p: TemplateProps) => JSX.Element> = {
  modern: Modern,
  classic: Classic,
  minimal: Minimal,
  "cn-formal": CNFormal,
  "cn-creative": CNCreative,
  "en-academic": ENAcademic,
};

export const templateList: TemplateId[] = ["modern", "classic", "minimal", "cn-formal", "cn-creative", "en-academic"];
