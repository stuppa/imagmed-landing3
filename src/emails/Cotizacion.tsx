/** @jsxRuntime automatic @jsxImportSource react */
// Correo de una solicitud del formulario (React Email). Mismo lenguaje que la página (src/styles/global.css): fondo negro,
// etiquetas espaciadas, título delgado con una palabra en cursiva azul, botones cuadrados y el equipo sobre un resplandor
// azul como en el hero. Estilos en línea: es lo que respetan Outlook, Gmail y Zoho; el <style> solo acomoda el celular
// donde se soporta, y el degradado es extra.
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  render,
} from '@react-email/components';
import type { CSSProperties, ReactNode } from 'react';
import { ORIGEN, type DatosCorreo } from '../lib/cotizacion';

const NEGRO = '#03060D';
const NOCHE = '#071226';
const MARCA = '#0066DD';
const MARCA_CLARO = '#4D94E7';
const SUAVE = '#9AA4B5';
const LINEA = '#1C2638';

const CELULAR = `@media (max-width:520px){
.col{display:block!important;width:auto!important}
.col2{border-left:0!important}
.boton{display:block!important;margin:0 0 8px!important;text-align:center!important}
.titulo{font-size:30px!important}
}`;

const etiqueta: CSSProperties = {
  margin: 0,
  color: SUAVE,
  fontSize: 12,
  lineHeight: 1.4,
  fontWeight: 600,
  letterSpacing: 2,
  textTransform: 'uppercase',
};
const valor: CSSProperties = { margin: '6px 0 0', color: '#ffffff', fontSize: 17, lineHeight: 1.4, fontWeight: 600 };
const panel: CSSProperties = { background: NOCHE, border: `1px solid ${LINEA}` };
const enlace: CSSProperties = { color: '#ffffff', textDecoration: 'none' };

