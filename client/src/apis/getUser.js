import {useState, useEffect} from 'react';
import axiosApi from '../utils/axiosApi';
function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosApi.get('/user/me', { skipAuthInterceptor: true });
        if (res.status === 200) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}

export default useUser;
