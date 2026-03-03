import { Redirect } from 'expo-router';

/** Legacy route: redirect to Capture tab (capture-schedule-todo-renewal). */
export default function InboxRedirect() {
  return <Redirect href="/(tabs)/capture" />;
}
