import GamepacLogo from "@/assets/super-agents/gamepac-logo.svg";

const Header = ({ data }) => {
  if (!data) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="title">Critical Bug Report</div>

          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "#6d6d6d",
            }}
          >
            Severity : {data.severity || "Critical"}
          </div>
        </div>
        <img
          src={GamepacLogo}
          alt="Gamepac Logo"
          style={{ width: "70px", marginLeft: "0px" }}
        />
      </div>

      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "40px",
          lineHeight: "52px",
          color: "#141414",
          maxWidth: "540px",
        }}
      >
        {data.bugTitle || "Battle Pass Double Charge- v3.8.2"}
      </div>

      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "21px",
          letterSpacing: "0.16px",
          color: "#141414",
          margin: 0,
          marginTop: "8px",
          width: "100%",
        }}
      >
        {data.bugDescription ||
          "Critical payment processing issue affecting premium users across iOS and Android platforms"}
      </p>
    </div>
  );
};

export default Header;
