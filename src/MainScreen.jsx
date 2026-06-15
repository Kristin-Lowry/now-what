function WeatherIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="10" r="4" fill="#F5C842" />
      <path
        d="M6 17a4 4 0 010-8h.5A5.5 5.5 0 0117 13.5a3.5 3.5 0 010 7H6z"
        fill="#C8D6E5"
        stroke="#000"
        strokeWidth="0.5"
      />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <path
        d="M17 21a4 4 0 100-8 4 4 0 000 8z"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14.1 3.8l-.8 2.4a8.8 8.8 0 00-2.1 1.2l-2.5-.5L6.3 10l1.6 2a9 9 0 000 2.4l-1.6 2 2.4 3.1 2.5-.5c.6.5 1.3.9 2.1 1.2l.8 2.4h3.8l.8-2.4a8.8 8.8 0 002.1-1.2l2.5.5 2.4-3.1-1.6-2a9 9 0 000-2.4l1.6-2-2.4-3.1-2.5.5a8.8 8.8 0 00-2.1-1.2l-.8-2.4h-3.8z"
        stroke="#000"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThumbUpIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 22V11M2 13v7a2 2 0 002 2h11.3c.8 0 1.5-.5 1.8-1.3l2.6-7c.4-1-.4-2-1.4-2H14V8c0-1.7-1.3-3-3-3L7 11"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThumbDownIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 2v11M22 11V4a2 2 0 00-2-2H8.7c-.8 0-1.5.5-1.8 1.3l-2.6 7c-.4 1 .4 2 1.4 2H10v4c0 1.7 1.3 3 3 3l4-6"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function MainScreen() {
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
      {/* Weather pill */}
      <div
        className="absolute flex items-center"
        style={{
          left: 18,
          top: 25,
          backgroundColor: '#FFFFFF',
          border: '1.53px solid #000000',
          borderRadius: 77,
          boxShadow: '1px 2px 0px 0px rgba(0,0,0,1)',
          padding: '7.73px',
          gap: 6,
        }}
      >
        <WeatherIcon />
        <span
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 13.9,
            lineHeight: '18.55px',
            color: '#000000',
          }}
        >
          56° F
        </span>
      </div>

      {/* Settings icon */}
      <div className="absolute" style={{ left: 336, top: 25 }}>
        <SettingsIcon />
      </div>

      {/* Indoor / Outdoor buttons */}
      <div
        className="absolute flex"
        style={{ left: 18, top: 87, width: 352, height: 68 }}
      >
        {/* Outdoor — pressed/selected */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 164,
            height: 68,
            backgroundColor: '#8C9DFF',
            border: '1.98px solid #000000',
            borderRadius: 99,
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 700,
              fontStyle: 'normal',
              fontSize: 20,
              color: '#FFFFFF',
            }}
          >
            Outdoor
          </span>
        </div>

        {/* Indoor — default */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 164,
            height: 68,
            marginLeft: 'auto',
            backgroundColor: '#FFFFFF',
            border: '1.98px solid #000000',
            borderRadius: 99,
            boxShadow: '2px 4px 0px 0px rgba(0,0,0,1)',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: 20,
              color: '#000000',
            }}
          >
            Indoor
          </span>
        </div>
      </div>

      {/* Activity suggestion text */}
      <div
        className="absolute"
        style={{ left: 18, top: 227, width: 347 }}
      >
        <p
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 32,
            lineHeight: '38px',
            color: '#000000',
            margin: 0,
          }}
        >
          Find a patch of grass and let them sit in it. The texture on their hands and feet is genuinely fascinating to a 9-month-old.
        </p>
      </div>

      {/* Reaction buttons — thumbs down + thumbs up */}
      <div
        className="absolute flex items-center"
        style={{ left: 123, top: 478, gap: 38 }}
      >
        {/* Dislike */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            backgroundColor: '#FFFFFF',
            border: '1.45px solid #000000',
            borderRadius: 99,
            boxShadow: '1.45px 2.89px 0px 0px rgba(0,0,0,1)',
            cursor: 'pointer',
          }}
        >
          <ThumbDownIcon />
        </div>

        {/* Like */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            backgroundColor: '#FFFFFF',
            border: '1.45px solid #000000',
            borderRadius: 99,
            boxShadow: '1.45px 2.89px 0px 0px rgba(0,0,0,1)',
            cursor: 'pointer',
          }}
        >
          <ThumbUpIcon />
        </div>
      </div>

      {/* Now What button */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: 24,
          top: 629,
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
          Now What
        </span>
      </div>

      {/* Disclaimer */}
      <div
        className="absolute text-center"
        style={{ left: 17, top: 797, width: 350 }}
      >
        <p
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
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
  )
}
