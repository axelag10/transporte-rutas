export default function Problema() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col" style={{ fontFamily: "var(--font-body-family)" }}>
      <div className="absolute inset-0" style={{ background: "#0B1B27" }} />
      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />

      {/* Franja superior de acento */}
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.5vh", background: "linear-gradient(90deg, var(--slide-primary), transparent)" }} />

      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "8vw", paddingRight: "8vw" }}>

        {/* Etiqueta */}
        <div style={{ marginBottom: "3vh" }}>
          <span style={{ fontSize: "1.3vw", fontWeight: 600, letterSpacing: "0.2em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)" }}>El problema de hoy</span>
        </div>

        {/* Titulo */}
        <h2 style={{ fontSize: "4.8vw", fontWeight: 800, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "6vh", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Tres brechas que afectan<br />su operacion cada dia
        </h2>

        {/* Tres problemas en columnas */}
        <div className="flex gap-[3vw]">

          <div className="flex-1" style={{ background: "var(--slide-card)", borderRadius: "1vw", padding: "3.5vh 2.5vw", borderLeft: "0.4vw solid rgba(229,77,77,0.7)" }}>
            <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "rgba(229,77,77,0.8)", fontFamily: "var(--font-display-family)", marginBottom: "1.5vh" }}>01</div>
            <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "1.2vh", lineHeight: 1.2 }}>Pasajeros sin informacion</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>No saben cuanto falta para que llegue la van</p>
          </div>

          <div className="flex-1" style={{ background: "var(--slide-card)", borderRadius: "1vw", padding: "3.5vh 2.5vw", borderLeft: "0.4vw solid rgba(229,77,77,0.7)" }}>
            <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "rgba(229,77,77,0.8)", fontFamily: "var(--font-display-family)", marginBottom: "1.5vh" }}>02</div>
            <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "1.2vh", lineHeight: 1.2 }}>Sin visibilidad en campo</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>Los supervisores no pueden ver donde esta cada unidad</p>
          </div>

          <div className="flex-1" style={{ background: "var(--slide-card)", borderRadius: "1vw", padding: "3.5vh 2.5vw", borderLeft: "0.4vw solid rgba(229,77,77,0.7)" }}>
            <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "rgba(229,77,77,0.8)", fontFamily: "var(--font-display-family)", marginBottom: "1.5vh" }}>03</div>
            <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "1.2vh", lineHeight: 1.2 }}>Sin datos historicos</p>
            <p style={{ fontSize: "1.7vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.4 }}>Dificil detectar incumplimientos o tardanzas</p>
          </div>

        </div>
      </div>

      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>02 / 07</div>
    </div>
  );
}
