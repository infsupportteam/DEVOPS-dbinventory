import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="socan">SOCAN</div>
        <div className="brandSubtitle">DATABASE INVENTORY</div>
      </div>

      <nav>
        <Link href="/dbinventory" className="navItem active">
          ◈ Inventory
        </Link>

        <span className="navItem disabled">◉ Databases</span>
        <span className="navItem disabled">▦ Applications</span>
        <span className="navItem disabled">◷ Reviews</span>
        <span className="navItem disabled">◇ Decommissioned</span>
        <span className="navItem disabled">↻ Audit History</span>
      </nav>

      <div className="sidebarFooter">Database Operations</div>
    </aside>
  );
}
