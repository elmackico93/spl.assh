import React, { useState } from 'react';
import Head from 'next/head';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Navbar, NavbarBrand, NavbarToggler, NavbarCollapse, NavbarNav, NavItem, NavLink } from '@/components/layout/Navbar';
import { Container } from '@/components/layout/Container';
import { Row } from '@/components/layout/Row';
import { Col } from '@/components/layout/Col';
import { Footer } from '@/components/layout/Footer';
import { useTheme } from '@/context/ThemeContext';
import CodeRain from '@/components/effects/CodeRain';
import GlitchText from '@/components/effects/GlitchText';
import Terminal from '@/components/effects/Terminal';
import Scanline from '@/components/effects/Scanline';
import NeuralNetwork from '@/components/effects/NeuralNetwork';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Terminal commands
  const terminalCommands = {
    theme: () => {
      toggleTheme();
      return `Theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    },
    matrix: () => 'Welcome to the Matrix...',
  };

  return (
    <>
      <Head>
        <title>Matrix.css Next.js Framework</title>
        <meta name="description" content="A cyberpunk-inspired UI component library for Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <CodeRain
        className="fixed inset-0 -z-10 opacity-50"
        density="low"
        glitchEffect={true}
      />

      <Navbar fixed>
        <NavbarBrand>
          <GlitchText text="MATRIX.CSS" intensity="light" />
        </NavbarBrand>
        <NavbarToggler
          isOpen={isNavOpen}
          onClick={() => setIsNavOpen(!isNavOpen)}
        />
        <NavbarCollapse isOpen={isNavOpen}>
          <NavbarNav className="ml-auto">
            <NavItem>
              <NavLink href="#components" active>Components</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#effects">Effects</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#documentation">Docs</NavLink>
            </NavItem>
            <NavItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </NavItem>
          </NavbarNav>
        </NavbarCollapse>
      </Navbar>

      <main className="py-20">
        <Container>
          <div className="text-center mb-16 relative">
            <h1 className="text-4xl md:text-6xl mb-4 relative inline-block">
              <span className="animate-glow-pulse">MATRIX.CSS</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl">
              A cyberpunk-inspired UI component library for Next.js
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="primary" hasGlow>Get Started</Button>
              <Button variant="outline">Documentation</Button>
            </div>
          </div>

          <section id="components" className="mb-20">
            <h2 className="text-3xl mb-6 border-b border-matrix-border pb-2">UI Components</h2>
            
            <Row>
              <Col xs="12" md="6" lg="4" className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Core UI Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Explore our Matrix-styled components for your Next.js projects.</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary">Button</Badge>
                      <Badge variant="secondary">Card</Badge>
                      <Badge variant="outline">Alert</Badge>
                      <Badge variant="info">Badge</Badge>
                      <Badge variant="success">Modal</Badge>
                    </div>
                    <Progress value={75} max={100} variant="striped" showLabel />
                  </CardContent>
                  <CardFooter>
                    <Button variant="terminal" size="sm" onClick={() => setIsModalOpen(true)}>View Demo</Button>
                  </CardFooter>
                </Card>
              </Col>

              <Col xs="12" md="6" lg="4" className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Powerful components for building complex interfaces.</p>
                    <Alert variant="info" className="mb-4">
                      <AlertTitle>New Components Available</AlertTitle>
                      <AlertDescription>Check out our latest additions to the Matrix.css framework.</AlertDescription>
                    </Alert>
                    <Progress value={45} max={100} color="info" showLabel />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Explore</Button>
                  </CardFooter>
                </Card>
              </Col>

              <Col xs="12" md="6" lg="4" className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Responsive grid system for perfect layouts on any device.</p>
                    <div className="grid grid-cols-6 gap-1 mb-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-6 bg-matrix-primary bg-opacity-20 border border-matrix-border"></div>
                      ))}
                    </div>
                    <Progress value={90} max={100} color="success" showLabel />
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm">Learn More</Button>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </section>
          
          <section id="effects" className="mb-20">
            <h2 className="text-3xl mb-6 border-b border-matrix-border pb-2">Matrix Effects</h2>
            
            <Row>
              <Col xs="12" md="6" className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Neural Network Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NeuralNetwork height="200px" />
                  </CardContent>
                </Card>
              </Col>
              
              <Col xs="12" md="6" className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Terminal Emulator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Terminal
                      height="200px"
                      initialCommands={['echo Welcome to Matrix.css Terminal', 'help']}
                      commands={terminalCommands}
                    />
                  </CardContent>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col xs="12" className="mb-6">
                <Scanline intensity="medium">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visual Effects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">Matrix.css includes various cyberpunk-inspired visual effects:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-matrix-border rounded bg-matrix-bg bg-opacity-50">
                          <h4 className="font-matrix-hacker mb-2">Glitch Text</h4>
                          <GlitchText text="MATRIX" />
                        </div>
                        <div className="p-4 border border-matrix-border rounded bg-matrix-bg bg-opacity-50">
                          <h4 className="font-matrix-hacker mb-2">Code Rain</h4>
                          <div className="h-20 relative">
                            <CodeRain density="high" />
                          </div>
                        </div>
                        <div className="p-4 border border-matrix-border rounded bg-matrix-bg bg-opacity-50">
                          <h4 className="font-matrix-hacker mb-2">Scanlines</h4>
                          <Scanline intensity="heavy" type="horizontal">
                            <div className="h-20 flex items-center justify-center">
                              <span className="animate-glow-pulse">SYSTEM ONLINE</span>
                            </div>
                          </Scanline>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Scanline>
              </Col>
            </Row>
          </section>
        </Container>
      </main>

      <Footer>
        <div className="text-center">
          <p className="text-sm text-matrix-text-dim">
            © {new Date().getFullYear()} Matrix.css | A Next.js UI Framework inspired by The Matrix
          </p>
        </div>
      </Footer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-2xl"
      >
        <ModalHeader>
          <h3 className="text-xl font-bold">Component Library Demo</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <h4 className="text-lg">Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="terminal">Terminal</Button>
              <Button variant="danger">Danger</Button>
            </div>
            
            <h4 className="text-lg pt-4">Alerts</h4>
            <div className="space-y-2">
              <Alert variant="primary">
                <AlertTitle>Primary Alert</AlertTitle>
                <AlertDescription>This is a primary alert — check it out!</AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>Success Alert</AlertTitle>
                <AlertDescription>Operation completed successfully.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>Warning Alert</AlertTitle>
                <AlertDescription>Proceed with caution.</AlertDescription>
              </Alert>
              <Alert variant="danger">
                <AlertTitle>Danger Alert</AlertTitle>
                <AlertDescription>Critical error detected.</AlertDescription>
              </Alert>
            </div>
            
            <h4 className="text-lg pt-4">Progress</h4>
            <div className="space-y-2">
              <Progress value={25} max={100} />
              <Progress value={50} max={100} variant="striped" />
              <Progress value={75} max={100} variant="animated" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Close</Button>
          <Button variant="primary">View All Components</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}