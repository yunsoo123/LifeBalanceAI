import { Redirect } from 'expo-router';

/** Legacy route: redirect to Capture > Schedule (capture-schedule-todo-renewal). */
export default function ScheduleRedirect() {
  return <Redirect href="/(tabs)/capture/schedule" />;
}
