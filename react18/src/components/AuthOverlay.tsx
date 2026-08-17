interface AuthOverlayProps {
    onClose: () => void;
}

export default function AuthOverlay({onClose}: AuthOverlayProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4">Welcome to CalendarApp</h2>
                <p className="text-gray-600 mb-6">Please sign in to continue.</p>
                <button
                    onClick={onClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                </button>
            </div>
        </div>
    )
}
