'use server'

import AppPage from "@/components/pages/app";
import { createClient } from '../lib/utils/supabase/server';
import Footer from "@/components/footer";
import Header from "@/components/header";


export default async function App() {
    const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()


  return (
    <>
      <Header user={user} />
      <AppPage />
      <Footer />
    </>

  );
}