
'use client';

// This is a special file that Next.js will use to create a loading UI that is
// shown while a route segment is loading. It will be wrapped in a <Suspense>
// boundary. We're using a client component here because we're using a custom
// element that is loaded via a script.
export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
          <dotlottie-player
              src="https://lottie.host/0bd19fd0-1ffc-46b7-99ae-0671a8b06169/IhZJc6mt5x.lottie"
              background="transparent"
              speed="1"
              style={{ width: '300px', height: '300px' }}
              loop
              autoplay
          ></dotlottie-player>
      </div>
    </div>
  );
}
