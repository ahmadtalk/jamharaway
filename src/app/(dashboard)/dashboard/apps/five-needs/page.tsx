import ToolLayout from "@/components/tools/ToolLayout";
import UnderConstruction from "@/components/tools/UnderConstruction";

export default function FiveNeedsPage() {
  return (
    <ToolLayout>
      <UnderConstruction
        title="الاحتياجات الخمسة"
        description="التحقق من اكتمال عناصر الخبر الأساسية: من، ماذا، أين، متى، لماذا"
      />
    </ToolLayout>
  );
}
