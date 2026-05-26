export default function Solucion() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col" style={{ fontFamily: "var(--font-body-family)" }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0B1B27 60%, #0E2236 100%)" }} />
      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />

      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "8vw", paddingRight: "8vw" }}>

        <div style={{ marginBottom: "2.5vh" }}>
          <span style={{ fontSize: "1.3vw", fontWeight: 600, letterSpacing: "0.2em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)" }}>La plataforma</span>
        </div>

        <h2 style={{ fontSize: "5vw", fontWeight: 800, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "5vh", lineHeight: 1.0, letterSpacing: "-0.01em" }}>
          TransRutas —<br />
          <span style={{ color: "var(--slide-primary)" }}>tres componentes,</span> una sola plataforma
        </h2>

        <div className="flex gap-[3vw]">

          {/* App chofer */}
          <div className="flex-1" style={{ background: "var(--slide-card)", borderRadius: "1vw", padding: "3.5vh 2.5vw" }}>
            <div style={{ width: "4vw", height: "4vw", borderRadius: "0.8vw", background: "rgba(41,171,226,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh" }}>
              <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", background: "var(--slide-primary)" }} />
            </div>
            <p style={{ fontSize: "1.5vw", fontWeight: 600, letterSpacing: "0.1em", color: "var(--slide-primary)", textTransform: "uppercase", margin: 0, marginBottom: "1vh", fontFamily: "var(--font-display-family)" }}>App del chofer</p>
            <p style={{ fontSize: "2vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "1.5vh", lineHeight: 1.2 }}>Activa GPS con un toque, sin complicaciones</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>Compatible con cualquier telefono Android o iPhone</p>
          </div>

          {/* Mapa pasajeros */}
          <div className="flex-1" style={{ background: "var(--slide-card)", borderRadius: "1vw", padding: "3.5vh 2.5vw", outline: "0.15vw solid var(--slide-primary)" }}>
            <div style={{ width: "4vw", height: "4vw", borderRadius: "0.8vw", background: "rgba(41,171,226,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh" }}>
              <div style={{ width: "2vw", height: "1.4vw", borderRadius: "0.2vw", background: "var(--slide-primary)" }} />
            </div>
            <p style={{ fontSize: "1.5vw", fontWeight: 600, letterSpacing: "0.1em", color: "var(--slide-primary)", textTransform: "uppercase", margin: 0, marginBottom: "1vh", fontFamily: "var(--font-display-family)" }}>Ruta en vivo</p>
            <p style={{ fontSize: "2vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "1.5vh", lineHeight: 1.2 }}>Pasajeros ven la ubicacion desde el celular</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>Sin instalar nada, desde el navegador</p>
          </div>

          {/* Panel admin */}
          <div className="flex-1" style={{ background: "var(--slide-card)", borderRadius: "1vw", padding: "3.5vh 2.5vw" }}>
            <div style={{ width: "4vw", height: "4vw", borderRadius: "0.8vw", background: "rgba(41,171,226,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh" }}>
              <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "0.2vw", background: "var(--slide-primary)" }} />
            </div>
            <p style={{ fontSize: "1.5vw", fontWeight: 600, letterSpacing: "0.1em", color: "var(--slide-primary)", textTransform: "uppercase", margin: 0, marginBottom: "1vh", fontFamily: "var(--font-display-family)" }}>Panel de control</p>
            <p style={{ fontSize: "2vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "1.5vh", lineHeight: 1.2 }}>Turnos, rutas y velocidades desde la web</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>Accesible desde computadora o celular</p>
          </div>

        </div>
      </div>

      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>03 / 07</div>
    </div>
  );
}
