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

export default function AuthOverlay({onClose, onRevealComplete, origin}: AuthOverlayProps) {

    const [isNewAccount, setIsNewAccount] = React.useState(true);

    function toggleNewAccount() {
        setIsNewAccount(!isNewAccount);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const email = String(data.get("email"));
        const password = String(data.get("password"));
        if (!isNewAccount) {
            const result = await authClient.signIn.email({email, password});
            if (!result.error) {
                //success
            } else {
                //error red text
            }
        } else {
            const name = String(data.get("name"));
            const result = await authClient.signUp.email({
                name,
                email,
                password,
            });
            if (!result.error) {
                //success
            } else {
                //error red text
            }
        }
    }

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
                    <input name="email" /*type="email"*/ placeholder="Email/username" className="auth-input"/><input
                    name="password" type="password" placeholder="password (i won't tell anyone!)" className="auth-input"/><br/>
                    {isNewAccount && <button className="auth-submit-button" type="submit">Create Account</button>}
                    {!isNewAccount && <button className="auth-submit-button" type="submit">Sign In</button>}
                </form>
                <span>... or  </span>
                {isNewAccount && <button onClick={toggleNewAccount} className="auth-text-button" type="button">sign in</button>}
                {!isNewAccount && <button onClick={toggleNewAccount} className="auth-text-button" type="button">create account</button>}

                <button onClick={onClose} className="auth-text-button" type="button">
                </button>
            </div>
        </div>
    )
}
