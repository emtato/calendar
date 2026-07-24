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
                    top: position.y - 120,
                }}
            >

                <div className="event-popup">
                    <button className="icon-button drag-button" type="button" aria-label="Move popup">☰</button>
                    <button
                        className="icon-button close-button"
                        type="button"
                        aria-label="Close popup"
                        onClick={onClose}
                    >
                        ×
                    </button>
                    <div className="event-content">
                        <input
                            className="title-input"
                            placeholder="Add title and time"
                        />
                        <div className="form-row">
                            <span className="row-icon">◷</span>
                            <div className="row-content">
                                <div>Tuesday, July 7 – Tuesday, July 7</div>
                                <div className="secondary-text">Does not repeat</div>
                            </div>
                            <button className="outline-button">Add time</button>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">♙</span>
                            <span className="secondary-text">Add guests</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">⌖</span>
                            <span className="secondary-text">Add location</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">☰</span>
                            <span className="secondary-text">Add description</span>
                        </div>
                    </div>
                    <div className="popup-actions">
                        <button className="text-button">More options</button>
                        <button className="save-button">Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}




