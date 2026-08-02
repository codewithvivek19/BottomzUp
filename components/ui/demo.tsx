/**
 * Demo entry for the React control-knob (only runs in a React/shadcn app).
 * Live site uses the vanilla heat knob inside Wings Sauce Meter instead.
 */
import ControlKnob from "@/components/ui/control-knob";

export default function DemoOne() {
  return (
    <div className="min-h-[420px] flex items-center justify-center bg-[#fffdf9] p-8">
      <ControlKnob defaultValue={37} label="HEAT" />
    </div>
  );
}
