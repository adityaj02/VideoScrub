export default function Branding({ visible }) {
    return (
        <div className={`text-center ${visible ? "fade-in-up" : "fade-hidden-down"}`}>
            <h1 className="premium-text brand-title">
                Houserve
            </h1>
            <p className="brand-sub">
                Premium Services • EST 2024
            </p>
        </div>
    );
}
