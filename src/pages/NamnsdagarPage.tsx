import { useEffect, useMemo, useState } from 'react';

interface NameDayEntry {
	date: string;
	names?: string[];
	observance?: string;
}

const formatNameDay = (entry: NameDayEntry) => {
	const date = new Date(`${new Date().getFullYear()}-${entry.date}`);
	return date.toLocaleDateString(undefined, {
		day: '2-digit',
		month: 'long',
	});
};

export default function NamnsdagarPage() {
	const [query, setQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [nameDayEntries, setNameDayEntries] = useState<NameDayEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		import('../svenska-namnsdagar.json')
			.then((module) => {
				if (cancelled) return;
				const data = (module.default ?? module) as { days?: NameDayEntry[] };
				setNameDayEntries(data.days ?? []);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setDebouncedQuery(query.trim().toLowerCase());
		}, 250);

		return () => {
			clearTimeout(timeout);
		};
	}, [query]);

	const entries = useMemo(() => {
		return nameDayEntries.filter((entry) => {
			const text =
				`${entry.date} ${entry.names?.join(' ') ?? ''} ${entry.observance ?? ''}`.toLowerCase();
			return text.includes(debouncedQuery);
		});
	}, [nameDayEntries, debouncedQuery]);

	return (
		<section className="space-y-6">
			<div className="rounded-3xl border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-950/70">
				<label
					className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					htmlFor="namnsdagSearch"
				>
					Search
				</label>
				<input
					id="namnsdagSearch"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Dag eller namn"
					className="mt-2 w-full rounded-2xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
				/>
			</div>

			{isLoading ? (
				<div className="rounded-3xl border border-slate-200/80 bg-white/90 px-4 py-6 text-slate-600 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-300">
					Loading name day data…
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{entries.length === 0 ? (
						<div className="rounded-3xl border border-slate-200/80 bg-white/90 px-4 py-6 text-slate-600 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-300">
							No matching name day entries found.
						</div>
					) : (
						entries.map((entry) => (
							<article
								key={entry.date}
								className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/70 dark:hover:border-slate-700 dark:hover:bg-slate-900"
							>
								<div className="text-sm text-slate-500 dark:text-slate-400">
									{formatNameDay(entry)}
								</div>
								<p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
									{entry.names?.join(', ') ?? entry.observance ?? '—'}
								</p>
							</article>
						))
					)}
				</div>
			)}
		</section>
	);
}
