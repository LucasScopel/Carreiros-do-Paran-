"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab(props: { name: string; href: string; active: boolean }) {
  return (
    <Link
      key={props.name}
      href={props.href}
      className={`
        px-5 py-3 text-sm font-medium rounded-t-lg transition-colors
        ${
          props.active
            ? "bg-white border border-gray-200 border-b-white text-[#88674c]"
            : "bg-transparent border border-transparent bg-clip-padding text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        }
      `}
    >
      {props.name}
    </Link>
  );
}

interface Tab {
  name: string;
  href: string;
}

export default function ProfileTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <div className="h-10 flex flex-row w-full space-x-2 relative top-[1px] px-4 z-10">
      {tabs.map((tab) => {
        return (
          <Tab
            key={tab.href}
            name={tab.name}
            href={tab.href}
            active={pathname === tab.href}
          />
        );
      })}
    </div>
  );
}
