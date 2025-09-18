import type { Padding } from "../components/Padding";

export type TimeUtilProps = {
  width: number;
  height: number;
  padding?: Padding;
  rangeHours?: number,
  timeZone?: string,
  latitude?: number,
  longitude?: number,
};

class TimeUtils {
    public width: number;
    public height: number;
    public padding: Required<Padding>;
    public rangeHours: number;
    /** IANA time zone, e.g., "Europe/Stockholm" */
    public timeZone: string;
    public latitude: number;
    public longitude: number;

    constructor({
    width,
    height,
    padding = {},
    rangeHours = 12,
    timeZone = "Europe/Stockholm",
    latitude = 59.33,
    longitude = 18.06,
    }: TimeUtilProps) {
      this.width = width;
      this.height = height;
      this.padding = {
        top: padding.top ?? 0,
        right: padding.right ?? 0,
        bottom: padding.bottom ?? 0,
        left: padding.left ?? 0,
      };
      this.rangeHours = rangeHours;
      this.timeZone = timeZone;
      this.latitude = latitude;
      this.longitude = longitude;
    }

    setSize(width: number, height: number, padding?: Padding) {
      this.width = width;
      this.height = height;
      if (padding) {
        this.padding = {
        top: padding.top ?? 0,
        right: padding.right ?? 0,
        bottom: padding.bottom ?? 0,
        left: padding.left ?? 0,
        };
      }
    }

    get innerW() { return Math.max(0, this.width - this.padding.left - this.padding.right); }
    get innerH() { return Math.max(0, this.height - this.padding.top - this.padding.bottom); }

    /** Map relative hours in [-rangeHours, +rangeHours] to x-pixels */
    xOf(rh: number) {
      return ((rh + this.rangeHours) / (2 * this.rangeHours)) * this.innerW - this.innerW / 2;
    }

    /** The y-pixel for the center horizontal axis */
    axisY() { return this.innerH / 2; }

    /** Build tick values from -range..+range with a given step (hours) */
    ticks(stepHours = 1) {
      const arr: number[] = [];
      for (let h = -this.rangeHours; h <= this.rangeHours + 1e-9; h += stepHours) arr.push(Number(h.toFixed(6)));
      return arr;
    }

    /** Format label given a baseClock (hours in [0,24)) and relative hour offset */
    static formatLabel(baseClockHours: number, hRel: number) {
      const t = (baseClockHours + hRel + 24) % 24;
      const hh = Math.floor(t);
      return `${hh.toString().padStart(2, "0")}`;
    }


  clamp(v: number, lo: number, hi: number): number {return Math.max(lo, Math.min(hi, v))};
  deg2rad(d: number) {return (Math.PI / 180) * d};
  rad2deg(r: number) {return (180 / Math.PI) * r};

  addHours(d: Date, hours: number): Date {
    return new Date(d.getTime() + hours * 3600_000);
  }

  toZoned(date: Date): Date {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .reduce<Record<string, string>>((acc, p) => {
        if (p.type !== "literal") acc[p.type] = p.value;
        return acc;
      }, {});
    const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
    return new Date(iso);
  }

  dayOfYear(d: Date): number {
    const z =this.toZoned(d);
    const start = this.toZoned(new Date(Date.UTC(z.getUTCFullYear(), 0, 1)));
    const diff = z.getTime() - start.getTime();
    return Math.floor(diff / 86_400_000) + 1;
  }

  localClockHours(d: Date): number {
    const z = this.toZoned(d);
    return z.getHours() + z.getMinutes() / 60 + z.getSeconds() / 3600;
  }

  // NOAA-like solar altitude approximation
  solarAltitudeDeg(date: Date): number {
    const N = this.dayOfYear(date);
    const gamma = (2 * Math.PI * (N - 1)) / 365.0;
    const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

    const offsetMinutes = -this.toZoned(date).getTimezoneOffset();
    const tzHours = offsetMinutes / 60;
    const LSTM = 15 * tzHours; // Local Standard Time Meridian
    const timeCorr = 4 * (this.longitude - LSTM) + eqTime; // minutes
    const LCT = this.localClockHours(date); // local clock time (hours)
    const LST = (LCT + timeCorr / 60 + 24) % 24; // local solar time (hours)
    const H = (LST - 12) * 15; // hour angle (deg)

    const phi = this.deg2rad(this.latitude);
    const Hrad = this.deg2rad(H);
    const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(Hrad);

    return this.rad2deg(Math.asin(this.clamp(sinAlt, -1, 1)));
  }

  degreeToDate(degree:number): Date | null {
    if (degree < -90 || degree > 90) return null;
    // Approximate time of day when the sun reaches the given altitude (degree)
    // This is a rough estimate and may not be accurate for all locations and dates.
    const now = new Date();
    const latRad = this.deg2rad(this.latitude);
    const decl = this.deg2rad(23.44 * Math.sin(this.deg2rad((360 / 365) * (this.dayOfYear(now) - 81))));
    const hourAngle = Math.acos((Math.sin(this.deg2rad(degree)) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl)));
    const hourAngleDeg = this.rad2deg(hourAngle);
    const solarNoon = 12 - ((this.longitude / 15) + (this.toZoned(now).getTimezoneOffset() / 60));
    const time1 = solarNoon - hourAngleDeg / 15; // in hours
    const time2 = solarNoon + hourAngleDeg / 15; // in hours
    const date1 = new Date(now);
    date1.setHours(Math.floor(time1), Math.floor((time1 % 1) * 60), Math.floor(((time1 * 60) % 1) * 60), 0);
    const date2 = new Date(now);
    date2.setHours(Math.floor(time2), Math.floor((time2 % 1) * 60), Math.floor(((time2 * 60) % 1) * 60), 0);
    // Return the closest time to now
    return Math.abs(date1.getTime() - now.getTime()) < Math.abs(date2.getTime() - now.getTime()) ? date1 : date2;
  }

  sunrise():Date {
    const sunriseDate = this.degreeToDate(0);
    return sunriseDate ? sunriseDate : new Date();
  }

  sunset():Date {
    const sunsetDate = this.degreeToDate(0);
    return sunsetDate ? new Date(sunsetDate.getTime() + 12 * 3600_000) : new Date();
  }

  /** Equation of Time in minutes (positive means sundial ahead of clock) */
  equationOfTimeMinutes(date: Date): number {
    const N = this.dayOfYear(date);
    const gamma = (2 * Math.PI * (N - 1)) / 365.0;
    return 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  }

  /** Solar declination in degrees */
  solarDeclinationDeg(date: Date): number {
    const N = this.dayOfYear(date);
    const gamma = (2 * Math.PI * (N - 1)) / 365.0;
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    return this.rad2deg(decl);
  }
}

export default TimeUtils;