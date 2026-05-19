import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchUpcomingTrainingSessionsThunk,
  selectTrainingSessionsError,
  selectTrainingSessionsLoading,
  selectTrainingSessionsUpcoming,
} from '@/features/training-sessions/store/training-sessions-slice';

function formatSessionDateTime(date: string, time: string): string {
  const combined = `${date} ${time}`.trim();
  if (combined.length === 0) return '';
  const parsed = new Date(combined);
  if (Number.isNaN(parsed.getTime())) {
    return combined;
  }
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

export function TrainingSessionsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const upcoming = useAppSelector(selectTrainingSessionsUpcoming);
  const loading = useAppSelector(selectTrainingSessionsLoading);
  const error = useAppSelector(selectTrainingSessionsError);

  useEffect(() => {
    void dispatch(fetchUpcomingTrainingSessionsThunk());
  }, [dispatch]);

  return (
    <motion.div
      className="p-4 md:p-6 max-w-2xl mx-auto space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div>
        <h1 className="text-2xl font-bold text-foreground">{t('trainingSessions.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('trainingSessions.subtitle')}</p>
      </motion.div>
      {loading ? (
        <p className="text-sm text-muted-foreground">{t('trainingSessions.loading')}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive">{t('trainingSessions.error')}</p>
      ) : null}
      {!loading && !error && upcoming.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('trainingSessions.empty')}</p>
          </CardContent>
        </Card>
      ) : null}
      {upcoming.map((session) => (
        <Card key={session.id} className="transition-colors duration-200 hover:border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-start gap-2">
              <Video className="w-5 h-5 shrink-0 text-primary mt-0.5" />
              <span>{session.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {formatSessionDateTime(session.date, session.time)}
            </p>
            {session.googleMeetUrl ? (
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <a href={session.googleMeetUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('trainingSessions.joinMeet')}
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">{t('trainingSessions.noMeetLink')}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
