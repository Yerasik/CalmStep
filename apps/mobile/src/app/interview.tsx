import { router, useLocalSearchParams } from 'expo-router';

import { readRole } from '../navigation/extras';
import { ScreenScaffold } from '../ui/ScreenScaffold';

export default function InterviewScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);

  return (
    <ScreenScaffold
      title="Interview"
      note="Placeholder onboarding questions. Profile JSON comes in a later stage. This screen does not call a network or LLM."
      extras={`extra role=${role}`}
      primaryLabel="Finish interview"
      onPrimary={() => {
        router.push({ pathname: '/planner/profile', params: { role } });
      }}
    />
  );
}
