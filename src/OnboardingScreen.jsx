export default function OnboardingScreen() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 390,
        height: 844,
        backgroundColor: '#FFEE8C',
        flexShrink: 0,
      }}
    >
      {/* Headline */}
      <div
        className="absolute"
        style={{ left: 24, top: 113, width: 346 }}
      >
        <p
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 900,
            fontSize: 32,
            lineHeight: '36px',
            color: '#000000',
            margin: 0,
          }}
        >
          No plans? Perfect.{'\n'}We&rsquo;ve got one for you.
        </p>
      </div>

      {/* Indoor / Outdoor buttons */}
      <div
        className="absolute flex gap-0"
        style={{ left: 23, top: 321, width: 347, height: 68 }}
      >
        {/* Outdoor */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 164,
            height: 68,
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 99,
            boxShadow: '2px 4px 0px 0px rgba(0,0,0,1)',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 400,
              fontSize: 20,
              color: '#000000',
            }}
          >
            Outdoor
          </span>
        </div>

        {/* Indoor */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 164,
            height: 68,
            marginLeft: 'auto',
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 99,
            boxShadow: '2px 4px 0px 0px rgba(0,0,0,1)',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 400,
              fontSize: 20,
              color: '#000000',
            }}
          >
            Indoor
          </span>
        </div>
      </div>

      {/* Child's age dropdown */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: 24,
          top: 429,
          width: 346,
          height: 63,
          backgroundColor: '#FFFFFF',
          border: '1.74px solid #000000',
          borderRadius: 87,
          boxShadow: '1.74px 3.48px 0px 0px rgba(0,0,0,1)',
          paddingLeft: 24,
          paddingRight: 20,
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 20,
            color: '#878787',
          }}
        >
          Child&rsquo;s age
        </span>
        {/* Chevron arrow */}
        <svg width="25" height="16" viewBox="0 0 25 16" fill="none">
          <path d="M2 2L12.5 13L23 2" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Location input */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: 23,
          top: 532,
          width: 347,
          height: 64,
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: 99,
          boxShadow: '2px 4px 0px 0px rgba(0,0,0,1)',
          paddingLeft: 24,
          paddingRight: 20,
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 20,
            color: '#969696',
          }}
        >
          City, State or Zip
        </span>
        {/* Map pin icon */}
        <svg width="28" height="32" viewBox="0 0 24 28" fill="none">
          <path
            d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"
            fill="#000000"
          />
        </svg>
      </div>

      {/* Let's Go button */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: 23,
          top: 636,
          width: 344,
          height: 70,
          backgroundColor: '#8C9DFF',
          border: '1.89px solid #000000',
          borderRadius: 95,
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 900,
            fontSize: 23,
            color: '#FFFFFF',
          }}
        >
          Let&rsquo;s Go
        </span>
      </div>

      {/* Disclaimer */}
      <div
        className="absolute text-center"
        style={{ left: 20, top: 794, width: 350 }}
      >
        <p
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontSize: 10,
            lineHeight: '16px',
            color: '#848484',
            margin: 0,
          }}
        >
          AI suggestions may not always be accurate. Always supervise your child.
        </p>
      </div>
    </div>
  );
}
