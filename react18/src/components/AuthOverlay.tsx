import {authClient} from "../api/auth-client";
import React from "react";

interface AuthOverlayProps {
    onClose: () => void;
    onRevealComplete: () => void;
    origin: {
        x: number;
        y: number;
    };
    onAuthSuccess: () => void;
}

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const result = await authClient.signIn.email({
        email,
        password,
    });
   /* const result = await authClient.signUp.email({
        name,
        email,
        password,
    });*/


}

export default function AuthOverlay({onClose, onRevealComplete, origin}: AuthOverlayProps) {
    const [isNewAccount, setIsNewAccount] = React.useState(false);

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
                <form onSubmit={handleSubmit}>

                    {isNewAccount && <input name="name" placeholder="What should we call you?" className="auth-input"/>}
                    {!isNewAccount && <><input name="email" /*type="email"*/ placeholder="Email/username" className="auth-input"/><input
                        name="password" type="password" placeholder="password (i won't tell anyone!)" className="auth-input"/><br/>
                        <button className="auth-submit-button" type="submit">Sign in</button>
                    </>}
                </form>
                <button onClick={onClose} className="auth-text-button" type="button">
                </button>
            </div>
        </div>
    )
}
