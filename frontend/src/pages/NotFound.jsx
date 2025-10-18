import Navbar from "../components/Navbar";

function NotFound() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '80px', textAlign: 'center', minHeight: '60vh' }}>
                <h1>404 Not Found</h1>
                <p>The page you're looking for doesn't exist!</p>
            </div>
        </>
    );
}

export default NotFound;