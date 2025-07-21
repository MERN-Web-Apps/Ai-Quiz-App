import { useLocation } from "react-router-dom";
function Profile() {
  const location = useLocation();
  const user = location.state?.user || null;
  if (!user) {
    return <div>User not found</div>;
  }
  return (
    <div>
      <h2>Profile Page</h2>
      {/* Add profile details and functionality here */}
    </div>
  );
}

export default Profile;
