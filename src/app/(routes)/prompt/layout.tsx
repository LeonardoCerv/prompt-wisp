
import { createClient } from '../../../lib/utils/supabase/server';

export default async function PromptLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // This layout wraps only the prompt pages
  // You can add prompt-specific layout elements here
  return (
    <div className="prompt-layout">
        {children}
    </div>
  );
}
