import ScheduleDialog from "./ScheduleDialog";

interface SchedulePageHeaderProps {
  showScheduleButton: boolean;
}

const SchedulePageHeader = ({ showScheduleButton }: SchedulePageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-foreground">Agenda</h1>
        <p className="text-sm text-muted-foreground">Visitas programadas</p>
      </div>
      {showScheduleButton ? <ScheduleDialog /> : null}
    </div>
  );
};

export default SchedulePageHeader;
