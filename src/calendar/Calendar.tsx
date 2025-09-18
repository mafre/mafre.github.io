import { useState } from "react";

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

	const isoWeek = (d:Date) => {
		const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		const dayNum = (date.getUTCDay() + 6) % 7;
		date.setUTCDate(date.getUTCDate() + 3 - dayNum);
		const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
		const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
		firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
		const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
		return week;
	};

	function monthLabel(m?:number) {
		if (!m) return "";
		const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return monthNames[m - 1] || "";
	}

	function monthsWeeksDays(currentDate:Date):Month[] {
		const monthList:Month[] = [];
		const year = currentDate.getFullYear();
		const today = new Date();
		today.setHours(0,0,0,0);

		for (let m = 0; m < 12; m++) {
			const lastDayOfMonth = new Date(year, m + 1, 0);
			const month:Month = {
				number: m + 1,
				name: monthLabel(m + 1),
				weeks: [],
				isCurrent: (m === currentDate.getMonth())
			};

			let currentWeekNumber = -1;
			let week:Week | null = null;

			for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
				const date = new Date(year, m, d);
				const weekNumber = isoWeek(date);
				const mondayIndex = (date.getDay() + 6) % 7;

				if (weekNumber !== currentWeekNumber) {
					if (week) month.weeks.push(week);
					week = {
						number: weekNumber,
						days: new Array(7).fill(null),
						isCurrent: false
					};
					currentWeekNumber = weekNumber;
				}

				if (week) {
					const isToday = date.getTime() === today.getTime();
					if (isToday) week.isCurrent = true;
					week.days[mondayIndex] = {
						date,
						dayNumber: d,
						isToday
					};
				}
			}

			if (week) month.weeks.push(week);
			monthList.push(month);
		}
		return monthList;
	}


	const [currentDate] = useState(new Date());
	const months = monthsWeeksDays(currentDate);

	return <div className="calendar glass">
		{months.map((month) => (
			<div key={month.number} className="month">
				<div className={`monthHeader${month.isCurrent ? ' highlight' : ''}`}>{month.name}</div>
				<div className="week weekHeader">
					<div className="weekNumber"></div>
					{['M','T','W','T','F','S','S'].map((d,i)=>(
						<div key={i} className="day dayName">{d}</div>
					))}
				</div>
				{month.weeks.map((week) => (
					<div key={week.number} className={`week${week.isCurrent ? ' highlight' : ''}`}>
						<div className={`weekNumber${week.isCurrent ? ' highlight' : ''}`}>{week.number}</div>
						{week.days.map((day, idx) => day ? (
							<div key={day.date.toISOString()} className={`day${day.isToday ? ' highlight' : ''}`}>
								{day.dayNumber}
							</div>
						) : <div key={"empty-"+week.number+"-"+idx} className="day emptyDay" />)}
					</div>
					))}
			</div>
		))}
	</div>
}