import { SafeAreaView, Typography } from '@worldcoin/mini-apps-ui-kit-react';

export default function MeLoading() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="fixed inset-0 bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center">
        <div className="mb-4 h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
        <Typography variant="body" level={3} className="text-gray-400">
          Loading your crate…
        </Typography>
      </div>
    </SafeAreaView>
  );
}