function Boton({ href, children, principal = false }: { href: string; children: string; principal?: boolean }) {
  return (
    <Button
      href={href}
      className="boton"
      style={{
        margin: '0 8px 8px 0',
        padding: '15px 24px',
        border: `1px solid ${principal ? MARCA : '#3A4558'}`,
        background: principal ? MARCA : NEGRO,
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Button>
  );
}

function Dato({ titulo, children, segunda = false }: { titulo: string; children: ReactNode; segunda?: boolean }) {
  return (
    <Column
      className={segunda ? 'col col2' : 'col'}
      style={{
        width: '50%',
        padding: '18px 24px',
        borderTop: `1px solid ${LINEA}`,
        borderLeft: segunda ? `1px solid ${LINEA}` : undefined,
        verticalAlign: 'top',
      }}
    >
      <Text style={etiqueta}>{titulo}</Text>
      <Text style={{ ...valor, wordBreak: 'break-word' }}>{children}</Text>
    </Column>
  );
}

export default function Cotizacion(d: DatosCorreo) {
  return (
    <Html lang="es">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,700&display=swap"
          rel="stylesheet"
        />
        <style>{CELULAR}</style>
      </Head>
      <Preview>{`${d.equipo} · ${d.nombre} · ${d.cuando}`}</Preview>
      <Body style={{ margin: 0, background: NEGRO }}>
        <Container
          style={{
            maxWidth: 600,
            padding: '0 16px',
            color: '#ffffff',
            fontFamily: "'Source Sans 3','Segoe UI',Helvetica,Arial,sans-serif",
          }}
        >
          <Section style={{ padding: '32px 0 24px', borderBottom: `1px solid ${LINEA}` }}>
            <Img
              src={`${ORIGEN}/logo-correo.png`}
              width="140"
              height="32"
              alt="IMAGMED"
              style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, letterSpacing: 2 }}
            />
          </Section>

          <Section style={{ padding: '40px 0 0' }}>
            <Text style={{ ...etiqueta, color: MARCA_CLARO }}>
              Formulario del sitio
              {d.urgente && (
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: 12,
                    padding: '3px 8px',
                    background: MARCA,
                    color: '#ffffff',
                    letterSpacing: 1.5,
                  }}
                >
                  Urgente
                </span>
              )}
            </Text>
            <Heading
              as="h1"
              className="titulo"
              style={{
                margin: '16px 0 0',
                color: '#ffffff',
                fontSize: 40,
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: -0.5,
              }}
            >
              Nueva solicitud de <em style={{ color: MARCA_CLARO, fontWeight: 700 }}>{d.solicitud.toLowerCase()}</em>.
            </Heading>
            <Text style={{ margin: '16px 0 0', color: SUAVE, fontSize: 17, lineHeight: 1.5 }}>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{d.nombre}</span> la envió el {d.fecha} (hora del
              centro de México).
            </Text>
          </Section>

          <Section style={{ padding: '28px 0 0' }}>
            <Boton href={d.mailto} principal>
              Responder por correo
            </Boton>
            <Boton href={d.whatsapp}>WhatsApp</Boton>
            <Boton href={d.tel}>Llamar</Boton>
          </Section>

          <Section style={{ padding: '28px 0 0' }}>
            <Section style={{ ...panel, borderTop: `3px solid ${MARCA}` }}>
              {d.foto && (
                <Row>
                  <Column
                    align="center"
                    style={{
                      padding: '28px 24px 8px',
                      backgroundColor: NOCHE,
                      backgroundImage:
                        'radial-gradient(ellipse at center,rgba(0,102,221,0.45) 0%,rgba(7,18,38,0) 62%)',
                    }}
                  >
                    <Img src={d.foto} width="240" height="240" alt={d.equipo} />
                  </Column>
                </Row>
              )}
              <Row>
                <Column
                  style={{ padding: d.foto ? '12px 24px 22px' : '24px 24px 22px', textAlign: d.foto ? 'center' : 'left' }}
                >
                  <Text style={etiqueta}>Equipo</Text>
                  <Text style={{ ...valor, margin: '8px 0 0', fontSize: 28, lineHeight: 1.2 }}>{d.equipo}</Text>
                </Column>
              </Row>
              <Row>
                <Dato titulo="Cliente">{d.nombre}</Dato>
                <Dato titulo="¿Cuándo lo necesita?" segunda>
                  {d.cuando}
                </Dato>
              </Row>
              <Row>
                <Dato titulo="Teléfono">
                  <Link href={d.tel} style={enlace}>
                    {d.telefono}
                  </Link>
                </Dato>
                <Dato titulo="Correo" segunda>
                  <Link href={d.mailto} style={enlace}>
                    {d.correo}
                  </Link>
                </Dato>
              </Row>
            </Section>
          </Section>

          {d.proyeccion.length > 0 && (
            <Section style={{ padding: '16px 0 0' }}>
              <Section style={{ ...panel, borderLeft: `3px solid ${MARCA}` }}>
                <Row>
                  <Column style={{ padding: '20px 24px' }}>
                    <Text style={{ ...etiqueta, color: MARCA_CLARO }}>Proyección de la calculadora</Text>
                    {d.proyeccion.map((l) => (
                      <Text key={l} style={{ margin: '8px 0 0', color: '#ffffff', fontSize: 15, lineHeight: 1.4 }}>
                        {l}
                      </Text>
                    ))}
                  </Column>
                </Row>
              </Section>
            </Section>
          )}

          <Section style={{ padding: '36px 0 40px' }}>
            <Text
              style={{
                margin: 0,
                paddingTop: 24,
                borderTop: `1px solid ${LINEA}`,
                color: SUAVE,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Responde este correo para escribirle directo al cliente.
              <br />
              <span style={{ letterSpacing: 2, textTransform: 'uppercase' }}>IMAGMED Nacional</span> ·{' '}
              <Link href={ORIGEN} style={{ color: SUAVE }}>
                imagmed.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const htmlCotizacion = (d: DatosCorreo) => render(<Cotizacion {...d} />);
