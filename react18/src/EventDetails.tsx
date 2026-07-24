interface PopupInfo { // describes the information the component expects
    /*
    isOpen: whether it should appear.
    onClose: a function it can call when the user presses Cancel.
     */
    isOpen: boolean
    onClose: () => void
}

export default function Popup({isOpen, onClose}: PopupInfo) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="popup-overlay">
            <div className="popup-panel">
                <h2>Create an event</h2>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    )
}
