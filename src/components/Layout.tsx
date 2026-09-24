import { Html, type PropsWithChildren } from '@elysiajs/html'

interface LayoutProps {
  title: string
}

export const Layout = ({ title, children }: PropsWithChildren<LayoutProps>) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        :root {
          --color-background: #faf5f1;
          --color-surface: #ffffff;
          --color-surface-muted: #c8c4c1;
          --color-text-primary: #000000;
          --color-text-secondary: #0d061e;
          --color-text-muted: #4b4a48;
          --color-border: #ffffff;
          --color-primary: #150079;
          --color-secondary: #6e47ff;
          --color-accent: #ffc1a1;
          --color-primary-hover: #0e0052;
          --color-danger: #fe8fa1;
          --color-warning: #fff4a2;
          --color-success: #54c423;
          --color-info: #1264a3;
          --font-body: 'Gellix', ui-sans-serif, system-ui, sans-serif;
          --font-heading: 'UlmGrotesk', Gellix, ui-sans-serif, sans-serif;
        }
        .grad-1 { background: linear-gradient(180deg, var(--color-background), var(--color-surface)); }
        .grad-2 { background: radial-gradient(circle, var(--color-background), #FFE0D0, var(--color-secondary), var(--color-primary), var(--color-primary)); }
        .grad-3 { background: radial-gradient(circle, rgba(255, 187, 152, 0), rgba(255, 187, 152, 0.2), var(--color-primary), var(--color-secondary), #9E84FF); }
        .grad-4 { background: linear-gradient(180deg, var(--color-surface), var(--color-background)); }
        .grad-5 { background: radial-gradient(circle, #9E84FF, #8666FF, var(--color-secondary), #5835DE, #4224BC, #2B129B, var(--color-primary), rgba(255, 187, 152, 0.2), rgba(255, 187, 152, 0)); }
        body { background-color: var(--color-background); color: var(--color-text-primary); font-family: var(--font-body); }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
      <script>{`
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                background: 'var(--color-background)', surface: 'var(--color-surface)',
                'surface-muted': 'var(--color-surface-muted)', 'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)', 'text-muted': 'var(--color-text-muted)',
                border: 'var(--color-border)', primary: 'var(--color-primary)', secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)', 'primary-hover': 'var(--color-primary-hover)',
                danger: 'var(--color-danger)', warning: 'var(--color-warning)', success: 'var(--color-success)', info: 'var(--color-info)',
              },
              fontFamily: { body: ['Gellix','ui-sans-serif','system-ui','sans-serif'], heading: ['UlmGrotesk','Gellix','ui-sans-serif','sans-serif'] },
              spacing: { '3xs':'2px','2xs':'4px','xs':'6px','sm':'8px','md':'10px','lg':'12px','xl':'14px','2xl':'16px','3xl':'20px','4xl':'22px','5xl':'24px','section':'112px' },
              borderRadius: { 'xs':'2px','sm':'3px','md':'4px','lg':'7px','xl':'8px','2xl':'10px','3xl':'11px','full':'9999px','button':'14px','card':'26px' },
              boxShadow: { 'xs':'0px 0px 0px 0px rgba(0,0,0,0)','sm':'0px 0px 11px 0px rgba(46,30,107,0.04)','md':'0px 5px 10px 0px rgba(26,24,41,0.06)','lg':'0px 8px 24px 0px rgba(26,24,43,0.12)','xl':'0px 20px 48px 0px rgba(26,24,43,0.12)' }
            }
          }
        }
      `}</script>
    </head>
    <body class="antialiased min-h-screen flex flex-col">
      {children}
    </body>
  </html>
)
