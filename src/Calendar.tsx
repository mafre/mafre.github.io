import { useState, useRef } from 'react';
import nameDayData from './svenska-namnsdagar.json';

export default function Calendar() {
	interface Month {
		number: number;
		name: string;
		weeks: Week[];
		isCurrent?: boolean;
	}
	interface Week {
		number: number;
		days: (Day | null)[];
		isCurrent?: boolean;
	}
	interface Day {
		date: Date;
		dayNumber?: number;
		isToday: boolean;
	}

	interface NameDayEntry {
		date: string;
		names?: string[];
		observance?: string;
	}

	const date = new Date();
	const currentWeekDay = date.getDay();
	const [selectionStart, setSelectionStart] = useState<Date | null>(null);
	const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
	const [layout, setLayout] = useState<'grid' | 'list'>('grid');
	const swedishNameDayIndex: Record<string, NameDayEntry> = {};
	(nameDayData.days as NameDayEntry[] | undefined)?.forEach((entry) => {
		swedishNameDayIndex[entry.date] = entry;
	});

	const dayKey = (value: Date) => {
		const month = String(value.getMonth() + 1).padStart(2, '0');
		const day = String(value.getDate()).padStart(2, '0');
		return `${month}-${day}`;
	};

	const getSwedishNameDay = (value: Date) => {
		const entry = swedishNameDayIndex[dayKey(value)];
		if (!entry) return '';
		if (entry.names?.length) return entry.names.join(', ');
		return entry.observance || '';
	};

	const normalizeDate = (value: Date) => {
		const normalized = new Date(value);
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	};

	const isSameDay = (a: Date, b: Date) => normalizeDate(a).getTime() === normalizeDate(b).getTime();

	const isInSelectionRange = (day: Date) => {
		if (!selectionStart || !selectionEnd) return false;
		const start = normalizeDate(selectionStart).getTime();
		const end = normalizeDate(selectionEnd).getTime();
		const value = normalizeDate(day).getTime();
		return value >= Math.min(start, end) && value <= Math.max(start, end);
	};

	const handleDayClick = (clickedDate: Date) => {
		if (!selectionStart || (selectionStart && selectionEnd)) {
			setSelectionStart(clickedDate);
			setSelectionEnd(null);
			return;
		}

		if (selectionStart && !selectionEnd) {
			if (isSameDay(clickedDate, selectionStart)) {
				setSelectionStart(null);
				setSelectionEnd(null);
			} else {
				setSelectionEnd(clickedDate);
			}
		}
	};

	const formatDate = (value: Date) => {
		return value.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatDayName = (value: Date) => {
		return value.toLocaleDateString(undefined, {
			weekday: 'long',
		});
	};

	const rangeDays = (start: Date, end: Date) => {
		const startMs = normalizeDate(start).getTime();
		const endMs = normalizeDate(end).getTime();
		const days = Math.ceil(Math.abs(endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
		return `${days} day${days === 1 ? '' : 's'}`;
	};

	const selectedDateText = selectionStart
		? selectionEnd
			? `${formatDate(selectionStart)} – ${formatDate(selectionEnd)} (${rangeDays(selectionStart, selectionEnd)})`
			: layout === 'list'
				? `${formatDate(selectionStart)}`
				: `${formatDate(selectionStart)} - ${getSwedishNameDay(selectionStart)}`
		: 'Select a date or range';

	const todayRowRef = useRef<HTMLDivElement | null>(null);
	const todayNameDay = getSwedishNameDay(date);
	const todayDetails = `${formatDayName(date)}, ${formatDate(date)}${todayNameDay ? ` — ${todayNameDay}` : ''}`;

	const scrollToToday = () => {
		if (layout === 'list' && todayRowRef.current) {
			todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	};

	const isoWeek = (d: Date) => {
		const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		const dayNum = (date.getUTCDay() + 6) % 7;
		date.setUTCDate(date.getUTCDate() + 3 - dayNum);
		const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
		const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
		firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
		const week =
			1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
		return week;
	};

	function monthLabel(m?: number) {
		if (!m) return '';
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		return monthNames[m - 1] || '';
	}

	function monthsWeeksDays(currentDate: Date): Month[] {
		const monthList: Month[] = [];
		const year = currentDate.getFullYear();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let m = 0; m < 12; m++) {
			const lastDayOfMonth = new Date(year, m + 1, 0);
			const month: Month = {
				number: m + 1,
				name: monthLabel(m + 1),
				weeks: [],
				isCurrent: m === currentDate.getMonth(),
			};

			let currentWeekNumber = -1;
			let week: Week | null = null;

			for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
				const date = new Date(year, m, d);
				const weekNumber = isoWeek(date);
				const mondayIndex = (date.getDay() + 6) % 7;

				if (weekNumber !== currentWeekNumber) {
					if (week) month.weeks.push(week);
					week = {
						number: weekNumber,
						days: new Array(7).fill(null),
						isCurrent: false,
					};
					currentWeekNumber = weekNumber;
				}

				if (week) {
					const isToday = date.getTime() === today.getTime();
					if (isToday) week.isCurrent = true;
					week.days[mondayIndex] = {
						date,
						dayNumber: d,
						isToday,
					};
				}
			}

			if (week) month.weeks.push(week);
			monthList.push(month);
		}
		return monthList;
	}

	const flattenMonthDays = (month: Month) => {
		return month.weeks.flatMap((week) => week.days).filter((day): day is Day => Boolean(day));
	};

	const [currentDate] = useState(new Date());
	const months = monthsWeeksDays(currentDate);

	return (
		<div className={`calendar ${layout}`}>
			<div className="calendarHeader">
				<div
					className="calendarToday"
					role="button"
					tabIndex={0}
					onClick={scrollToToday}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							scrollToToday();
						}
					}}
				>
					{selectionStart ? selectedDateText : todayDetails}
				</div>
				<div className="calendarControls">
					<label className="calendarControlLabel">
						Layout:
						<select
							value={layout}
							onChange={(event) => setLayout(event.target.value as 'grid' | 'list')}
						>
							<option value="grid">Grid</option>
							<option value="list">List</option>
						</select>
					</label>
				</div>
			</div>
			{months.map((month) => (
				<div key={month.number} className="month">
					<div className={`monthHeader${month.isCurrent ? ' highlight' : ''}`}>{month.name}</div>
					{layout === 'list' ? (
						<div className="monthDays">
							{flattenMonthDays(month).map((day) => {
								const isStart = selectionStart && isSameDay(day.date, selectionStart);
								const isEnd = selectionEnd && isSameDay(day.date, selectionEnd);
								const inRange = isInSelectionRange(day.date) && !isStart && !isEnd;
								const classes = [
									'day',
									day.isToday ? 'highlight' : null,
									inRange ? 'range' : null,
									isStart || isEnd ? 'selected rangeBoundary' : null,
								]
									.filter(Boolean)
									.join(' ');
								const nameDayText = getSwedishNameDay(day.date);

								return (
									<div
										key={day.date.toISOString()}
										className={classes}
										ref={day.isToday ? todayRowRef : undefined}
										onClick={() => handleDayClick(day.date)}
									>
										<span className="dayLabel">{day.dayNumber}</span>
										{nameDayText ? <span className="dayNameDay">{nameDayText}</span> : null}
									</div>
								);
							})}
						</div>
					) : (
						<>
							<div className="week weekHeader">
								<div className="weekNumber">V</div>
								{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
									<div
										key={i}
										className={`day dayName ${month.isCurrent && i === currentWeekDay - 1 ? ' highlight' : ''}`}
									>
										{d}
									</div>
								))}
							</div>
							{month.weeks.map((week) => (
								<div key={week.number} className={`week${week.isCurrent ? ' highlight' : ''}`}>
									<div className={`weekNumber${week.isCurrent ? ' highlight' : ''}`}>
										{week.number}
									</div>
									{week.days.map((day, idx) => {
										if (!day) {
											return (
												<div key={'empty-' + week.number + '-' + idx} className="day emptyDay" />
											);
										}

										const isStart = selectionStart && isSameDay(day.date, selectionStart);
										const isEnd = selectionEnd && isSameDay(day.date, selectionEnd);
										const inRange = isInSelectionRange(day.date) && !isStart && !isEnd;
										const classes = [
											'day',
											day.isToday ? 'highlight' : null,
											inRange ? 'range' : null,
											isStart || isEnd ? 'selected rangeBoundary' : null,
										]
											.filter(Boolean)
											.join(' ');

										return (
											<div
												key={day.date.toISOString()}
												className={classes}
												onClick={() => handleDayClick(day.date)}
											>
												{day.dayNumber}
											</div>
										);
									})}
								</div>
							))}
						</>
					)}
				</div>
			))}
		</div>
	);
}
