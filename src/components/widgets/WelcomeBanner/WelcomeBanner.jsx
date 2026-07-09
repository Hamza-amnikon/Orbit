import "./WelcomeBanner.css";

function WelcomeBanner() {

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12)
        greeting = "Good Morning";

    else if (hour < 17)
        greeting = "Good Afternoon";

    return (

        <div className="welcome-banner">

            <h1>

                {greeting}, Hamza 👋

            </h1>

            <p>

                Welcome back! Here's what's happening in your organization today.

            </p>

        </div>

    );

}

export default WelcomeBanner;