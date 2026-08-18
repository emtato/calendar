import {authClient} from "../../api/auth-client";
import React from "react";

export interface UserMenuProps {
    onClose: () => void;
    user?: (typeof authClient.$Infer.Session)["user"];

}

export function UserMenu({onClose, user}: UserMenuProps) {


    return (
        <div className="user-menu-main">
            <div className="user-profile-icon-details">
                <button className="user-profile-icon user-profile-icon-edit">{user?.image ? (<img src={user.image} alt=""/>) : (
                    <span className="user-profile-initial">
                                            {user?.name.trim().charAt(0).toUpperCase() || "?"}</span>
                )}</button>
            </div>
            <button className="user-menu-button">Profile</button>

            <button className="user-menu-button">Help</button>
            <button className="user-menu-button" onClick={() => {
                authClient.signOut()
                onClose()
            }}>Logout
            </button>
            <div className="user-profile-close-details">
                <button className="auth-close-button user-menu-close-button" onClick={onClose}>×</button>
            </div>

        </div>
    )

}
