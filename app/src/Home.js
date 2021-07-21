import * as React from 'react';
import { AuthContext } from './context/AuthProvider';
import Navigation from './navigation';

export default function Home() {
  const authContext = React.useContext(AuthContext);

  return <Navigation colorScheme={"light"} isLoggedIn={authContext.isLoggedIn} isLoading={authContext.isLoading} />;
}