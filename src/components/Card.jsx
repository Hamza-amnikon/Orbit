/*style for home card */
function Card(props) {

  const cardStyle = {
    width: "220px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "white",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
  };

  return (
    <div style={cardStyle}>
      <h2>{props.number}</h2>
      <p>{props.title}</p>
    </div>
  );
}

export default Card;