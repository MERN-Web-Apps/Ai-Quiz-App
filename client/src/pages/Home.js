function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h1>Welcome to the Quiz App</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '30px' }}>
        <button
          style={{
            padding: '20px 60px',
            fontSize: '24px',
            background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(78,84,200,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onClick={() => window.location.href = '/take-quiz'}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Take Quiz
        </button>
        <button
          style={{
            padding: '20px 60px',
            fontSize: '24px',
            background: 'linear-gradient(90deg, #ff512f, #dd2476)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(221,36,118,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onClick={() => window.location.href = '/create-quiz'}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Create Quiz
        </button>
      </div>
    </div>

  );
}
export default Home;