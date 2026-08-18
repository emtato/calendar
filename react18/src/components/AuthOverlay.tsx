interface AuthOverlayProps {
    onClose: () => void;
    onRevealComplete: () => void;
    origin: {
        x: number;
        y: number;
    };
}

export default function AuthOverlay({onClose, onRevealComplete, origin}: AuthOverlayProps) {
    return (
        <div
            className="auth-panel"
            style={{
                "--auth-origin-x": `${origin.x}px`,
                "--auth-origin-y": `${origin.y}px`,
            } as React.CSSProperties}
            onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) onRevealComplete()
            }}
        >
                <button
                    className="auth-close-button"
                    type="button"
                    aria-label="Close login"
                    onClick={onClose}
                    style={{fontSize: "1.5rem", lineHeight: 1}}>
                    ×
                </button>
                <div className="auth-content">
                    <p className="auth-eyebrow">Keep pace with your day.</p>
                    <h2 className="auth-title">Welcome to Tempo:</h2>
                    <input type="text" placeholder="What should we call you?" className="auth-input"/>
                    <input type="text" placeholder="Email" className="auth-input"/>
                    <input type="password" placeholder="i won't tell anyone!" className="auth-input"/>
                    <br/>
                    <button className="auth-submit-button" type="button">Sign in</button>
                    <button onClick={onClose} className="auth-text-button" type="button">
                    </button>
                </div>
        </div>
    )
}
