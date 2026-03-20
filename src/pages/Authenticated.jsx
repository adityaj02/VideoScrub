import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Authenticated() {

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) setUser(data.user);
        };
        getUser();
    }, []);

    const saveProfile = async () => {

        if (!name) return;

        setLoading(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {

            await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supabaseId: user.id,
                    email: user.email,
                    name,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                })
            });

            setLoading(false);
            alert("Profile Saved");
        });
    };

    if (!user) return null;

    return (
        <div className="image-bg">

            <div className="glass profile-card">

                <h2 className="login-title">
                    Welcome to Boys@Work
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
