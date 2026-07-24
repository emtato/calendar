interface PopupInfo { // describes the information the component expects
    /*
    isOpen: whether it should appear.
    onClose: a function it can call when the user presses Cancel.
     */
    isOpen: boolean
    onClose: () => void
    position: {
        x: number; y: number
    }
}

export default function Popup({isOpen, onClose, position}: PopupInfo) {
    if (!isOpen) {
        return null
    }

    return (

        <div className="popup-overlay">
            <div

                style={{
                    position: "fixed",
                    left: position.x + 40,
                    top: position.y-120,
                    width: "28vw",
                    height: "50vh",
                    padding: "24px",
                    borderRadius: "16px",
                    background: "white",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}

            >

                <h2>Create an event</h2>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    )
}






