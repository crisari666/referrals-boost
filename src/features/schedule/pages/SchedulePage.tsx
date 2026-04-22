import ScheduleDayList from "@/features/schedule/ui/schedule-day-list";
import SchedulePageHeader from "@/features/schedule/ui/schedule-page-header";
import ScheduleStatusFilters from "@/features/schedule/ui/schedule-status-filters";
import ScheduleWeekStrip from "@/features/schedule/ui/schedule-week-strip";
import { mapVentorEventToVisitRow } from "@/features/schedule/lib/map-ventor-event-to-row";
import { fetchVentorScheduleByDay } from "@/features/schedule/store/scheduleSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import type { VentorScheduleStatusApi } from "@/services/scheduleService";
import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";

const SchedulePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const projects = useAppSelector((s) => s.projects.list);
  const byDay = useAppSelector((s) => s.schedule.byDay);
  const isPhysical = user?.role === "asesor_fisico" || user?.role === "admin";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [filter, setFilter] = useState<VentorScheduleStatusApi | "all">("all");

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  useEffect(() => {
    weekDays.forEach((day) => {
      const ymd = format(day, "yyyy-MM-dd");
      void dispatch(fetchVentorScheduleByDay(ymd));
    });
  }, [dispatch, weekDays]);

  const pendingCountByDay = useMemo(() => {
    const m = new Map<string, number>();
    weekDays.forEach((day) => {
      const ymd = format(day, "yyyy-MM-dd");
      const data = byDay[ymd];
      if (!data) return;
      const n = data.filter((e) => e.status === "pending").length;
      if (n > 0) m.set(ymd, n);
    });
    return m;
  }, [weekDays, byDay]);

  const selectedYmd = format(selectedDate, "yyyy-MM-dd");
  const raw = byDay[selectedYmd] ?? [];

  const filteredVisits = useMemo(() => {
    const rows = raw.map((ev) => mapVentorEventToVisitRow(ev, projects));
    return rows
      .filter((v) => v.dateYmd === selectedYmd)
      .filter((v) => filter === "all" || v.status === filter)
      .sort((a, b) => a.timeHm.localeCompare(b.timeHm));
  }, [raw, projects, filter, selectedYmd]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      <SchedulePageHeader showScheduleButton={Boolean(isPhysical)} />

      <ScheduleWeekStrip
        weekStart={weekStart}
        onPrevWeek={() => setWeekOffset((w) => w - 1)}
        onNextWeek={() => setWeekOffset((w) => w + 1)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        pendingCountByDay={pendingCountByDay}
      />

      <ScheduleStatusFilters filter={filter} onFilterChange={setFilter} />

      <ScheduleDayList selectedDate={selectedDate} visits={filteredVisits} />
    </div>
  );
};

export default SchedulePage;
