export default function ComoFunciona() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col" style={{ fontFamily: "var(--font-body-family)", background: "#0B1B27" }}>
      <div className="absolute left-0 top-0 bottom-0" style={{ width: "0.5vw", background: "var(--slide-primary)" }} />
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.5vh", background: "linear-gradient(90deg, var(--slide-primary), transparent)" }} />

      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "8vw", paddingRight: "8vw" }}>

        <div style={{ marginBottom: "2.5vh" }}>
          <span style={{ fontSize: "1.3vw", fontWeight: 600, letterSpacing: "0.2em", color: "var(--slide-primary)", textTransform: "uppercase", fontFamily: "var(--font-display-family)" }}>Operacion</span>
        </div>

        <h2 style={{ fontSize: "4.8vw", fontWeight: 800, color: "var(--slide-text)", fontFamily: "var(--font-display-family)", margin: 0, marginBottom: "5.5vh", lineHeight: 1.0, letterSpacing: "-0.01em" }}>
          Como funciona<br />
          <span style={{ color: "var(--slide-primary)" }}>en la practica</span>
        </h2>

        {/* Pasos con linea conectora */}
        <div className="flex items-start gap-0">

          <div className="flex flex-col items-center" style={{ flex: 1 }}>
            <div style={{ width: "4.5vw", height: "4.5vw", borderRadius: "50%", background: "rgba(41,171,226,0.12)", border: "0.15vw solid var(--slide-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh", flexShrink: 0 }}>
              <span style={{ fontSize: "2.2vw", fontWeight: 800, color: "var(--slide-primary)", fontFamily: "var(--font-display-family)" }}>1</span>
            </div>
            <div style={{ textAlign: "center", paddingRight: "1vw" }}>
              <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.8vh", lineHeight: 1.2 }}>El chofer abre la app</p>
              <p style={{ fontSize: "1.6vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Activa su turno con un solo toque</p>
            </div>
          </div>

          <div style={{ flex: "0 0 3vw", height: "0.2vh", background: "rgba(41,171,226,0.3)", marginTop: "2.2vw" }} />

          <div className="flex flex-col items-center" style={{ flex: 1 }}>
            <div style={{ width: "4.5vw", height: "4.5vw", borderRadius: "50%", background: "rgba(41,171,226,0.12)", border: "0.15vw solid var(--slide-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh", flexShrink: 0 }}>
              <span style={{ fontSize: "2.2vw", fontWeight: 800, color: "var(--slide-primary)", fontFamily: "var(--font-display-family)" }}>2</span>
            </div>
            <div style={{ textAlign: "center", paddingRight: "1vw" }}>
              <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.8vh", lineHeight: 1.2 }}>GPS automatico</p>
              <p style={{ fontSize: "1.6vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Posicion actualizada cada 20 segundos</p>
            </div>
          </div>

          <div style={{ flex: "0 0 3vw", height: "0.2vh", background: "rgba(41,171,226,0.3)", marginTop: "2.2vw" }} />

          <div className="flex flex-col items-center" style={{ flex: 1 }}>
            <div style={{ width: "4.5vw", height: "4.5vw", borderRadius: "50%", background: "rgba(41,171,226,0.12)", border: "0.15vw solid var(--slide-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh", flexShrink: 0 }}>
              <span style={{ fontSize: "2.2vw", fontWeight: 800, color: "var(--slide-primary)", fontFamily: "var(--font-display-family)" }}>3</span>
            </div>
            <div style={{ textAlign: "center", paddingRight: "1vw" }}>
              <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.8vh", lineHeight: 1.2 }}>Pasajeros informados</p>
              <p style={{ fontSize: "1.6vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>Ubicacion en vivo desde el navegador</p>
            </div>
          </div>

          <div style={{ flex: "0 0 3vw", height: "0.2vh", background: "rgba(41,171,226,0.3)", marginTop: "2.2vw" }} />

          <div className="flex flex-col items-center" style={{ flex: 1 }}>
            <div style={{ width: "4.5vw", height: "4.5vw", borderRadius: "50%", background: "rgba(91,191,138,0.12)", border: "0.15vw solid var(--slide-green)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2vh", flexShrink: 0 }}>
              <span style={{ fontSize: "2.2vw", fontWeight: 800, color: "var(--slide-green)", fontFamily: "var(--font-display-family)" }}>4</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.9vw", fontWeight: 600, color: "var(--slide-text)", margin: 0, marginBottom: "0.8vh", lineHeight: 1.2 }}>Turno registrado</p>
              <p style={{ fontSize: "1.6vw", fontWeight: 400, color: "var(--slide-muted)", margin: 0, lineHeight: 1.3 }}>El sistema guarda el registro completo al finalizar</p>
            </div>
          </div>

        </div>

      </div>

      <div className="absolute" style={{ right: "4vw", bottom: "4vh", fontSize: "1.4vw", color: "rgba(123,168,196,0.4)", fontFamily: "var(--font-body-family)" }}>05 / 07</div>
    </div>
  );
}
