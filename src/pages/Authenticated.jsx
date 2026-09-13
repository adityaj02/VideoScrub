import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Authenticated() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.name) setName(user.name);
    }, [user]);

    const saveProfile = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await updateProfile({ name });
            alert("Profile Saved");
        } catch {
            alert("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="image-bg">

            <div className="glass profile-card">

                <h2 className="login-title">
                    Welcome to Houserve
                </h2>

                <p className="company-brief">
                    Let’s complete your profile.
                </p>

                <input
                    className="input"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <button className="primaryBtn" onClick={saveProfile}>
                    {loading ? "Saving..." : "Complete Setup"}
                </button>

            </div>

        </div>
    );
}
