import { useState } from 'react';
import Head from 'next/head';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import CodeRain from '@/components/effects/CodeRain';
import { MatrixNavbar } from '@/components/layout/Navbar';
import { MatrixHero } from '@/components/layout/MatrixHero';

export default function Home() {
  // Define active link state for demonstration
  const [activeLink, setActiveLink] = useState('GETTING_STARTED');
  
  // Custom links with active state
  const navLinks = [
    { number: '01', text: 'GETTING_STARTED', href: '#getting-started', isActive: activeLink === 'GETTING_STARTED' },
    { number: '02', text: 'COMPONENTS', href: '#components', isActive: activeLink === 'COMPONENTS' },
    { number: '03', text: 'UTILITIES', href: '#utilities', isActive: activeLink === 'UTILITIES' },
    { number: '04', text: 'EXAMPLES', href: '#examples', isActive: activeLink === 'EXAMPLES' },
    { number: '05', text: 'GITHUB', href: 'https://github.com/example/matrix-css', isActive: activeLink === 'GITHUB' },
  ];

  return (
    <>
      <Head>
        <title>Matrix.css - A Cyberpunk CSS Framework</title>
        <meta name="description" content="The ultimate Matrix-inspired CSS framework" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Matrix-themed background effect */}
      <CodeRain 
        className="fixed inset-0 -z-10 opacity-70" 
        density="medium"
        charSet="matrix"
        glitchEffect={true}
      />

      {/* Enhanced Matrix Navbar */}
      <MatrixNavbar 
        logoText="MATRIX.CSS" 
        statusText="SYSTEM ONLINE"
        links={navLinks}
      />

      {/* Matrix Hero Section */}
      <MatrixHero 
        title="MATRIX.CSS"
        subtitle="Immerse your users in the digital realm with the complete Matrix-inspired design framework. Build stunning cyberpunk interfaces with minimal effort."
        primaryCta={{ text: "ENTER THE MATRIX", href: "#getting-started" }}
        secondaryCta={{ text: "EXPLORE COMPONENTS", href: "#components" }}
        showVersion={true}
        version="VERSION 2.0"
      />

      {/* Main content with proper spacing */}
      <main>
        <Container>
          <section id="getting-started" className="py-20">
            <h2 className="text-3xl mb-6 border-b border-matrix-border pb-2">Getting Started</h2>
            {/* Your getting started content here */}
          </section>
        </Container>
      </main>
    </>
  );
}