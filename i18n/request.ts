import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const localeCookie = (await cookies()).get('locale')?.value;
  const locale = localeCookie === 'en' ? 'en' : 'ar';
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
