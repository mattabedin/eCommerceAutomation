// Top-of-page sale signal. Designer-mandated to use brand-accent so the
// sale register stays separate from the brand identity colour.
export function AnnouncementBar({ message }: { message: string }) {
  return <div className="announce-bar">{message}</div>;
}
