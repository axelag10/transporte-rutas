export default function SiguientePaso() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col" style={{ fontFamily: "var(--font-body-family)", background: "#0B1B27" }}>

      {/* Fondo dividido */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0B1B27 50%, #0E2236 50%)" }} />

      {/* Franja lateral */}
      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />

      {/* Franja inferior de acento */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "0.6vh", background: "var(--slide-primary)" }} />

      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "8vw", paddingRight: "8vw" }}>

        <div className="flex items-center gap-[8vw]">

          {/* Izquierda */}
          <div style={{ flex: "0 0 50%" }}>
            <span style={{ fontSize: "1.3vw", fontWeight: 600, letterSpacing: "0.2em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)", display: "block", marginBottom: "3vh" }}>Propuesta</span>

            <h2 style={{ fontSize: "5.5vw", fontWeight: 800, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "4vh", lineHeight: 0.95, letterSpacing: "-0.01em" }}>
              Siguiente<br />
              <span style={{ color: "var(--slide-primary)" }}>paso</span>
            </h2>

            <p style={{ fontSize: "2.1vw", fontWeight: 500, color: "var(--slide-text)", margin: 0, marginBottom: "1.5vh", lineHeight: 1.3 }}>
              Prueba piloto con una ruta y tres unidades
            </p>
            <p style={{ fontSize: "1.9vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>
              Demostramos resultados antes de cualquier compromiso
            </p>
          </div>

          {/* Derecha — CTA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5vh" }}>

            <div style={{ background: "rgba(41,171,226,0.08)", borderRadius: "1vw", padding: "3vh 2.5vw", border: "0.15vw solid rgba(41,171,226,0.25)" }}>
              <p style={{ fontSize: "1.4vw", fontWeight: 600, letterSpacing: "0.12em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "1.2vh" }}>Sin costo inicial</p>
              <p style={{ fontSize: "1.8vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>La prueba piloto no requiere inversion previa. El objetivo es mostrar el valor del sistema en operacion real.</p>
            </div>

            <div style={{ background: "rgba(91,191,138,0.06)", borderRadius: "1vw", padding: "3vh 2.5vw", border: "0.15vw solid rgba(91,191,138,0.25)" }}>
              <p style={{ fontSize: "1.4vw", fontWeight: 600, letterSpacing: "0.12em", color: "var(--slide-green)", textTransform: "uppercase", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "1.2vh" }}>Contacto</p>
              <p style={{ fontSize: "2vw", fontWeight: 500, color: "var(--slide-text)", margin: 0 }}>contacto@transrutas.mx</p>
            </div>

          </div>

        </div>

        {/* Marca al pie */}
        <div className="absolute" style={{ left: "8vw", bottom: "4vh", display: "flex", alignItems: "center", gap: "1vw" }}>
          <div style={{ width: "0.8vw", height: "0.8vw", borderRadius: "50%", background: "var(--slide-primary)" }} />
          <span style={{ fontSize: "1.4vw", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(41,171,226,0.6)", fontFamily: "var(--font-display-family)", textTransform: "uppercase" }}>TransRutas</span>
        </div>

      </div>

      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>07 / 07</div>
    </div>
  );
}
