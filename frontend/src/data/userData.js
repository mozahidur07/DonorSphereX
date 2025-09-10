 
import useUserStore from '../store/userStore';
 
export const useUserData = useUserStore;
 
export const getUserData = () => {
  const userData = useUserStore.getState().userData;
  return userData || {};
};
 
export const currentUser = {};
