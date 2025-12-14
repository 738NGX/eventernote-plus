interface FooterProps {
  theme: 'light' | 'dark';
}

export default function Footer({ theme }: FooterProps) {
  const isDark = theme === 'dark';

  return (
    <footer className={`mt-auto py-8 px-6 ${isDark ? 'bg-slate-800 border-t border-slate-700' : 'bg-gray-100 border-t border-gray-200'}`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          © 2024 EventerNote. UI by EventerNote Plus.
        </div>

        <nav className="flex gap-6">
          <a href="/about" className={`text-sm transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>关于</a>
          <a href="/terms" className={`text-sm transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>条款</a>
          <a href="/privacy" className={`text-sm transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>隐私</a>
          <a href="/contact" className={`text-sm transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>联系</a>
        </nav>
      </div>
    </footer>
  );
}
