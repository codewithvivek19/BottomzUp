/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(356, 86%, 97%)',
            '100': 'hsl(356, 86%, 94%)',
            '200': 'hsl(356, 86%, 86%)',
            '300': 'hsl(356, 86%, 76%)',
            '400': 'hsl(356, 86%, 64%)',
            '500': 'hsl(356, 86%, 50%)',
            '600': 'hsl(356, 86%, 40%)',
            '700': 'hsl(356, 86%, 32%)',
            '800': 'hsl(356, 86%, 24%)',
            '900': 'hsl(356, 86%, 16%)',
            '950': 'hsl(356, 86%, 10%)',
            DEFAULT: '#5f070d'
        },
        secondary: {
            '50': 'hsl(34, 97%, 97%)',
            '100': 'hsl(34, 97%, 94%)',
            '200': 'hsl(34, 97%, 86%)',
            '300': 'hsl(34, 97%, 76%)',
            '400': 'hsl(34, 97%, 64%)',
            '500': 'hsl(34, 97%, 50%)',
            '600': 'hsl(34, 97%, 40%)',
            '700': 'hsl(34, 97%, 32%)',
            '800': 'hsl(34, 97%, 24%)',
            '900': 'hsl(34, 97%, 16%)',
            '950': 'hsl(34, 97%, 10%)',
            DEFAULT: '#fc9e25'
        },
        accent: {
            '50': 'hsl(356, 91%, 97%)',
            '100': 'hsl(356, 91%, 94%)',
            '200': 'hsl(356, 91%, 86%)',
            '300': 'hsl(356, 91%, 76%)',
            '400': 'hsl(356, 91%, 64%)',
            '500': 'hsl(356, 91%, 50%)',
            '600': 'hsl(356, 91%, 40%)',
            '700': 'hsl(356, 91%, 32%)',
            '800': 'hsl(356, 91%, 24%)',
            '900': 'hsl(356, 91%, 16%)',
            '950': 'hsl(356, 91%, 10%)',
            DEFAULT: '#920711'
        },
        'neutral-50': '#000000',
        'neutral-100': '#ffffff',
        'neutral-200': '#e9e9e9',
        'neutral-300': '#7f675c',
        'neutral-400': '#fff7e8',
        background: '#fff7e8',
        foreground: '#000000'
    },
    fontFamily: {
        body: [
            'Times',
            'sans-serif'
        ],
        heading: [
            'Tanker',
            'sans-serif'
        ]
    },
    fontSize: {
        '12': [
            '12px',
            {
                lineHeight: 'normal'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '23.8px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '18': [
            '18px',
            {
                lineHeight: '27px'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '34px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '28.8px',
                letterSpacing: '0.48px'
            }
        ],
        '32': [
            '32px',
            {
                lineHeight: '38.4px'
            }
        ],
        '48': [
            '48px',
            {
                lineHeight: '57.6px'
            }
        ],
        '72': [
            '72px',
            {
                lineHeight: '82.8px',
                letterSpacing: '-0.936px'
            }
        ],
        '80': [
            '80px',
            {
                lineHeight: '92px',
                letterSpacing: '-2px'
            }
        ]
    },
    spacing: {
        '15': '30px',
        '20': '40px',
        '26': '52px',
        '30': '60px',
        '44': '88px',
        '50': '100px',
        '60': '120px',
        '65': '130px',
        '75': '150px',
        '208': '416px',
        '218': '436px',
        '1px': '1px'
    },
    borderRadius: {
        md: '10px',
        lg: '16px',
        xl: '20px',
        full: '999px'
    },
    boxShadow: {
        sm: 'rgb(0, 0, 0) 0px 0px 0px 1px inset',
        xs: 'rgba(0, 0, 0, 0.17) 0px 0.602187px 1.56569px -1.5px, rgba(0, 0, 0, 0.14) 0px 2.28853px 5.95019px -3px, rgba(0, 0, 0, 0.02) 0px 10px 26px -4.5px'
    },
    screens: {
        md: '768px'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '1120px'
    }
},
  },
};
