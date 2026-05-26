export default function Beneficios() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ fontFamily: "var(--font-body-family)", background: "#0B1B27" }}>

      {/* Mitad izquierda — fondo con acento */}
      <div className="relative flex flex-col justify-center" style={{ width: "42%", background: "linear-gradient(160deg, #132333 0%, #0D2538 100%)", padding: "0 5vw" }}>
        <div className="absolute right-0 top-0 bottom-0" style={{ width: "0.15vw", background: "rgba(41,171,226,0.2)" }} />

        <span style={{ fontSize: "1.3vw", fontWeight: 600, letterSpacing: "0.2em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)", display: "block", marginBottom: "3vh" }}>Para su empresa</span>

        <h2 style={{ fontSize: "5.5vw", fontWeight: 800, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", margin: 0, lineHeight: 0.95, letterSpacing: "-0.01em", marginBottom: "4vh" }}>
          Lo que<br />obtiene<br />
          <span style={{ color: "var(--slide-primary)" }}>Grupo AAZ</span>
        </h2>

        <div style={{ width: "5vw", height: "0.3vh", background: "var(--slide-primary)" }} />
      </div>

      {/* Mitad derecha — beneficios */}
      <div className="flex flex-col justify-center" style={{ flex: 1, padding: "0 5vw 0 4vw", gap: "2.2vh" }}>

        <div className="flex items-start gap-[1.5vw]">
          <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "var(--slide-primary)", marginTop: "0.9vh", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "2.1vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.5vh", lineHeight: 1.2 }}>Visibilidad total en tiempo real</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Cada unidad visible en el mapa al instante</p>
          </div>
        </div>

        <div style={{ height: "0.1vh", background: "rgba(41,171,226,0.12)" }} />

        <div className="flex items-start gap-[1.5vw]">
          <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "var(--slide-primary)", marginTop: "0.9vh", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "2.1vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.5vh", lineHeight: 1.2 }}>Tiempo estimado de llegada automatico</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Calculado en cada parada sin intervencion manual</p>
          </div>
        </div>

        <div style={{ height: "0.1vh", background: "rgba(41,171,226,0.12)" }} />

        <div className="flex items-start gap-[1.5vw]">
          <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "var(--slide-primary)", marginTop: "0.9vh", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "2.1vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.5vh", lineHeight: 1.2 }}>Historial completo de cada turno</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Hora de inicio, duracion, velocidad promedio y maxima</p>
          </div>
        </div>

        <div style={{ height: "0.1vh", background: "rgba(41,171,226,0.12)" }} />

        <div className="flex items-start gap-[1.5vw]">
          <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "var(--slide-green)", marginTop: "0.9vh", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "2.1vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.5vh", lineHeight: 1.2 }}>Alertas configurables</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Notificaciones por incidencia o zona definida</p>
          </div>
        </div>

      </div>

      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />
      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>04 / 07</div>
    </div>
  );
}
