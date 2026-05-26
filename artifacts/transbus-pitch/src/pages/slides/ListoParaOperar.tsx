export default function ListoParaOperar() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ fontFamily: "var(--font-body-family)", background: "#0B1B27" }}>
      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />

      {/* Bloque de fondo decorativo */}
      <div className="absolute" style={{ right: 0, top: 0, bottom: 0, width: "38%", background: "linear-gradient(160deg, #132333 0%, #0E2236 100%)", borderLeft: "0.15vw solid rgba(41,171,226,0.15)" }} />

      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "8vw", paddingRight: "8vw" }}>

        <div className="flex gap-[6vw] items-center">

          {/* Izquierda — titulo y puntos */}
          <div style={{ flex: "0 0 52%" }}>
            <span style={{ fontSize: "1.3vw", fontWeight: 600, letterSpacing: "0.2em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)", display: "block", marginBottom: "2.5vh" }}>Instalacion</span>

            <h2 style={{ fontSize: "5vw", fontWeight: 800, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "4.5vh", lineHeight: 0.95, letterSpacing: "-0.01em" }}>
              Listo para<br />
              <span style={{ color: "var(--slide-primary)" }}>operar desde</span><br />
              el primer dia
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>

              <div className="flex items-center gap-[1.2vw]">
                <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", background: "rgba(41,171,226,0.15)", border: "0.12vw solid var(--slide-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", background: "var(--slide-primary)" }} />
                </div>
                <p style={{ fontSize: "1.9vw", fontWeight: 500, color: "var(--slide-text)", margin: 0 }}>Compatible con Android e iPhone</p>
              </div>

              <div className="flex items-center gap-[1.2vw]">
                <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", background: "rgba(41,171,226,0.15)", border: "0.12vw solid var(--slide-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", background: "var(--slide-primary)" }} />
                </div>
                <p style={{ fontSize: "1.9vw", fontWeight: 500, color: "var(--slide-text)", margin: 0 }}>Sin hardware adicional</p>
              </div>

              <div className="flex items-center gap-[1.2vw]">
                <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", background: "rgba(41,171,226,0.15)", border: "0.12vw solid var(--slide-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", background: "var(--slide-primary)" }} />
                </div>
                <p style={{ fontSize: "1.9vw", fontWeight: 500, color: "var(--slide-text)", margin: 0 }}>Panel accesible desde computadora o celular</p>
              </div>

            </div>
          </div>

          {/* Derecha — detalle tecnico */}
          <div style={{ flex: 1 }}>
            <div style={{ background: "rgba(41,171,226,0.06)", borderRadius: "1vw", padding: "3.5vh 2.5vw", border: "0.12vw solid rgba(41,171,226,0.2)" }}>
              <p style={{ fontSize: "1.5vw", fontWeight: 600, letterSpacing: "0.12em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "2.5vh" }}>Configuracion</p>

              <p style={{ fontSize: "1.8vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, marginBottom: "1.5vh", lineHeight: 1.4 }}>Rutas, paradas y unidades se configuran directamente desde el panel de administracion.</p>
              <p style={{ fontSize: "1.8vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>No requiere conocimientos tecnicos para operar.</p>
            </div>
          </div>

        </div>

      </div>

      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>06 / 07</div>
    </div>
  );
}
