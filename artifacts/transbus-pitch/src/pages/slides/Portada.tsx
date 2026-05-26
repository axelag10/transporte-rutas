export default function Portada() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col" style={{ fontFamily: "var(--font-display-family)" }}>
      {/* Fondo diagonal con gradiente */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0B1B27 55%, #132333 55%)" }} />

      {/* Franja de acento vertical */}
      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />

      {/* Puntos de fondo decorativos */}
      <div className="absolute" style={{ right: "8vw", top: "12vh", width: "28vw", height: "28vw", borderRadius: "50%", border: "1px solid rgba(41,171,226,0.12)" }} />
      <div className="absolute" style={{ right: "5vw", top: "8vh", width: "38vw", height: "38vw", borderRadius: "50%", border: "1px solid rgba(41,171,226,0.07)" }} />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "8vw" }}>

        {/* Logotipo / marca */}
        <div className="flex items-center gap-[1.2vw]" style={{ marginBottom: "4vh" }}>
          <div style={{ width: "1.2vw", height: "1.2vw", borderRadius: "50%", background: "var(--slide-primary)" }} />
          <span style={{ fontSize: "1.6vw", fontWeight: 700, letterSpacing: "0.25em", color: "var(--slide-primary)", fontFamily: "var(--font-display-family)", textTransform: "uppercase" }}>TransRutas</span>
        </div>

        {/* Titulo principal */}
        <h1 style={{ fontSize: "7.5vw", fontWeight: 800, lineHeight: 0.95, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", letterSpacing: "-0.01em", textWrap: "balance", margin: 0, marginBottom: "3vh" }}>
          Rastreo GPS<br />
          <span style={{ color: "var(--slide-primary)" }}>en tiempo real</span><br />
          para su flotilla
        </h1>

        {/* Subtitulo */}
        <p style={{ fontSize: "2.2vw", fontWeight: 400, color: "var(--slide-muted)", fontFamily: "var(--font-body-family)", margin: 0, marginBottom: "6vh" }}>
          Grupo AAZ — Zumpango, Estado de Mexico
        </p>

        {/* Linea separadora */}
        <div style={{ width: "6vw", height: "0.3vh", background: "var(--slide-primary)", marginBottom: "3vh" }} />

        <p style={{ fontSize: "1.8vw", fontWeight: 400, color: "var(--slide-muted)", fontFamily: "var(--font-body-family)", margin: 0 }}>
          Tecnologia para transportistas
        </p>
      </div>

      {/* Numero de slide */}
      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>
        01 / 07
      </div>
    </div>
  );
}
