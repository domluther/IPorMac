import type { ReactNode } from "react";
import { SiteNavigation } from "@/components/SiteNavigation";
import {
	detectCurrentSite,
	GCSE_NAVIGATION_MENU,
} from "@/lib/navigationConfig";

interface HeaderProps {
	scoreButton?: ReactNode;
	title: string;
	subtitle: string;
}

export function Header({ scoreButton, title, subtitle }: HeaderProps) {
	// Auto-detect current site for navigation highlighting
	const currentSiteId = detectCurrentSite();

	return (
		<header className="relative p-6 text-center text-white bg-gradient-to-r from-gray-700 to-gray-900">
			<SiteNavigation
				menuItems={GCSE_NAVIGATION_MENU}
				currentSiteId={currentSiteId}
				title="GCSE CS Tools"
				icon="🎓"
			/>
			{scoreButton && (
				<div className="absolute top-3 right-3 xl:top-5 xl:right-8">
					{scoreButton}
				</div>
			)}
			<h1 className="mb-2 text-2xl font-bold sm:text-3xl xl:text-4xl text-shadow">
				{title}
			</h1>
			<p className="text-base text-indigo-100 xl:text-lg">{subtitle}</p>
		</header>
	);
}
