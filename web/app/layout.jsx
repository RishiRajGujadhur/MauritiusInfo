import '@radix-ui/themes/styles.css';
import './styles.css';

export const metadata = {
  title: 'Access Mauritius',
  description: 'Find places and reported wheelchair access across Mauritius.',
};

export default function Layout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
