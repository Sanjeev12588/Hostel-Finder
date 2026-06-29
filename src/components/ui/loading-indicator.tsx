
'use client';

export default function LoadingIndicator() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
          <dotlottie-player
              src="https://lottie.host/0bd19fd0-1ffc-46b7-99ae-0671a8b06169/IhZJc6mt5x.lottie"
              background="transparent"
              speed="1"
              style={{ width: '250px', height: '250px' }}
              loop
              autoplay
          ></dotlottie-player>
      </div>
    </div>
  );
}
