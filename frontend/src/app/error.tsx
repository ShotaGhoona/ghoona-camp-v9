'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>500</h1>
      <p className='mt-4 text-muted-foreground'>エラーが発生しました</p>
      <button
        onClick={() => reset()}
        className='mt-4 rounded bg-primary px-4 py-2 text-primary-foreground'
      >
        再試行
      </button>
    </div>
  );
}
